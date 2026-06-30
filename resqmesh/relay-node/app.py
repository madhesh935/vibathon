"""
ResQMesh Relay Node
-------------------
Receives emergency packets from victim devices, stores them locally in SQLite,
and forwards them to the backend. Includes automatic retry for offline scenarios.
"""

import logging
import threading
import time
import uuid
import os

# Fix for PostgreSQL setting invalid CA bundle paths globally on Windows
for env_var in ['REQUESTS_CA_BUNDLE', 'CURL_CA_BUNDLE', 'SSL_CERT_FILE', 'SSL_CERT_DIR', 'HTTPS_CA_BUNDLE']:
    os.environ.pop(env_var, None)

import requests
from flask import Flask, jsonify, request
from flask_cors import CORS

from config import (
    BACKEND_URL,
    RELAY_HOST,
    RELAY_PORT,
    REQUEST_TIMEOUT_SECONDS,
    RETRY_INTERVAL_SECONDS,
)
from database import (
    get_all_packets,
    get_unforwarded,
    init_db,
    mark_forwarded,
    save_packet,
)

logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)


# ---------------------------------------------------------------------------
# Forwarding logic
# ---------------------------------------------------------------------------

def forward_to_backend(packet_id, victim_name, message, latitude, longitude):
    """
    POST the packet to the backend /api/report endpoint.
    Returns (success: bool, response_data: dict | None).
    """
    payload = {
        "packet_id": packet_id,
        "victim_name": victim_name,
        "message": message,
        "latitude": latitude,
        "longitude": longitude,
    }
    try:
        resp = requests.post(
            f"{BACKEND_URL}/api/report",
            json=payload,
            timeout=REQUEST_TIMEOUT_SECONDS,
        )
        resp.raise_for_status()
        mark_forwarded(packet_id)
        logger.info(f"Forwarded packet {packet_id} to backend")
        return True, resp.json()
    except requests.exceptions.RequestException as exc:
        logger.warning(f"Forward failed for {packet_id}: {exc}")
        return False, None


# ---------------------------------------------------------------------------
# Background retry worker
# ---------------------------------------------------------------------------

def retry_worker():
    """Retry unforwarded packets on a fixed interval."""
    while True:
        time.sleep(RETRY_INTERVAL_SECONDS)
        pending = get_unforwarded()
        if pending:
            logger.info(f"Retrying {len(pending)} unforwarded packet(s)…")
            for pkt in pending:
                forward_to_backend(
                    pkt["packet_id"],
                    pkt["victim_name"],
                    pkt["message"],
                    pkt["latitude"],
                    pkt["longitude"],
                )


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.route("/relay", methods=["POST"])
def relay():
    data = request.get_json(silent=True) or {}

    victim_name = (data.get("victim_name") or "").strip()
    message = (data.get("message") or "").strip()
    latitude = data.get("latitude")
    longitude = data.get("longitude")

    if not victim_name or not message:
        return jsonify({"error": "victim_name and message are required"}), 400

    packet_id = (data.get("packet_id") or "").strip() or \
        f"PKT-{uuid.uuid4().hex[:8].upper()}"

    # Persist locally (deduplicate)
    saved = save_packet(packet_id, victim_name, message, latitude, longitude)
    if saved:
        logger.info(f"Stored packet {packet_id} from '{victim_name}'")
    else:
        logger.info(f"Duplicate packet {packet_id} — already stored")

    # Attempt immediate forwarding
    success, backend_data = forward_to_backend(
        packet_id, victim_name, message, latitude, longitude
    )

    if success and backend_data:
        return jsonify({
            "success": True,
            "packet_id": packet_id,
            "forwarded": True,
            "report": backend_data.get("report"),
        })

    # Backend unreachable — return a stub so the victim app still gets a response
    return jsonify({
        "success": True,
        "packet_id": packet_id,
        "forwarded": False,
        "report": {
            "_id": packet_id,
            "victim_name": victim_name,
            "message": message,
            "status": "PENDING",
            "priority": "MEDIUM",
            "advice": "",
            "response": "",
            "latitude": latitude,
            "longitude": longitude,
        },
        "note": "Backend unreachable. Packet stored locally and will be retried.",
    })


@app.route("/health", methods=["GET"])
def health():
    pending = len(get_unforwarded())
    backend_status = "unreachable"
    try:
        r = requests.get(f"{BACKEND_URL}/", timeout=5)
        backend_status = "connected" if r.ok else "error"
    except requests.exceptions.RequestException:
        pass

    return jsonify({
        "status": "ok",
        "relay": "running",
        "backend": backend_status,
        "pending_packets": pending,
    })


@app.route("/packets", methods=["GET"])
def packets():
    return jsonify(get_all_packets())


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    init_db()

    # Start background retry thread
    t = threading.Thread(target=retry_worker, daemon=True)
    t.start()
    logger.info(f"Retry worker started (interval: {RETRY_INTERVAL_SECONDS}s)")

    logger.info(f"ResQMesh Relay Node starting on {RELAY_HOST}:{RELAY_PORT}")
    logger.info(f"Forwarding to backend: {BACKEND_URL}")
    app.run(host=RELAY_HOST, port=RELAY_PORT, debug=False)
