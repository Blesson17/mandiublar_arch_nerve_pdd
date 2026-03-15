import unittest

import numpy as np

from dicom_processor import build_planning_overlay


class PlanningOverlayGeometryTests(unittest.TestCase):
    def _make_mandible(self, h=220, w=220):
        volume = np.zeros((1, h, w), dtype=float)
        bone = np.zeros((1, h, w), dtype=bool)
        xs = np.arange(25, 195)
        center = w / 2
        for x in xs:
            top = 42 + 0.008 * (x - center) ** 2
            thickness = 24 + 0.02 * abs(x - center)
            bottom = top + thickness
            bone[0, int(round(top)): int(round(bottom)) + 1, x] = True
        return volume, bone

    def _make_tight_mandible(self, h=240, w=240):
        volume = np.zeros((1, h, w), dtype=float)
        bone = np.zeros((1, h, w), dtype=bool)
        xs = np.arange(60, 181)
        center = w / 2
        for x in xs:
            top = 38 + 0.018 * (x - center) ** 2
            thickness = 22 + 0.03 * abs(x - center)
            bottom = top + thickness
            bone[0, int(round(top)): int(round(bottom)) + 1, x] = True
        return volume, bone

    def test_overlay_emits_three_clean_parallel_arch_curves(self):
        volume, bone = self._make_mandible()
        overlay = build_planning_overlay(
            volume, bone, {"measurement_location": {"x": 150, "y": 100}}
        )
        outer = overlay["outer_contour"]
        inner = overlay["inner_contour"]
        mid = overlay["base_guide"]

        self.assertGreater(len(outer), 10, "outer_contour should have arch points")
        self.assertGreater(len(inner), 10, "inner_contour should have arch points")
        self.assertGreater(len(mid), 8, "base_guide should have arch points")

        outer_x = [p["x"] for p in outer]
        inner_x = [p["x"] for p in inner]
        mid_x = [p["x"] for p in mid]
        self.assertEqual(outer_x, sorted(outer_x))
        self.assertEqual(inner_x, sorted(inner_x))
        self.assertEqual(mid_x, sorted(mid_x))

        shared = min(len(inner), len(mid))
        for i in range(shared):
            self.assertLess(mid[i]["y"], inner[i]["y"])

    def test_sector_lines_are_not_used_in_preview(self):
        volume, bone = self._make_mandible()
        overlay = build_planning_overlay(
            volume, bone, {"measurement_location": {"x": 150, "y": 100}}
        )
        self.assertEqual(overlay["sector_lines"], [])

    def test_width_indicator_is_present(self):
        volume, bone = self._make_mandible()
        overlay = build_planning_overlay(
            volume, bone, {"measurement_location": {"x": 150, "y": 100}}
        )
        self.assertIsNotNone(overlay["width_indicator"])

    def test_tight_arch_overlay_stays_ordered(self):
        volume, bone = self._make_tight_mandible()
        overlay = build_planning_overlay(
            volume, bone, {"measurement_location": {"x": 150, "y": 100}}
        )

        outer = overlay["outer_contour"]
        inner = overlay["inner_contour"]

        self.assertGreater(len(outer), 10)
        self.assertGreater(len(inner), 10)

        outer_x = [p["x"] for p in outer]
        self.assertEqual(outer_x, sorted(outer_x))
        self.assertLess(outer_x[0], outer_x[1])
        self.assertLess(outer_x[-2], outer_x[-1])

        outer_y = [p["y"] for p in outer]
        inner_min_y = min(p["y"] for p in inner)
        inner_max_y = max(p["y"] for p in inner)
        outer_edge_y = max(outer[0]["y"], outer[-1]["y"])

        self.assertLess(outer_edge_y - inner_max_y, 35)
        self.assertGreater(inner_max_y - inner_min_y, 20)
        self.assertLess(abs(outer_y[1] - outer_y[0]), 25)
        self.assertLess(abs(outer_y[-1] - outer_y[-2]), 25)


if __name__ == "__main__":
    unittest.main()

