from __future__ import annotations

import base64
import hashlib
import hmac
import secrets
import sqlite3
import threading
from contextlib import contextmanager
from datetime import datetime, timedelta, timezone
from pathlib import Path


class AuthDatabase:
    """SQLite-backed user and session store for simple API authentication."""

    def __init__(self, db_path: str | None = None):
        default_path = Path(__file__).resolve().parent / "belsson_auth.db"
        self._db_path = str(default_path if db_path is None else db_path)
        self._lock = threading.Lock()
        self._iterations = 120_000
        self.init_db()

    def init_db(self) -> None:
        with self._connect() as conn:
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    email TEXT NOT NULL UNIQUE,
                    password_hash TEXT NOT NULL,
                    password_salt TEXT NOT NULL,
                    created_at TEXT NOT NULL
                )
                """
            )
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS sessions (
                    token TEXT PRIMARY KEY,
                    user_id INTEGER NOT NULL,
                    created_at TEXT NOT NULL,
                    expires_at TEXT NOT NULL,
                    FOREIGN KEY(user_id) REFERENCES users(id)
                )
                """
            )
            conn.execute(
                "CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id)"
            )
            conn.execute(
                "CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)"
            )
            conn.commit()

    def create_user(self, email: str, password: str) -> dict:
        normalized = email.strip().lower()
        if len(password) < 6:
            raise ValueError("Password must be at least 6 characters.")
        if not normalized:
            raise ValueError("Email is required.")

        salt = secrets.token_bytes(16)
        pwd_hash = self._hash_password(password, salt)
        now = self._utc_now_iso()

        with self._connect() as conn:
            try:
                cursor = conn.execute(
                    """
                    INSERT INTO users(email, password_hash, password_salt, created_at)
                    VALUES (?, ?, ?, ?)
                    """,
                    (normalized, pwd_hash, base64.b64encode(salt).decode("ascii"), now),
                )
                conn.commit()
            except sqlite3.IntegrityError as exc:
                raise ValueError("An account with this email already exists.") from exc

        return {"id": int(cursor.lastrowid), "email": normalized}

    def authenticate(self, email: str, password: str) -> dict | None:
        normalized = email.strip().lower()
        user = self.get_user_by_email(normalized)
        if user is None:
            return None

        salt = base64.b64decode(user["password_salt"].encode("ascii"))
        expected = user["password_hash"]
        supplied = self._hash_password(password, salt)
        if not hmac.compare_digest(expected, supplied):
            return None

        return {"id": user["id"], "email": user["email"]}

    def create_session(self, user_id: int, ttl_hours: int = 24) -> str:
        token = secrets.token_urlsafe(32)
        now = datetime.now(timezone.utc)
        expires_at = now + timedelta(hours=ttl_hours)

        with self._connect() as conn:
            conn.execute(
                """
                INSERT INTO sessions(token, user_id, created_at, expires_at)
                VALUES (?, ?, ?, ?)
                """,
                (token, user_id, now.isoformat(), expires_at.isoformat()),
            )
            conn.commit()

        return token

    def get_user_by_token(self, token: str) -> dict | None:
        if not token:
            return None

        with self._connect() as conn:
            row = conn.execute(
                """
                SELECT u.id, u.email, s.expires_at
                FROM sessions s
                JOIN users u ON u.id = s.user_id
                WHERE s.token = ?
                """,
                (token,),
            ).fetchone()

            if row is None:
                return None

            expires_at = datetime.fromisoformat(row[2])
            if expires_at <= datetime.now(timezone.utc):
                conn.execute("DELETE FROM sessions WHERE token = ?", (token,))
                conn.commit()
                return None

            return {"id": int(row[0]), "email": row[1]}

    def get_user_by_email(self, email: str) -> dict | None:
        with self._connect() as conn:
            row = conn.execute(
                """
                SELECT id, email, password_hash, password_salt, created_at
                FROM users
                WHERE email = ?
                """,
                (email,),
            ).fetchone()

        if row is None:
            return None

        return {
            "id": int(row[0]),
            "email": row[1],
            "password_hash": row[2],
            "password_salt": row[3],
            "created_at": row[4],
        }

    @contextmanager
    def _connect(self):
        # Serialize sqlite access in threaded server mode.
        self._lock.acquire()
        conn = sqlite3.connect(self._db_path)
        conn.row_factory = sqlite3.Row
        try:
            yield conn
        finally:
            conn.close()
            self._lock.release()

    def _hash_password(self, password: str, salt: bytes) -> str:
        digest = hashlib.pbkdf2_hmac(
            "sha256",
            password.encode("utf-8"),
            salt,
            self._iterations,
        )
        return base64.b64encode(digest).decode("ascii")

    @staticmethod
    def _utc_now_iso() -> str:
        return datetime.now(timezone.utc).isoformat()

