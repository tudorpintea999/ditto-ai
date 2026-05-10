import os
import logging
import traceback
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from dotenv import load_dotenv

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

from services.transcribe import transcribe_audio
from services.structure import structure_transcript
from services.pdf import generate_pdf
from database import init_db, create_user, get_user_by_key, get_user_by_email, add_minutes

init_db()

app = FastAPI(title="NOTTURA AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["chrome-extension://*", "http://localhost:*", "*"],
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)


def require_user(api_key: str):
    if not api_key:
        raise HTTPException(status_code=401, detail="API key required. Get yours at nottura.ai")
    user = get_user_by_key(api_key)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid API key.")
    if user["minutes_used"] >= user["minutes_limit"]:
        plan = user["plan"]
        if plan == "free":
            raise HTTPException(status_code=403, detail="Free minutes exhausted. Upgrade at nottura.ai")
        else:
            raise HTTPException(status_code=403, detail="Monthly limit reached.")
    return user


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/register")
def register(email: str = Form(...)):
    existing = get_user_by_email(email)
    if existing:
        return {
            "api_key": existing["api_key"],
            "plan": existing["plan"],
            "minutes_used": existing["minutes_used"],
            "minutes_limit": existing["minutes_limit"],
        }
    user = create_user(email)
    return {
        "api_key": user["api_key"],
        "plan": user["plan"],
        "minutes_used": user["minutes_used"],
        "minutes_limit": user["minutes_limit"],
    }


@app.get("/me")
def me(x_api_key: str = Header(...)):
    user = require_user(x_api_key)
    return {
        "email": user["email"],
        "plan": user["plan"],
        "minutes_used": round(user["minutes_used"], 1),
        "minutes_limit": user["minutes_limit"],
        "minutes_remaining": round(user["minutes_limit"] - user["minutes_used"], 1),
    }


@app.post("/process")
async def process(
    audio: UploadFile = File(...),
    title: str = Form(default=""),
    x_api_key: str = Header(...),
):
    user = require_user(x_api_key)

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

    # Track usage — estimate 1 min per 130 words of transcript
    word_count = len(transcript.split())
    minutes = round(word_count / 130, 2)
    add_minutes(user["api_key"], minutes)

    safe_title = (structured.get("title") or "lesson-notes").replace(" ", "-").lower()
    safe_title = safe_title.encode("ascii", errors="ignore").decode()[:50] or "lesson-notes"

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{safe_title}.pdf"'},
    )
