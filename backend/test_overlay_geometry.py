import unittest

import numpy as np

from dicom_processor import build_planning_overlay


class PlanningOverlayGeometryTests(unittest.TestCase):
    def test_overlay_emits_three_clean_parallel_arch_curves(self):
        h = w = 220
        volume = np.zeros((1, h, w), dtype=float)
        bone = np.zeros((1, h, w), dtype=bool)

        xs = np.arange(25, 195)
        center = w / 2
        for x in xs:
            top = 42 + 0.008 * (x - center) ** 2
            thickness = 24 + 0.02 * abs(x - center)
            bottom = top + thickness
            bone[0, int(round(top)): int(round(bottom)) + 1, x] = True

        overlay = build_planning_overlay(
            volume,
            bone,
            {"measurement_location": {"x": 150, "y": 100}},
        )

        outer = overlay["outer_contour"]
        mid = overlay["base_guide"]
        inner = overlay["inner_contour"]

        self.assertGreater(len(outer), 10)
        self.assertEqual(len(outer), len(mid))
        self.assertEqual(len(mid), len(inner))

        outer_x = [p["x"] for p in outer]
        mid_x = [p["x"] for p in mid]
        inner_x = [p["x"] for p in inner]
        self.assertEqual(outer_x, sorted(outer_x))
        self.assertEqual(mid_x, sorted(mid_x))
        self.assertEqual(inner_x, sorted(inner_x))

        for o, m, i in zip(outer, mid, inner):
            self.assertLess(o["y"], m["y"])
            self.assertLess(m["y"], i["y"])

        width_indicator = overlay["width_indicator"]
        self.assertIsNotNone(width_indicator)


if __name__ == "__main__":
    unittest.main()

