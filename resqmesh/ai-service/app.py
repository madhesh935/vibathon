"""
ResQMesh AI Service
--------------------------
Powered by Ollama (local, offline-first)
"""

import json
import logging
import re

from flask import Flask, jsonify, request
from flask_cors import CORS
import requests

logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

OLLAMA_URL   = "http://localhost:11434/api/generate"
OLLAMA_MODEL = "qwen2.5:1.5b"

# Ollama generation options — prevents repetitive/stuck outputs
OLLAMA_OPTIONS = {
    "temperature": 0.3,   # low = more focused/accurate for triage
    "top_p": 0.9,
    "top_k": 40,
    "repeat_penalty": 1.1,
    "num_predict": 256,
}

TRIAGE_SYSTEM = (
    "You are an emergency triage assistant. "
    "You classify emergencies by severity. "
    "Always respond with ONLY a valid JSON object, no markdown, no explanation."
)

TRIAGE_PROMPT = """\
Analyse this emergency message and classify its severity.

Emergency: __MESSAGE__

Respond with ONLY this JSON (no extra text):
{
  "priority": "CRITICAL",
  "advice": "Brief actionable advice for the rescue team"
}

Priority levels:
- CRITICAL : immediate life threat (cardiac arrest, severe bleeding, trapped, fire, drowning)
- HIGH     : serious injury or significant danger
- MEDIUM   : moderate emergency, stable but needs attention
- LOW      : minor issue, non-urgent

JSON only:\
"""

CHAT_SYSTEM = (
    "You are a calm, helpful AI emergency assistant for the ResQMesh disaster response platform. "
    "Give concise, supportive, actionable responses. "
    "Use bullet points for step-by-step instructions. "
    "Keep responses under 80 words."
)

ENHANCE_SYSTEM = (
    "You are an emergency report writer. "
    "Convert raw voice transcriptions into clear, structured emergency reports for rescue teams. "
    "Extract: type of emergency, injuries, location clues, urgency level. "
    "Be concise and factual."
)


def call_ollama(prompt: str, system: str = "") -> str:
    """Send a prompt to Ollama and return the response text."""
    payload = {
        "model": OLLAMA_MODEL,
        "prompt": prompt,
        "stream": False,
        "options": OLLAMA_OPTIONS,
    }
    if system:
        payload["system"] = system

    resp = requests.post(OLLAMA_URL, json=payload, timeout=90)
    resp.raise_for_status()
    result = resp.json()
    return result.get("response", "").strip()


def parse_triage(text: str) -> dict:
    """Parse triage JSON from model output."""
    text = text.strip()

    # Strip markdown code fences
    if text.startswith("```json"):
        text = text[7:]
    elif text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]
    text = text.strip()

    # Direct JSON parse
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # Regex fallback — find the first JSON object
    m = re.search(r'\{[^{}]+\}', text, re.DOTALL)
    if m:
        try:
            return json.loads(m.group())
        except json.JSONDecodeError:
            pass

    # Last resort — extract priority keyword
    priority = "HIGH"
    for p in ("CRITICAL", "HIGH", "MEDIUM", "LOW"):
        if p in text.upper():
            priority = p
            break

    return {"priority": priority, "advice": "Manual triage recommended — AI parsing failed."}


def validate_triage(result: dict) -> dict:
    valid_priorities = {"CRITICAL", "HIGH", "MEDIUM", "LOW"}
    if result.get("priority") not in valid_priorities:
        result["priority"] = "HIGH"
    if not result.get("advice", "").strip():
        result["advice"] = "Immediate manual assessment required."
    return result


# ── Routes ─────────────────────────────────────────────────────────────────────

@app.route("/triage", methods=["POST"])
def triage():
    data = request.get_json(silent=True) or {}
    message = (data.get("message") or "").strip()

    if not message:
        return jsonify({"error": "message is required"}), 400

    logger.info(f"Triaging: \"{message[:80]}{'…' if len(message) > 80 else ''}\"")

    try:
        raw = call_ollama(
            prompt=TRIAGE_PROMPT.replace("__MESSAGE__", message),
            system=TRIAGE_SYSTEM,
        )
        logger.info(f"Raw response: {raw[:300]}")
        result = validate_triage(parse_triage(raw))
        logger.info(f"Triage result: {result}")
        return jsonify(result)

    except Exception as exc:
        logger.error(f"Triage error: {exc}")
        return jsonify({
            "priority": "HIGH",
            "advice": "AI triage unavailable — immediate manual assessment required.",
            "fallback": True,
        })


@app.route("/enhance", methods=["POST"])
def enhance():
    data = request.get_json(silent=True) or {}
    text = (data.get("text") or "").strip()

    if not text:
        return jsonify({"error": "text is required"}), 400

    prompt = (
        f"Convert this raw voice transcription into a structured emergency report:\n\n"
        f"Transcription: \"{text}\"\n\n"
        f"Structured Report:"
    )

    try:
        enhanced = call_ollama(prompt=prompt, system=ENHANCE_SYSTEM)
        return jsonify({"enhanced_text": enhanced if enhanced else text})
    except Exception as exc:
        logger.error(f"Enhance error: {exc}")
        return jsonify({"enhanced_text": text})


@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json(silent=True) or {}
    message = (data.get("message") or "").strip()

    if not message:
        return jsonify({"error": "message is required"}), 400

    logger.info(f"Chat: \"{message[:60]}\"")

    try:
        response = call_ollama(
            prompt=f"User: {message}\nAssistant:",
            system=CHAT_SYSTEM,
        )
        return jsonify({"response": response})
    except Exception as exc:
        logger.error(f"Chat error: {exc}")
        return jsonify({
            "response": "⚠️ AI assistant temporarily unavailable. Please contact your rescue operator directly."
        })


@app.route("/test", methods=["GET"])
def test():
    """Quick sanity-check endpoint — sends a known prompt and returns raw output."""
    try:
        raw = call_ollama(
            prompt='Emergency: "A person is trapped under rubble after a building collapse." JSON only:',
            system=TRIAGE_SYSTEM,
        )
        parsed = parse_triage(raw)
        return jsonify({"status": "ok", "raw": raw, "parsed": parsed})
    except Exception as exc:
        return jsonify({"status": "error", "error": str(exc)}), 500


@app.route("/health", methods=["GET"])
def health():
    try:
        resp = requests.get("http://localhost:11434/api/tags", timeout=3)
        models = [m["name"] for m in resp.json().get("models", [])]
        ollama_ok = resp.status_code == 200
        model_ready = any(OLLAMA_MODEL in m for m in models)
    except Exception:
        ollama_ok = False
        model_ready = False
        models = []

    return jsonify({
        "status": "ok" if (ollama_ok and model_ready) else "degraded",
        "engine": "ollama",
        "model": OLLAMA_MODEL,
        "ollama_running": ollama_ok,
        "model_available": model_ready,
        "available_models": models,
    })


if __name__ == "__main__":
    logger.info("ResQMesh AI Triage Service starting on port 5001")
    logger.info(f"Engine: Ollama | Model: {OLLAMA_MODEL}")
    logger.info(f"Test endpoint: http://localhost:5001/test")
    app.run(host="0.0.0.0", port=5001, debug=False)
