import os
import logging
import traceback
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from dotenv import load_dotenv

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

from services.transcribe import transcribe_audio
from services.structure import structure_transcript
from services.pdf import generate_pdf

load_dotenv()

app = FastAPI(title="NOTTURA AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["chrome-extension://*", "http://localhost:*"],
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/process")
async def process(
    audio: UploadFile = File(...),
    title: str = Form(default=""),
):
    audio_bytes = await audio.read()

    if len(audio_bytes) < 1000:
        raise HTTPException(status_code=400, detail="Audio file too small. Was the video playing?")

    try:
        transcript = transcribe_audio(audio_bytes, audio.filename or "recording.webm")
    except Exception as e:
        logger.error("Transcription failed:\n%s", traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Transcription failed: {e}")

    if not transcript.strip():
        raise HTTPException(status_code=422, detail="No speech detected in the recording.")

    try:
        structured = structure_transcript(transcript, page_title=title)
    except Exception as e:
        logger.error("AI structuring failed:\n%s", traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"AI structuring failed: {e}")

    try:
        pdf_bytes = generate_pdf(structured)
    except Exception as e:
        logger.error("PDF generation failed:\n%s", traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {e}")

    safe_title = (structured.get("title") or "lesson-notes").replace(" ", "-").lower()
    safe_title = safe_title.encode("ascii", errors="ignore").decode()[:50] or "lesson-notes"

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{safe_title}.pdf"'},
    )
