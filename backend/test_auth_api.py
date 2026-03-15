import tempfile
import unittest
from pathlib import Path

from fastapi.testclient import TestClient

import main
from auth_db import AuthDatabase


class AuthApiTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.NamedTemporaryFile(suffix=".db", delete=False)
        self.tmp.close()
        main.auth_db = AuthDatabase(self.tmp.name)
        self.client = TestClient(main.app)

    def tearDown(self):
        Path(self.tmp.name).unlink(missing_ok=True)

    def test_signup_and_login_issue_tokens(self):
        signup = self.client.post(
            "/auth/signup",
            json={"email": "doctor@example.com", "password": "secret123"},
        )
        self.assertEqual(signup.status_code, 200)
        signup_payload = signup.json()
        self.assertIn("token", signup_payload)
        self.assertEqual(signup_payload["user"]["email"], "doctor@example.com")

        login = self.client.post(
            "/auth/login",
            json={"email": "doctor@example.com", "password": "secret123"},
        )
        self.assertEqual(login.status_code, 200)
        self.assertIn("token", login.json())

    def test_protected_endpoint_requires_token(self):
        response = self.client.post(
            "/measure",
            json={"session_id": "abc", "x": 1, "y": 2},
        )
        self.assertEqual(response.status_code, 401)


if __name__ == "__main__":
    unittest.main()

