import os
import tempfile
from groq import Groq


def transcribe_audio(audio_bytes: bytes, filename: str = "recording.webm") -> str:
    client = Groq(api_key=os.environ["GROQ_API_KEY"])

    with tempfile.NamedTemporaryFile(suffix=".webm", delete=False) as tmp:
        tmp.write(audio_bytes)
        tmp_path = tmp.name

    try:
        with open(tmp_path, "rb") as f:
            result = client.audio.transcriptions.create(
                model="whisper-large-v3",
                file=(filename, f, "audio/webm"),
                response_format="text",
            )
        return result
    finally:
        os.unlink(tmp_path)
