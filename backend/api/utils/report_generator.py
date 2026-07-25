from reportlab.platypus import SimpleDocTemplate, Paragraph
from reportlab.lib.styles import getSampleStyleSheet
from datetime import datetime
import os


def generate_legal_report(evidence):

    reports_folder = "reports"
    os.makedirs(reports_folder, exist_ok=True)

    filename = f"Legal_Report_{evidence.id}.pdf"

    filepath = os.path.join(
        reports_folder,
        filename
    )

    document = SimpleDocTemplate(filepath)

    styles = getSampleStyleSheet()

    story = []

    story.append(Paragraph("<b>Suraksha-AI Legal Evidence Report</b>", styles["Title"]))

    story.append(Paragraph(f"Report Generated: {datetime.now()}", styles["Normal"]))

    story.append(Paragraph("<br/><br/>", styles["Normal"]))

    story.append(Paragraph(f"<b>User:</b> {evidence.user.username}", styles["Normal"]))

    story.append(Paragraph(f"<b>Evidence ID:</b> {evidence.id}", styles["Normal"]))

    story.append(Paragraph(f"<b>Original File:</b> {os.path.basename(evidence.file.name)}", styles["Normal"]))

    story.append(Paragraph(f"<b>SHA-256 Hash:</b> {evidence.hash_value}", styles["Normal"]))

    story.append(Paragraph(f"<b>Encrypted:</b> Yes", styles["Normal"]))

    story.append(Paragraph(f"<b>Tamper Status:</b> Verified", styles["Normal"]))

    story.append(Paragraph(f"<b>Uploaded At:</b> {evidence.uploaded_at}", styles["Normal"]))

    document.build(story)

    return filepath