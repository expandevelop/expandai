import json
import os
import sys

try:
    import psycopg
except Exception:
    print(json.dumps({"ok": False, "stage": "import", "error": "psycopg_not_installed"}))
    sys.exit(2)

conn_info = {
    "host": os.environ.get("EXPANDAI_DB_HOST", ""),
    "port": int(os.environ.get("EXPANDAI_DB_PORT", "5432")),
    "dbname": os.environ.get("EXPANDAI_DB_NAME", ""),
    "user": os.environ.get("EXPANDAI_DB_USER", ""),
    "password": os.environ.get("EXPANDAI_DB_PASSWORD", ""),
    "connect_timeout": 10,
    "sslmode": os.environ.get("EXPANDAI_DB_SSLMODE", "require"),
}

try:
    with psycopg.connect(**conn_info) as conn:
        with conn.cursor() as cur:
            cur.execute("select current_database(), current_user, version()")
            dbname, user, version = cur.fetchone()
            print(json.dumps({
                "ok": True,
                "database": dbname,
                "user": user,
                "version": version,
            }))
except Exception as exc:
    print(json.dumps({"ok": False, "stage": "connect", "error": str(exc)}))
    sys.exit(1)
