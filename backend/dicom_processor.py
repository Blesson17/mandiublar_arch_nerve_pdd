"""
DICOM Processor
----------------
Handles loading CBCT DICOM volumes, generating OPG projections,
detecting the dental arch, and computing bone measurements.
"""

from __future__ import annotations

import io
import base64
import tempfile
from pathlib import Path

import numpy as np
import pydicom
import SimpleITK as sitk
from scipy import ndimage
from skimage.morphology import skeletonize
from PIL import Image


# ======================================================================
# Loading
# ======================================================================

def load_dicom_volume(dicom_bytes: bytes) -> tuple[np.ndarray, dict]:
    """
    Load a DICOM file (single multi-frame or enhanced CT) and return
    the 3D volume + relevant metadata.

    Parameters
    ----------
    dicom_bytes : bytes
        Raw bytes of a single .dcm file.

    Returns
    -------
    volume : np.ndarray  – shape (slices, H, W), float64
    metadata : dict       – pixel_spacing, slice_thickness, patient_name, etc.
    """
    # Write to temp file because pydicom / SimpleITK work best with paths
    tmp = tempfile.NamedTemporaryFile(suffix=".dcm", delete=False)
    tmp.write(dicom_bytes)
    tmp.flush()
    tmp_path = tmp.name
    tmp.close()

    ds = pydicom.dcmread(tmp_path)

    # Extract metadata
    pixel_spacing = _get_pixel_spacing(ds)
    slice_thickness = float(getattr(ds, "SliceThickness", 1.0))
    patient_name = str(getattr(ds, "PatientName", "Unknown"))

    # Try SimpleITK first (handles multi-frame well)
    try:
        sitk_img = sitk.ReadImage(tmp_path)
        volume = sitk.GetArrayFromImage(sitk_img).astype(np.float64)
        spacing = list(sitk_img.GetSpacing())  # (x, y, z)
        if len(spacing) >= 3:
            pixel_spacing = [spacing[1], spacing[0]]
            slice_thickness = spacing[2]
    except Exception:
        # Fallback: single-frame → make pseudo-3D
        arr = ds.pixel_array.astype(np.float64)
        if arr.ndim == 2:
            volume = arr[np.newaxis, :, :]
        else:
            volume = arr

    # Apply rescale slope / intercept if present
    slope = float(getattr(ds, "RescaleSlope", 1))
    intercept = float(getattr(ds, "RescaleIntercept", 0))
    volume = volume * slope + intercept

    metadata = {
        "pixel_spacing": pixel_spacing,  # [row_spacing, col_spacing] in mm
        "slice_thickness": slice_thickness,  # mm
        "patient_name": patient_name,
        "rows": int(getattr(ds, "Rows", volume.shape[-2])),
        "columns": int(getattr(ds, "Columns", volume.shape[-1])),
        "num_slices": volume.shape[0],
    }

    Path(tmp_path).unlink(missing_ok=True)
    return volume, metadata


def _get_pixel_spacing(ds) -> list[float]:
    """Extract pixel spacing from various DICOM tags."""
    if hasattr(ds, "PixelSpacing"):
        return [float(ds.PixelSpacing[0]), float(ds.PixelSpacing[1])]
    if hasattr(ds, "ImagerPixelSpacing"):
        return [float(ds.ImagerPixelSpacing[0]), float(ds.ImagerPixelSpacing[1])]
    return [1.0, 1.0]


# ======================================================================
# OPG (Panoramic Projection)
# ======================================================================

