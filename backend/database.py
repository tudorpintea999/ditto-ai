import sqlite3
import secrets
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "nottura.db")


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id            INTEGER PRIMARY KEY AUTOINCREMENT,
            email         TEXT UNIQUE NOT NULL,
            api_key       TEXT UNIQUE NOT NULL,
            plan          TEXT NOT NULL DEFAULT 'free',
            minutes_used  REAL NOT NULL DEFAULT 0,
            minutes_limit REAL NOT NULL DEFAULT 60,
            created_at    TEXT NOT NULL DEFAULT (datetime('now'))
        )
    """)
    conn.commit()
    conn.close()


def create_user(email: str) -> dict:
    api_key = "nttr_" + secrets.token_urlsafe(24)
    conn = get_db()
    try:
        conn.execute(
            "INSERT INTO users (email, api_key) VALUES (?, ?)",
            (email, api_key),
        )
        conn.commit()
        row = conn.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
        return dict(row)
    finally:
        conn.close()


def get_user_by_key(api_key: str) -> dict | None:
    conn = get_db()
    try:
        row = conn.execute(
            "SELECT * FROM users WHERE api_key = ?", (api_key,)
        ).fetchone()
        return dict(row) if row else None
    finally:
        conn.close()


def get_user_by_email(email: str) -> dict | None:
    conn = get_db()
    try:
        row = conn.execute(
            "SELECT * FROM users WHERE email = ?", (email,)
        ).fetchone()
        return dict(row) if row else None
    finally:
        conn.close()


def add_minutes(api_key: str, minutes: float):
    conn = get_db()
    try:
        conn.execute(
            "UPDATE users SET minutes_used = minutes_used + ? WHERE api_key = ?",
            (minutes, api_key),
        )
        conn.commit()
    finally:
        conn.close()


def upgrade_user(email: str):
    conn = get_db()
    try:
        conn.execute(
            "UPDATE users SET plan = 'paid', minutes_limit = 99999 WHERE email = ?",
            (email,),
        )
        conn.commit()
    finally:
        conn.close()
