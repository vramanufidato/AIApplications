import sqlite3, json
from datetime import datetime

def log_diagnosis(image_bytes, transcript, diagnosis, offers, db="fixmate.db"):
    conn = sqlite3.connect(db)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS diagnoses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT, transcript TEXT,
            diagnosis TEXT, offers TEXT
        )
    """)
    conn.execute(
        "INSERT INTO diagnoses (timestamp, transcript, diagnosis, offers) VALUES (?,?,?,?)",
        (datetime.utcnow().isoformat(), transcript,
         json.dumps(diagnosis), json.dumps(offers))
    )
    conn.commit()
    conn.close()
