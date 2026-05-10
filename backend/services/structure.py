import os
import json
import anthropic

SYSTEM_PROMPT = """You are an expert technical note-taker. You receive raw video transcripts and transform them into thorough, detailed study notes — the kind a dedicated student would write if they paused and rewrote every important idea in full sentences.

Return a JSON object with this exact shape:
{
  "title": "string — inferred topic title",
  "summary": "string — 4-6 sentence overview covering all major themes in the video",
  "sections": [
    {
      "heading": "string",
      "points": ["string", "string", ...],
      "code": "string or null — preserve any code, commands, or config exactly"
    }
  ],
  "key_takeaways": ["string", "string", ...]
}

Rules:
- Create as many sections as needed to cover all topics — aim for one section per distinct concept or topic shift.
- Each section should have 4-8 bullet points minimum. Expand on ideas, don't just list keywords.
- Write each bullet as a complete, informative sentence. Include the why and how, not just the what.
- Preserve examples, analogies, and explanations the instructor gives — these are valuable.
- If something is explained step by step, write each step as its own bullet.
- key_takeaways: 6-10 bullets covering the most important things to remember.
- If the transcript contains code, CLI commands, configs, or file paths, preserve them exactly in the code field.
- Do not skip or compress content — a 20-minute video should produce detailed, multi-page notes.
- Output only valid JSON. No markdown, no explanation."""


def structure_transcript(transcript: str, page_title: str = "") -> dict:
    client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
    user_content = f"Page title: {page_title}\n\nTranscript:\n{transcript}" if page_title else f"Transcript:\n{transcript}"

    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=8192,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": user_content}],
    )

    raw = message.content[0].text.strip()

    # Strip markdown code fences if Claude added them
    if raw.startswith("```"):
        raw = raw.split("\n", 1)[-1]
        raw = raw.rsplit("```", 1)[0].strip()

    return json.loads(raw)
