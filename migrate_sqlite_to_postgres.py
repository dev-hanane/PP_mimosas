#!/usr/bin/env python3
"""
Migration SQLite -> PostgreSQL pour Camping Mimosas.

Usage:
  1) Définir DATABASE_URL (PostgreSQL) dans l'environnement
  2) Optionnel: SQLITE_DB_PATH (défaut: camping_new.db)
  3) Exécuter: python migrate_sqlite_to_postgres.py
"""

import os
import sqlite3
from datetime import datetime

from sqlalchemy import create_engine, text
from sqlalchemy.exc import OperationalError
from dotenv import load_dotenv


TABLES_ORDER = [
    "users",
    "accommodations",
    "bookings",
    "reviews",
    "services",
    "payments",
    "gallery",
    "contact_messages",
]

# Charge d'abord .env puis .env.backend si présent
load_dotenv()
if os.path.exists(".env.backend"):
    load_dotenv(".env.backend", override=False)


def normalize_database_url(raw_url: str) -> str:
    if raw_url.startswith("postgres://"):
        raw_url = raw_url.replace("postgres://", "postgresql://", 1)
    if raw_url.startswith("postgresql://"):
        return raw_url.replace("postgresql://", "postgresql+psycopg://", 1)
    return raw_url


def sqlite_db_path() -> str:
    base_dir = os.path.abspath(os.path.dirname(__file__))
    db_name = os.getenv("SQLITE_DB_PATH", "").strip()
    if not db_name:
        current_db_url = os.getenv("CURRENT_SQLITE_URL", "").strip() or os.getenv("DATABASE_URL", "").strip()
        if current_db_url.startswith("sqlite:///"):
            db_name = current_db_url.replace("sqlite:///", "", 1)
    if not db_name:
        for fallback in ("camping_new.db", "camping.db"):
            fallback_path = os.path.join(base_dir, fallback)
            if os.path.exists(fallback_path):
                return fallback_path
        db_name = "camping_new.db"
    return db_name if os.path.isabs(db_name) else os.path.join(base_dir, db_name)


def coerce_value(value, column_name: str, declared_type: str):
    declared = (declared_type or "").upper()

    # SQLite stocke souvent les booléens en 0/1, PostgreSQL attend un vrai bool.
    if isinstance(value, int) and (column_name.startswith("is_") or "BOOL" in declared):
        return bool(value)

    if isinstance(value, str):
        # Nettoyage léger des datetimes SQLite "YYYY-MM-DD HH:MM:SS"
        if len(value) >= 19 and value[4] == "-" and value[7] == "-" and value[10] == " ":
            try:
                return datetime.fromisoformat(value)
            except ValueError:
                return value
    return value


def migrate_table(sqlite_conn, pg_conn, table_name: str):
    sqlite_cur = sqlite_conn.cursor()
    sqlite_cur.execute(f"SELECT * FROM {table_name}")
    rows = sqlite_cur.fetchall()

    col_rows = sqlite_cur.execute(f"PRAGMA table_info({table_name})").fetchall()
    columns = [c[1] for c in col_rows]
    declared_types = {c[1]: c[2] for c in col_rows}

    if not rows:
        print(f" - {table_name}: 0 ligne (skip)")
        return

    quoted_cols = ", ".join([f'"{c}"' for c in columns])
    placeholders = ", ".join([f":{c}" for c in columns])

    insert_sql = text(
        f"INSERT INTO {table_name} ({quoted_cols}) VALUES ({placeholders}) "
        "ON CONFLICT DO NOTHING"
    )

    payload = []
    for row in rows:
        item = {}
        for col, val in zip(columns, row):
            item[col] = coerce_value(val, col, declared_types.get(col, ""))
        payload.append(item)

    pg_conn.execute(insert_sql, payload)
    print(f" - {table_name}: {len(rows)} lignes migrées")

    # Synchronise la séquence id (serial) avec la valeur max après import
    if "id" in columns:
        pg_conn.execute(
            text(
                """
                SELECT setval(
                    pg_get_serial_sequence(:table_name, 'id'),
                    COALESCE((SELECT MAX(id) FROM """ + table_name + """), 1),
                    true
                )
                """
            ),
            {"table_name": table_name},
        )


def main():
    db_url = os.getenv("DATABASE_URL", "").strip()
    if not db_url:
        raise SystemExit("DATABASE_URL PostgreSQL manquant.")

    db_url = normalize_database_url(db_url)
    if not db_url.startswith("postgresql+psycopg://"):
        raise SystemExit("DATABASE_URL doit être PostgreSQL (postgresql://...).")

    sqlite_path = sqlite_db_path()
    if not os.path.exists(sqlite_path):
        raise SystemExit(f"Base SQLite introuvable: {sqlite_path}")

    print(f"SQLite source: {sqlite_path}", flush=True)
    print("PostgreSQL target: DATABASE_URL", flush=True)

    sqlite_conn = sqlite3.connect(sqlite_path)
    sqlite_conn.row_factory = sqlite3.Row

    engine = create_engine(
        db_url,
        future=True,
        connect_args={"connect_timeout": 8},
    )

    # Crée les tables cibles si absentes via l'app Flask
    from app import app, db  # Import tardif pour éviter la config avant DATABASE_URL

    try:
        with app.app_context():
            db.create_all()
    except OperationalError as exc:
        raise SystemExit(
            f"Connexion PostgreSQL impossible. Vérifiez que le service est démarré "
            f"et que DATABASE_URL est correct.\nDétail: {exc}"
        ) from exc

    with engine.begin() as pg_conn:
        for table in TABLES_ORDER:
            migrate_table(sqlite_conn, pg_conn, table)

    sqlite_conn.close()
    print("Migration terminée avec succès.")


if __name__ == "__main__":
    main()
