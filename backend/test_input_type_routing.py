import io
import unittest
import zipfile

import numpy as np
from PIL import Image
from pydicom.dataset import FileDataset, FileMetaDataset
from pydicom.uid import ExplicitVRLittleEndian, generate_uid

from main import detect_input_type


def _build_dicom_bytes() -> bytes:
    file_meta = FileMetaDataset()
    file_meta.MediaStorageSOPClassUID = generate_uid()
    file_meta.MediaStorageSOPInstanceUID = generate_uid()
    file_meta.ImplementationClassUID = generate_uid()
    file_meta.TransferSyntaxUID = ExplicitVRLittleEndian

    ds = FileDataset(None, {}, file_meta=file_meta, preamble=b"\0" * 128)
    ds.is_little_endian = True
    ds.is_implicit_VR = False

    arr = np.full((8, 8), 7, dtype=np.uint16)
    ds.Rows = arr.shape[0]
    ds.Columns = arr.shape[1]
    ds.SamplesPerPixel = 1
    ds.PhotometricInterpretation = "MONOCHROME2"
    ds.BitsAllocated = 16
    ds.BitsStored = 16
    ds.HighBit = 15
    ds.PixelRepresentation = 0
    ds.PixelData = arr.tobytes()

    buf = io.BytesIO()
    ds.save_as(buf)
    return buf.getvalue()


def _build_png_bytes() -> bytes:
    buf = io.BytesIO()
    img = Image.fromarray(np.full((8, 8), 128, dtype=np.uint8), mode="L")
    img.save(buf, format="PNG")
    return buf.getvalue()


def _build_zip_bytes() -> bytes:
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
        zf.writestr("study/slice_1.dcm", b"dummy")
    return buf.getvalue()


class DetectInputTypeTests(unittest.TestCase):
    def test_detect_zip_from_extension(self):
        self.assertEqual(detect_input_type(b"not-zip", "scan.zip"), "zip_cbct")

    def test_detect_zip_from_header(self):
        self.assertEqual(detect_input_type(_build_zip_bytes(), "scan.bin"), "zip_cbct")

    def test_detect_single_dicom(self):
        self.assertEqual(detect_input_type(_build_dicom_bytes(), "scan.dcm"), "dicom_single")

    def test_detect_image_projection(self):
        self.assertEqual(detect_input_type(_build_png_bytes(), "scan.png"), "image_projection")


if __name__ == "__main__":
    unittest.main()