def detect_dental_arch(volume: np.ndarray, metadata: dict) -> np.ndarray:
    """
    Detect the dental arch curve on an axial MIP.

    Returns an Nx2 array of (row, col) control points tracing the arch
    from left to right.
    """
    # Take an axial MIP of the lower third (mandible region)
    n_slices = volume.shape[0]
    lower = volume[n_slices // 2:, :, :]
    axial_mip = np.max(lower, axis=0)  # shape (H, W)

    # Threshold to find dense bone
    thresh = np.percentile(axial_mip, 80)
    binary = axial_mip > thresh

    # Morphological cleanup
    binary = ndimage.binary_closing(binary, iterations=5)
    binary = ndimage.binary_fill_holes(binary)

    # Skeletonise to get arch centreline
    skel = skeletonize(binary)
    coords = np.argwhere(skel)  # (N, 2): row, col

    if len(coords) < 10:
        # Fallback: parabolic arch
        W = volume.shape[2]
        H = volume.shape[1]
        xs = np.linspace(0, W - 1, 60).astype(int)
        ys = (0.001 * (xs - W // 2) ** 2 + H // 2).astype(int)
        return np.stack([ys, xs], axis=1)

    # Sort by column (left → right)
    coords = coords[coords[:, 1].argsort()]

    # Subsample for smooth spline
    step = max(1, len(coords) // 60)
    return coords[::step]


def generate_opg(volume: np.ndarray, metadata: dict) -> str:
    """
    Generate an OPG / panoramic radiograph image from the volume.

    • Single-slice (2-D) DICOM  → render the slice directly with
      aggressive percentile contrast stretch so anatomy is clearly visible.
    • Multi-slice (3-D) CBCT    → arch-unwrapped MIP.

    Returns a base64-encoded PNG string.
    """
    n_slices, H, W = volume.shape

    if n_slices <= 3:
        # ── 2-D path ─────────────────────────────────────────────────────
        mid = volume[n_slices // 2].astype(np.float64)

        # Percentile contrast stretch: ignore extreme outliers (air, metal)
        p_low  = np.percentile(mid, 1)
        p_high = np.percentile(mid, 99)
        if p_high <= p_low:
            # Flat image fallback
            p_low, p_high = mid.min(), mid.max()

        mid_clipped = np.clip(mid, p_low, p_high)

        if p_high > p_low:
            opg_norm = ((mid_clipped - p_low) / (p_high - p_low) * 255).astype(np.uint8)
        else:
            opg_norm = np.zeros((H, W), dtype=np.uint8)

    else:
        # ── 3-D path: arch-unwrapped MIP ─────────────────────────────────
        arch_points = detect_dental_arch(volume, metadata)
        num_points  = len(arch_points)
        opg = np.zeros((n_slices, num_points), dtype=np.float64)

        for i, (r, c) in enumerate(arch_points):
            r = int(np.clip(r, 0, H - 1))
            c = int(np.clip(c, 0, W - 1))
            r_lo, r_hi = max(0, r - 3), min(H, r + 4)
            c_lo, c_hi = max(0, c - 3), min(W, c + 4)
            patch = volume[:, r_lo:r_hi, c_lo:c_hi]
            opg[:, i] = np.max(patch, axis=(1, 2))

        p_low  = np.percentile(opg, 1)
        p_high = np.percentile(opg, 99)
        opg_c  = np.clip(opg, p_low, p_high)
        if p_high > p_low:
            opg_norm = ((opg_c - p_low) / (p_high - p_low) * 255).astype(np.uint8)
        else:
            opg_norm = np.zeros_like(opg, dtype=np.uint8)

    img = Image.fromarray(opg_norm, mode="L")
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return base64.b64encode(buf.getvalue()).decode("utf-8")


# ======================================================================
# Bone Measurements
# ======================================================================

def calculate_bone_metrics(
    volume: np.ndarray,
    bone_mask: np.ndarray,
    nerve_mask: np.ndarray,
    metadata: dict,
    tooth_coords: dict | None = None,
) -> dict:
    """
    Calculate bone width (buccolingual) and height (crest to IAN canal)
    at a specified tooth coordinate.

    Handles both 2-D single-slice and 3-D multi-slice volumes automatically.
    """
    pixel_spacing = metadata["pixel_spacing"]   # [row_sp, col_sp] in mm
    slice_thickness = metadata["slice_thickness"]  # mm

    n_slices, H, W = volume.shape
    is_2d = n_slices <= 3

    if tooth_coords is None:
        cx, cy = W // 2, H // 2
    else:
        cx = int(tooth_coords.get("x", W // 2))
        cy = int(tooth_coords.get("y", H // 2))

    cx = int(np.clip(cx, 0, W - 1))
    cy = int(np.clip(cy, 0, H - 1))

    SAFETY_MARGIN_MM = 2.0

    # ── Working slice ────────────────────────────────────────────────────
    mid_slice = n_slices // 2
    axial_bone  = bone_mask[mid_slice]   # (H, W)
    axial_nerve = nerve_mask[mid_slice]  # (H, W)
    axial_vol   = volume[mid_slice]      # (H, W)

    # ── Bone Width (buccolingual / labio-lingual) ────────────────────────
    # Scan the horizontal row at cy for bone pixels
    row_bone = axial_bone[cy, :]
    bone_cols = np.where(row_bone)[0]

    if len(bone_cols) < 2:
        # Expand search: look within ±10 rows of cy
        search_region = axial_bone[max(0, cy - 10): min(H, cy + 11), :]
        row_sums = search_region.sum(axis=0)
        bone_cols_broad = np.where(row_sums > 0)[0]
        width_px = (bone_cols_broad[-1] - bone_cols_broad[0]) if len(bone_cols_broad) >= 2 else 0
    else:
        width_px = bone_cols[-1] - bone_cols[0]

    width_mm = width_px * pixel_spacing[1]

    # ── Bone Height (crest → IAN nerve, or crest → base of bone) ─────────
    if is_2d:
        # In a 2-D slice height is measured VERTICALLY (row axis = pixel_spacing[0])
        # Look at the column at cx for bone rows
        col_bone  = axial_bone[:, cx]
        col_nerve = axial_nerve[:, cx]

        bone_rows  = np.where(col_bone)[0]
        nerve_rows = np.where(col_nerve)[0]

        if len(bone_rows) < 2 and len(bone_rows) == 0:
            # Widen search horizontally ±10 columns around cx
            search_col = axial_bone[:, max(0, cx - 10): min(W, cx + 11)]
            row_sums = search_col.sum(axis=1)
            bone_rows = np.where(row_sums > 0)[0]

        if len(bone_rows) >= 2:
            crest_row = bone_rows.min()
            if len(nerve_rows) >= 1:
                # Nerve found: height from crest to top edge of nerve
                nerve_top_row = nerve_rows.min()
                height_px = max(0, nerve_top_row - crest_row)
            else:
                # No nerve detected: full bone column height
                height_px = bone_rows.max() - crest_row
        elif len(bone_rows) == 1:
            height_px = 1
        else:
            height_px = 0

        height_mm = height_px * pixel_spacing[0]

    else:
        # 3-D: height measured through slices (depth axis)
        coronal_bone  = bone_mask[:, cy, cx]
        coronal_nerve = nerve_mask[:, cy, cx]

        bone_slices  = np.where(coronal_bone)[0]
        nerve_slices = np.where(coronal_nerve)[0]

        if len(bone_slices) >= 1 and len(nerve_slices) >= 1:
            crest_slice = bone_slices[0]
            nerve_top   = nerve_slices[0]
            height_px   = abs(nerve_top - crest_slice)
        elif len(bone_slices) >= 2:
            height_px = bone_slices[-1] - bone_slices[0]
        else:
            height_px = 0

        height_mm = height_px * slice_thickness

    safe_height_mm = max(0.0, height_mm - SAFETY_MARGIN_MM)

    # ── Bone density estimate ────────────────────────────────────────────
    region_bone = axial_bone[
        max(0, cy - 10): cy + 11,
        max(0, cx - 10): cx + 11,
    ]
    region_vol = axial_vol[
        max(0, cy - 10): cy + 11,
        max(0, cx - 10): cx + 11,
    ]
    density_estimate = float(np.mean(region_vol[region_bone])) if region_bone.any() else 0.0

    return {
        "width_mm":             round(width_mm, 2),
        "height_mm":            round(height_mm, 2),
        "safe_height_mm":       round(safe_height_mm, 2),
        "safety_margin_mm":     SAFETY_MARGIN_MM,
        "density_estimate_hu":  round(density_estimate, 1),
        "measurement_location": {"x": cx, "y": cy},
    }

