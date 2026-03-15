import tempfile
import unittest
import zipfile
from pathlib import Path

import numpy as np
import pydicom
from pydicom.dataset import Dataset, FileDataset, FileMetaDataset
from pydicom.uid import ExplicitVRLittleEndian, generate_uid

from dicom_processor import load_cbct_series, load_cbct_zip


def _write_slice(path: Path, instance_number: int, z_pos: float, fill: int) -> None:
    file_meta = FileMetaDataset()
    file_meta.MediaStorageSOPClassUID = generate_uid()
    file_meta.MediaStorageSOPInstanceUID = generate_uid()
    file_meta.ImplementationClassUID = generate_uid()
    file_meta.TransferSyntaxUID = ExplicitVRLittleEndian

    ds = FileDataset(str(path), {}, file_meta=file_meta, preamble=b"\0" * 128)
    ds.is_little_endian = True
    ds.is_implicit_VR = False

    arr = np.full((16, 20), fill, dtype=np.uint16)

    ds.PatientName = "Unit Test"
    ds.Modality = "CT"
    ds.Rows = arr.shape[0]
    ds.Columns = arr.shape[1]
    ds.PixelSpacing = [0.25, 0.25]
    ds.SliceThickness = "1.5"
    ds.InstanceNumber = int(instance_number)
    ds.ImagePositionPatient = [0.0, 0.0, float(z_pos)]

    ds.SamplesPerPixel = 1
    ds.PhotometricInterpretation = "MONOCHROME2"
    ds.BitsAllocated = 16
    ds.BitsStored = 16
    ds.HighBit = 15
    ds.PixelRepresentation = 0
    ds.RescaleSlope = 1
    ds.RescaleIntercept = 0
    ds.PixelData = arr.tobytes()
    ds.save_as(str(path))


