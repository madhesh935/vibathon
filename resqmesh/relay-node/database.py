import sqlite3
from config import DB_PATH


def get_connection():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_connection()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS packets (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            packet_id   TEXT    UNIQUE NOT NULL,
            victim_name TEXT    NOT NULL,
            message     TEXT    NOT NULL,
            latitude    REAL,
            longitude   REAL,
            forwarded   INTEGER DEFAULT 0,
            created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()
    print("[DB] SQLite initialised at", DB_PATH)


def save_packet(packet_id, victim_name, message, latitude, longitude):
    """Returns True if saved, False if duplicate."""
    conn = get_connection()
    try:
        conn.execute(
            """INSERT INTO packets
               (packet_id, victim_name, message, latitude, longitude)
               VALUES (?, ?, ?, ?, ?)""",
            (packet_id, victim_name, message, latitude, longitude),
        )
        conn.commit()
        return True
    except sqlite3.IntegrityError:
        return False
    finally:
        conn.close()


def mark_forwarded(packet_id):
    conn = get_connection()
    conn.execute(
        "UPDATE packets SET forwarded = 1 WHERE packet_id = ?", (packet_id,)
    )
    conn.commit()
    conn.close()


def get_unforwarded():
    conn = get_connection()
    rows = conn.execute(
        "SELECT * FROM packets WHERE forwarded = 0 ORDER BY created_at ASC"
    ).fetchall()
    conn.close()
    return [dict(row) for row in rows]


def get_all_packets():
    conn = get_connection()
    rows = conn.execute(
        "SELECT * FROM packets ORDER BY created_at DESC LIMIT 100"
    ).fetchall()
    conn.close()
    return [dict(row) for row in rows]
