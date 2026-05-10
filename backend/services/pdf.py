import io
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, HRFlowable, Preformatted
)
from reportlab.lib.enums import TA_LEFT

# Color palette
C_BG = colors.HexColor("#0f0f0f")
C_TEXT = colors.HexColor("#e8e8e8")
C_MUTED = colors.HexColor("#888888")
C_ACCENT = colors.HexColor("#4f8ef7")
C_CODE_BG = colors.HexColor("#1a1a1a")
C_RULE = colors.HexColor("#2a2a2a")


def build_styles():
    base = getSampleStyleSheet()

    return {
        "title": ParagraphStyle(
            "title",
            fontName="Helvetica-Bold",
            fontSize=22,
            leading=28,
            textColor=C_TEXT,
            spaceAfter=4,
        ),
        "summary": ParagraphStyle(
            "summary",
            fontName="Helvetica",
            fontSize=11,
            leading=17,
            textColor=C_MUTED,
            spaceAfter=0,
        ),
        "section_heading": ParagraphStyle(
            "section_heading",
            fontName="Helvetica-Bold",
            fontSize=13,
            leading=18,
            textColor=C_ACCENT,
            spaceBefore=14,
            spaceAfter=6,
        ),
        "bullet": ParagraphStyle(
            "bullet",
            fontName="Helvetica",
            fontSize=10,
            leading=15,
            textColor=C_TEXT,
            leftIndent=12,
            spaceAfter=3,
            bulletIndent=0,
        ),
        "takeaway": ParagraphStyle(
            "takeaway",
            fontName="Helvetica",
            fontSize=10,
            leading=15,
            textColor=C_TEXT,
            leftIndent=12,
            spaceAfter=3,
        ),
        "takeaway_label": ParagraphStyle(
            "takeaway_label",
            fontName="Helvetica-Bold",
            fontSize=12,
            leading=18,
            textColor=C_TEXT,
            spaceBefore=14,
            spaceAfter=6,
        ),
        "code": ParagraphStyle(
            "code",
            fontName="Courier",
            fontSize=9,
            leading=13,
            textColor=colors.HexColor("#a8d8a8"),
            backColor=C_CODE_BG,
            leftIndent=10,
            rightIndent=10,
            spaceBefore=6,
            spaceAfter=6,
        ),
    }


def generate_pdf(data: dict) -> bytes:
    buffer = io.BytesIO()
    margin = 18 * mm

    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=margin,
        rightMargin=margin,
        topMargin=margin,
        bottomMargin=margin,
    )

    styles = build_styles()
    story = []

    def rule():
        return HRFlowable(width="100%", thickness=0.5, color=C_RULE, spaceAfter=10, spaceBefore=4)

    # Title + summary
    story.append(Paragraph(data.get("title", "Lesson Notes"), styles["title"]))
    if data.get("summary"):
        story.append(Spacer(1, 4))
        story.append(Paragraph(data["summary"], styles["summary"]))
    story.append(Spacer(1, 8))
    story.append(rule())

    # Sections
    for section in data.get("sections", []):
        story.append(Paragraph(section.get("heading", ""), styles["section_heading"]))

        for point in section.get("points", []):
            story.append(Paragraph(f"• {point}", styles["bullet"]))

        if section.get("code"):
            story.append(Preformatted(section["code"], styles["code"]))

    # Key takeaways
    takeaways = data.get("key_takeaways", [])
    if takeaways:
        story.append(Spacer(1, 6))
        story.append(rule())
        story.append(Paragraph("Key Takeaways", styles["takeaway_label"]))
        for item in takeaways:
            story.append(Paragraph(f"→ {item}", styles["takeaway"]))

    def draw_background(canvas, doc):
        canvas.saveState()
        canvas.setFillColor(C_BG)
        canvas.rect(0, 0, A4[0], A4[1], fill=1, stroke=0)
        canvas.restoreState()

    doc.build(story, onFirstPage=draw_background, onLaterPages=draw_background)
    return buffer.getvalue()