class CbctSeriesLoaderTests(unittest.TestCase):
    def test_load_cbct_series_from_folder(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            # Write intentionally unsorted slices.
            _write_slice(root / "slice_5.dcm", instance_number=5, z_pos=5.0, fill=50)
            _write_slice(root / "slice_3.dcm", instance_number=3, z_pos=3.0, fill=30)
            _write_slice(root / "slice_1.dcm", instance_number=1, z_pos=1.0, fill=10)
            _write_slice(root / "slice_2.dcm", instance_number=2, z_pos=2.0, fill=20)
            _write_slice(root / "slice_4.dcm", instance_number=4, z_pos=4.0, fill=40)

            volume, meta = load_cbct_series(root)

            self.assertEqual(volume.shape, (5, 16, 20))
            # Sorted by z / instance: first slice should be fill=10.
            self.assertEqual(int(volume[0, 0, 0]), 10)
            self.assertEqual(int(volume[1, 0, 0]), 20)
            self.assertEqual(int(volume[2, 0, 0]), 30)
            self.assertEqual(int(volume[4, 0, 0]), 50)

            self.assertEqual(meta["num_slices"], 5)
            self.assertEqual(meta["rows"], 16)
            self.assertEqual(meta["columns"], 20)
            self.assertAlmostEqual(meta["slice_thickness"], 1.0, places=4)
            self.assertEqual(meta["modality"], "CT")

    def test_load_cbct_series_from_zip(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            dicom_dir = root / "study"
            dicom_dir.mkdir(parents=True, exist_ok=True)

            _write_slice(dicom_dir / "a.dcm", instance_number=5, z_pos=5.0, fill=50)
            _write_slice(dicom_dir / "b.dcm", instance_number=1, z_pos=1.0, fill=10)
            _write_slice(dicom_dir / "c.dcm", instance_number=3, z_pos=3.0, fill=30)
            _write_slice(dicom_dir / "d.dcm", instance_number=2, z_pos=2.0, fill=20)
            _write_slice(dicom_dir / "e.dcm", instance_number=4, z_pos=4.0, fill=40)

            zip_path = root / "study.zip"
            with zipfile.ZipFile(zip_path, "w", compression=zipfile.ZIP_DEFLATED) as zf:
                for f in dicom_dir.rglob("*.dcm"):
                    zf.write(f, arcname=f"nested/{f.name}")

            volume, meta = load_cbct_series(zip_path)

            self.assertEqual(volume.shape, (5, 16, 20))
            self.assertEqual(int(volume[0, 0, 0]), 10)
            self.assertEqual(int(volume[4, 0, 0]), 50)
            self.assertEqual(meta["num_slices"], 5)

    def test_load_cbct_zip_from_bytes(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            dicom_dir = root / "study"
            dicom_dir.mkdir(parents=True, exist_ok=True)

            _write_slice(dicom_dir / "slice_5.dcm", instance_number=5, z_pos=5.0, fill=50)
            _write_slice(dicom_dir / "slice_4.dcm", instance_number=4, z_pos=4.0, fill=40)
            _write_slice(dicom_dir / "slice_2.dcm", instance_number=2, z_pos=2.0, fill=20)
            _write_slice(dicom_dir / "slice_1.dcm", instance_number=1, z_pos=1.0, fill=10)
            _write_slice(dicom_dir / "slice_3.dcm", instance_number=3, z_pos=3.0, fill=30)

            zip_path = root / "study.zip"
            with zipfile.ZipFile(zip_path, "w", compression=zipfile.ZIP_DEFLATED) as zf:
                for f in dicom_dir.rglob("*.dcm"):
                    zf.write(f, arcname=f"nested/{f.name}")
                zf.writestr("__MACOSX/._junk", b"ignored")

            volume, meta = load_cbct_zip(zip_path.read_bytes())

            self.assertEqual(volume.shape, (5, 16, 20))
            self.assertEqual(int(volume[0, 0, 0]), 10)
            self.assertEqual(int(volume[4, 0, 0]), 50)
            self.assertEqual(meta["num_slices"], 5)

    def test_mixed_dimensions_skip_inconsistent_slices(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            _write_slice(root / "ok_1.dcm", instance_number=1, z_pos=1.0, fill=11)
            _write_slice(root / "ok_2.dcm", instance_number=2, z_pos=2.0, fill=22)
            _write_slice(root / "ok_3.dcm", instance_number=3, z_pos=3.0, fill=33)
            _write_slice(root / "ok_4.dcm", instance_number=4, z_pos=4.0, fill=44)
            _write_slice(root / "ok_5.dcm", instance_number=5, z_pos=5.0, fill=55)

            # Write one mismatched slice manually to ensure it is skipped.
            file_meta = FileMetaDataset()
            file_meta.MediaStorageSOPClassUID = generate_uid()
            file_meta.MediaStorageSOPInstanceUID = generate_uid()
            file_meta.ImplementationClassUID = generate_uid()
            file_meta.TransferSyntaxUID = ExplicitVRLittleEndian

            bad_path = root / "bad_shape.dcm"
            ds = FileDataset(str(bad_path), {}, file_meta=file_meta, preamble=b"\0" * 128)
            ds.is_little_endian = True
            ds.is_implicit_VR = False
            arr = np.full((8, 9), 99, dtype=np.uint16)
            ds.PatientName = "Unit Test"
            ds.Modality = "CT"
            ds.Rows = arr.shape[0]
            ds.Columns = arr.shape[1]
            ds.PixelSpacing = [0.25, 0.25]
            ds.InstanceNumber = 3
            ds.ImagePositionPatient = [0.0, 0.0, 3.0]
            ds.SamplesPerPixel = 1
            ds.PhotometricInterpretation = "MONOCHROME2"
            ds.BitsAllocated = 16
            ds.BitsStored = 16
            ds.HighBit = 15
            ds.PixelRepresentation = 0
            ds.PixelData = arr.tobytes()
            ds.save_as(str(bad_path))

            volume, meta = load_cbct_series(root)

            self.assertEqual(volume.shape, (5, 16, 20))
            self.assertEqual(meta["num_slices"], 5)

    def test_raises_when_not_enough_valid_slices(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            _write_slice(root / "ok_1.dcm", instance_number=1, z_pos=1.0, fill=11)
            _write_slice(root / "ok_2.dcm", instance_number=2, z_pos=2.0, fill=22)
            _write_slice(root / "ok_3.dcm", instance_number=3, z_pos=3.0, fill=33)
            _write_slice(root / "ok_4.dcm", instance_number=4, z_pos=4.0, fill=44)

            with self.assertRaisesRegex(ValueError, "Not enough valid CBCT slices"):
                load_cbct_series(root)


if __name__ == "__main__":
    unittest.main()

