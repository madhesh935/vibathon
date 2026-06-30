"""
ResQMesh Speech-to-Text Service (Optional)
------------------------------------------
Transcribes audio files to text using Faster-Whisper (tiny model).
Useful for victims who cannot type — they can record a voice message
which gets transcribed and fed into the emergency form.

Usage:
  POST /transcribe
  Content-Type: multipart/form-data
  Body: audio=<file>

Returns:
  { "text": "...", "language": "en", "language_probability": 0.99 }
"""

import logging
import os
import tempfile

# Fix for PostgreSQL setting invalid CA bundle paths globally on Windows
for env_var in ['REQUESTS_CA_BUNDLE', 'CURL_CA_BUNDLE', 'SSL_CERT_FILE', 'SSL_CERT_DIR', 'HTTPS_CA_BUNDLE']:
    os.environ.pop(env_var, None)

import requests
from flask import Flask, jsonify, request
from flask_cors import CORS

logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Lazy-load the model to avoid slow startup if unused
_whisper_model = None

def get_model():
    global _whisper_model
    if _whisper_model is None:
        from faster_whisper import WhisperModel  # noqa: PLC0415
        logger.info("Loading Whisper tiny model (first call may take a moment)…")
        _whisper_model = WhisperModel("tiny", device="cpu", compute_type="int8")
        logger.info("Whisper model ready")
    return _whisper_model

AI_SERVICE_URL = "http://localhost:5001/enhance"

def enhance_text(text: str) -> str:
    """Uses the central AI Service to analyse voice transcription and make a detailed problem report."""
    try:
        resp = requests.post(
            AI_SERVICE_URL,
            json={"text": text},
            timeout=20,
        )
        resp.raise_for_status()
        enhanced = resp.json().get("enhanced_text", "").strip()
        return enhanced if enhanced else text
    except Exception as e:
        logger.error(f"Failed to enhance text with AI Service: {e}")
        return text

@app.route("/transcribe", methods=["POST"])
def transcribe():
    if "audio" not in request.files:
        return jsonify({"error": "No audio file — send as multipart field 'audio'"}), 400

    audio_file = request.files["audio"]
    suffix = os.path.splitext(audio_file.filename or "audio.wav")[1] or ".wav"

    import uuid
    tmp_path = os.path.join(tempfile.gettempdir(), f"audio_{uuid.uuid4().hex}{suffix}")
    audio_file.save(tmp_path)

    try:
        model = get_model()
        segments, info = model.transcribe(tmp_path, beam_size=5)
        raw_text = " ".join(seg.text for seg in segments).strip()

        logger.info(f"Raw Transcribed ({info.language}): {raw_text[:100]}")
        
        # Pass to Qwen for detailed analysis
        enhanced_text = enhance_text(raw_text) if raw_text else ""
        
        return jsonify({
            "text": enhanced_text,
            "raw_text": raw_text,
            "language": info.language,
            "language_probability": round(info.language_probability, 3),
        })

    except Exception as exc:
        import traceback
        logger.error(f"Transcription error: {exc}")
        try:
            with open("c:/Users/madhesh/OneDrive/Desktop/qvac/transcribe_error.txt", "w") as f:
                traceback.print_exc(file=f)
        except Exception as log_err:
            logger.error(f"Failed to write error log: {log_err}")
        return jsonify({"error": str(exc), "traceback": traceback.format_exc()}), 500

    finally:
        os.unlink(tmp_path)


@app.route("/health", methods=["GET"])
def health():
    try:
        get_model()
        model_status = "loaded"
    except Exception as exc:
        import traceback
        model_status = f"error: {exc}"
        try:
            with open("c:/Users/madhesh/OneDrive/Desktop/qvac/transcribe_error.txt", "w") as f:
                traceback.print_exc(file=f)
        except:
            pass
    return jsonify({
        "status": "ok",
        "service": "speech-to-text",
        "model": "faster-whisper/tiny",
        "model_status": model_status
    })


if __name__ == "__main__":
    logger.info("ResQMesh Speech Service starting on port 5002")
    app.run(host="0.0.0.0", port=5002, debug=False)
