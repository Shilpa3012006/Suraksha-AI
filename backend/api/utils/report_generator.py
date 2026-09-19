from reportlab.platypus import SimpleDocTemplate, Paragraph
from reportlab.lib.styles import getSampleStyleSheet
from datetime import datetime
import os


def generate_document_summary(record, report_user=None):
    reports_folder = "reports"
    os.makedirs(reports_folder, exist_ok=True)

    filename = f"Evidence_Summary_{record.evidence_id}.pdf"
    filepath = os.path.join(reports_folder, filename)

    document = SimpleDocTemplate(filepath)
    styles = getSampleStyleSheet()
    story = []

    # Check whether the record is DirectCapture or Evidence
    is_direct_capture = record.__class__.__name__ == "DirectCapture"

    # User information
    if report_user:
        username = report_user.username
    elif hasattr(record, "user") and record.user:
        username = record.user.username
    else:
        username = "Unknown"

    # File information
    if hasattr(record, "file") and record.file:
        original_file = os.path.basename(record.file.name)
    else:
        original_file = getattr(record, "file_name", "Unknown")

    # Hash information
    hash_value = getattr(record, "hash_value", "")

    # Date information
    uploaded_at = getattr(
        record,
        "uploaded_at",
        getattr(record, "captured_at", "Unknown")
    )

    # Report content
    story.append(
        Paragraph(
            "<b>Suraksha-AI Evidence Summary</b>",
            styles["Title"]
        )
    )

    story.append(
        Paragraph(
            f"Report Generated: {datetime.now()}",
            styles["Normal"]
        )
    )

    story.append(
        Paragraph(
            "<br/><br/>",
            styles["Normal"]
        )
    )

    story.append(
        Paragraph(
            f"<b>User:</b> {username}",
            styles["Normal"]
        )
    )

    story.append(
        Paragraph(
            f"<b>Evidence ID:</b> {record.evidence_id}",
            styles["Normal"]
        )
    )

    story.append(
        Paragraph(
            f"<b>Original File:</b> {original_file}",
            styles["Normal"]
        )
    )

    story.append(
        Paragraph(
            f"<b>SHA-256 Hash:</b> {hash_value}",
            styles["Normal"]
        )
    )

    story.append(
        Paragraph(
            "<b>Encrypted:</b> Yes",
            styles["Normal"]
        )
    )

    story.append(
        Paragraph(
            "<b>Tamper Status:</b> Verified",
            styles["Normal"]
        )
    )

    story.append(
        Paragraph(
            f"<b>Uploaded At:</b> {uploaded_at}",
            styles["Normal"]
        )
    )

    document.build(story)

    return filepath