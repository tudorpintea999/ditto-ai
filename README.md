# Distill — Video to PDF Notes

Capture any video lesson (including paid courses) and get a concise, structured PDF.

## How it works

1. You open a lesson and press Start in the extension.
2. The extension records the tab's audio using Chrome's `tabCapture` API.
3. Audio is sent to a local backend that transcribes it with Whisper, structures it with Claude, and returns a PDF.

No video is downloaded. No platform ToS is violated.

---

## Setup

### 1. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

cp .env.example .env
# Fill in your OPENAI_API_KEY and ANTHROPIC_API_KEY in .env

uvicorn main:app --reload --port 8000
```

### 2. Extension

1. Open Chrome and go to `chrome://extensions`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked**
4. Select the `extension/` folder

The Distill icon appears in your toolbar.

---

## Usage

1. Start the backend (`uvicorn main:app --reload --port 8000`)
2. Open a lesson (Cantrill, Udemy, YouTube, anything)
3. Click the Distill extension icon
4. Press **Start Capture**
5. Watch the lesson (or let it play)
6. Press **Stop & Generate PDF**
7. Wait ~30 seconds for transcription + AI processing
8. Download your notes

---

## Cost per lesson

| Step | Model | Approx cost |
|------|-------|-------------|
| Transcription | Whisper | ~$0.006/min |
| Structuring | Claude Sonnet | ~$0.01–0.03 |
| **Total** | | **~$0.05–0.15 per hour of video** |

---

## Project structure

```
extension/      Chrome extension (Manifest V3)
backend/
  main.py               FastAPI entry point
  services/
    transcribe.py       OpenAI Whisper
    structure.py        Claude — transcript to structured JSON
    pdf.py              ReportLab — JSON to styled PDF
```
