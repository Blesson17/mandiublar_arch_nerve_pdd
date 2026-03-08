"""
Segmentation Model (Placeholder)
---------------------------------
Provides a placeholder U-Net inference class for:
  1. Bone / mandible segmentation
  2. Inferior Alveolar Nerve (IAN) canal detection

Replace `predict()` with real ONNX / TFLite / PyTorch inference
once a trained model is available.
"""

import numpy as np
from scipy import ndimage


class UNetSegmentor:
    """Placeholder segmentation model that returns synthetic masks."""

    def __init__(self, model_path: str | None = None):
        self.model_path = model_path
        self.loaded = False

    def predict(self, volume: np.ndarray) -> dict:
        """
        Run segmentation on a 3-D CBCT volume or a single 2-D axial DICOM slice.
        Returns bone_mask and nerve_mask (same shape as volume).
        Also returns mandible_center: (row, col) of the mandible centroid.
        """
        is_2d = volume.shape[0] <= 3
        bone_mask, mandible_center = self._segment_bone(volume, is_2d)
        nerve_mask = self._detect_nerve(volume, bone_mask, is_2d)
        return {
            "bone_mask": bone_mask,
            "nerve_mask": nerve_mask,
            "mandible_center": mandible_center,   # (row, col) in image coords
        }

    # ------------------------------------------------------------------

    @staticmethod
    def _segment_bone(volume: np.ndarray, is_2d: bool):
        """
        Segment cortical bone.

        For 2-D axial slices: the mandible is the LARGEST bright connected
        component after thresholding.  We keep only that component so we
        don't include the skull base, spine, etc.

        Returns (mask, centroid_rc).
        """
        struct2d = ndimage.generate_binary_structure(2, 1)
        n_slices, H, W = volume.shape
        result = np.zeros_like(volume, dtype=bool)
        centroid = (H // 2, W // 2)   # fallback

        for s in range(n_slices):
            sl = volume[s].astype(np.float64)

            # Threshold at 70th percentile → bright = bone/cortex
            thresh = np.percentile(sl, 70)
            binary = sl > thresh

            # Clean with opening
            binary = ndimage.binary_opening(binary, structure=struct2d, iterations=3)

            if not binary.any():
                continue

            # Label connected components
            labelled, n_feat = ndimage.label(binary, structure=struct2d)
            if n_feat == 0:
                continue

            # For a 2-D axial CBCT slice the mandible is usually a U-shaped
            # ring in the lower half. Pick the largest component.
            sizes = [
                (ndimage.sum(binary, labelled, i), i)
                for i in range(1, n_feat + 1)
            ]
            sizes.sort(reverse=True)

            # Keep the top-1 (largest) component as the mandible
            best_label = sizes[0][1]
            mandible_mask = labelled == best_label

            # Fill holes so the trabecular interior is included
            mandible_mask = ndimage.binary_fill_holes(mandible_mask)
            result[s] = mandible_mask

            # Centroid of the mandible component
            rows, cols = np.where(mandible_mask)
            if len(rows):
                centroid = (int(rows.mean()), int(cols.mean()))

        return result.astype(bool), centroid

    @staticmethod
    def _detect_nerve(
        volume: np.ndarray, bone_mask: np.ndarray, is_2d: bool
    ) -> np.ndarray:
        """
        Detect the IAN canals as small DARK bilateral ovals strictly
        inside the mandibular cortex.

        Key constraints that eliminate the "orange mess":
        - Component area must be < 1% of mandible area  (small ovals only)
        - Component must be INSIDE the filled mandible mask (not on edges)
        - We expect at most 2 bilateral canals; keep the 2 largest qualifying
        """
        struct2d = ndimage.generate_binary_structure(2, 1)
        nerve_mask = np.zeros_like(volume, dtype=bool)

        for s in range(volume.shape[0]):
            sl_bone = bone_mask[s]
            if not sl_bone.any():
                continue

            # Erode the filled mandible slightly to get strictly interior
            interior = ndimage.binary_erosion(
                sl_bone, structure=struct2d, iterations=6
            )
            if not interior.any():
                continue

            sl = volume[s]
            interior_vals = sl[interior]
            if interior_vals.size == 0:
                continue

            # Dark threshold: bottom 25th percentile of interior voxels
            dark_thresh = np.percentile(interior_vals, 25)
            candidate = (sl < dark_thresh) & interior

            labelled, n_feat = ndimage.label(candidate, structure=struct2d)
            if n_feat == 0:
                continue

            mandible_area = sl_bone.sum()
            # IAN canal: area between 0.05% and 0.8% of mandible
            min_area = 0.0005 * mandible_area
            max_area = 0.008  * mandible_area

            qualifying = []
            for i in range(1, n_feat + 1):
                comp_mask = labelled == i
                sz = comp_mask.sum()
                if min_area <= sz <= max_area:
                    qualifying.append((sz, i))

            # Keep at most 2 largest qualifying components (bilateral canals)
            qualifying.sort(reverse=True)
            for _, idx in qualifying[:2]:
                nerve_mask[s] |= labelled == idx

        return nerve_mask


def extract_nerve_path_2d(nerve_mask: np.ndarray) -> list[dict]:
    """
    Project nerve mask onto the image plane and return centreline points
    sorted left → right.
    """
    projection = nerve_mask.any(axis=0).astype(np.uint8)   # (H, W)

    if projection.sum() == 0:
        return []

    from skimage.morphology import skeletonize
    skeleton = skeletonize(projection).astype(bool)
    coords = np.argwhere(skeleton)   # (N, 2): row, col

    if len(coords) == 0:
        return []

    coords = coords[coords[:, 1].argsort()]   # sort by column (left → right)
    step = max(1, len(coords) // 200)
    sampled = coords[::step]
    return [{"x": int(c[1]), "y": int(c[0])} for c in sampled]


def detect_arch_from_2d_slice(volume: np.ndarray) -> list[dict] | None:
    """
    For a 2-D axial CBCT slice, detect the **smooth outer contour** of
    the mandibular bone arch and return it as an ordered list of
    {"x", "y"} pixel coords.

    Strategy:
      1. Threshold to find bright bone
      2. Keep the largest connected component (mandible)
      3. Fill holes, then dilate slightly so the contour sits just
         outside the cortex
      4. Extract the outer boundary pixels
      5. Order them as a continuous contour (nearest-neighbour walk)
      6. Smooth with a moving-average filter to eliminate jaggedness
      7. Subsample to ~120 points
    """
    struct2d = ndimage.generate_binary_structure(2, 1)
    sl = volume[0].astype(np.float64)
    H, W = sl.shape

    # 1. Threshold
    thresh = np.percentile(sl, 70)
    binary = sl > thresh
    binary = ndimage.binary_opening(binary, structure=struct2d, iterations=2)
    if not binary.any():
        return None

    # 2. Largest connected component
    labelled, n_feat = ndimage.label(binary, structure=struct2d)
    if n_feat == 0:
        return None
    sizes = [(ndimage.sum(binary, labelled, i), i)
             for i in range(1, n_feat + 1)]
    sizes.sort(reverse=True)
    mandible = (labelled == sizes[0][1]).astype(bool)
    mandible = ndimage.binary_fill_holes(mandible)

    # 3. Slight dilation so the outline sits just outside the bone
    dilated = ndimage.binary_dilation(mandible, structure=struct2d, iterations=2)

    # 4. Outer boundary = dilated − original
    boundary = dilated & ~mandible

    # 5. Order boundary pixels as a continuous contour via nearest-neighbour walk
    coords = np.argwhere(boundary)          # (N, 2): row, col
    if len(coords) < 20:
        return None

    ordered = _order_contour(coords)
    if ordered is None or len(ordered) < 20:
        return None

    # 6. Smooth with a moving average (window ~3% of contour length)
    window = max(5, len(ordered) // 30)
    if window % 2 == 0:
        window += 1
    smoothed = _smooth_contour(ordered, window)

    # 7. Subsample
    step = max(1, len(smoothed) // 120)
    sampled = smoothed[::step]

    return [{"x": int(c[1]), "y": int(c[0])} for c in sampled]


def _order_contour(coords: np.ndarray) -> np.ndarray | None:
    """
    Order a set of boundary pixels into a continuous contour by
    greedy nearest-neighbour traversal.
    """
    from scipy.spatial import cKDTree

    n = len(coords)
    if n < 10:
        return None

    tree = cKDTree(coords)
    visited = np.zeros(n, dtype=bool)
    order = np.zeros(n, dtype=int)

    # Start from the top-most point (smallest row)
    start = int(np.argmin(coords[:, 0]))
    order[0] = start
    visited[start] = True

    for i in range(1, n):
        current = order[i - 1]
        # Find nearest unvisited neighbour
        dists, idxs = tree.query(coords[current], k=min(20, n))
        found = False
        for d, idx in zip(dists, idxs):
            if not visited[idx]:
                order[i] = idx
                visited[idx] = True
                found = True
                break
        if not found:
            # All remaining visited; truncate
            order = order[:i]
            break

    return coords[order]


def _smooth_contour(pts: np.ndarray, window: int) -> np.ndarray:
    """Smooth a 2-D contour with a uniform moving-average filter."""
    kernel = np.ones(window) / window
    # Pad circularly for closed contour
    pad = window // 2
    rows = np.pad(pts[:, 0].astype(float), pad, mode='wrap')
    cols = np.pad(pts[:, 1].astype(float), pad, mode='wrap')
    rows_s = np.convolve(rows, kernel, mode='valid')
    cols_s = np.convolve(cols, kernel, mode='valid')
    return np.stack([rows_s, cols_s], axis=1).astype(int)


