import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from fastapi.testclient import TestClient

import main
from auth_db import AuthDatabase


class PanoramicApiTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.NamedTemporaryFile(suffix=".db", delete=False)
        self.tmp.close()
        main.auth_db = AuthDatabase(self.tmp.name)
        self.client = TestClient(main.app)

        signup = self.client.post(
            "/auth/signup",
            json={"email": "opg@example.com", "password": "secret123"},
        )
        self.token = signup.json()["token"]

    def tearDown(self):
        Path(self.tmp.name).unlink(missing_ok=True)

    def test_analyze_panoramic_uses_panoramic_workflow(self):
        with patch("main._analyze_dicom_bytes") as analyze_mock:
            analyze_mock.return_value = main.AnalysisResponse(
                session_id="session-1",
                workflow="panoramic_mandibular_canal",
                patient_name="Test",
                opg_image_base64="",
                nerve_path=[],
                arch_path=[],
                planning_overlay=main.PlanningOverlay(
                    outer_contour=[],
                    inner_contour=[],
                    base_guide=[],
                    width_indicator=None,
                    sector_lines=[],
                ),
                bone_metrics=main.BoneMetrics(
                    width_mm=0,
                    height_mm=0,
                    safe_height_mm=0,
                    safety_margin_mm=2,
                    density_estimate_hu=0,
                    measurement_location={"x": 0, "y": 0},
                    safety_status="warning",
                    safety_reason="",
                ),
                metadata={
                    "pixel_spacing": [1.0, 1.0],
                    "slice_thickness": 1.0,
                    "rows": 10,
                    "columns": 10,
                    "num_slices": 1,
                },
            )

            response = self.client.post(
                "/analyze-panoramic",
                headers={"Authorization": f"Bearer {self.token}"},
                files={"file": ("opg.dcm", b"DICM" + b"0" * 300, "application/dicom")},
            )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["workflow"], "panoramic_mandibular_canal")
        analyze_mock.assert_called_once()


if __name__ == "__main__":
    unittest.main()

