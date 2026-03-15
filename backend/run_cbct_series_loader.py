from __future__ import annotations

import argparse
from pathlib import Path

from dicom_processor import load_cbct_series


def main() -> None:
    parser = argparse.ArgumentParser(description="Load a CBCT DICOM series from folder or ZIP.")
    parser.add_argument("input", type=str, help="Path to CBCT study folder or .zip archive")
    args = parser.parse_args()

    volume, metadata = load_cbct_series(Path(args.input))

    print("Loaded volume:", volume.shape)
    print("Metadata:")
    for key in (
        "patient_name",
        "modality",
        "pixel_spacing",
        "slice_thickness",
        "rows",
        "columns",
        "num_slices",
    ):
        print(f"  {key}: {metadata.get(key)}")


if __name__ == "__main__":
    main()

