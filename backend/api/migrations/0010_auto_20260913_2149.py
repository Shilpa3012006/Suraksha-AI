from django.db import migrations


def assign_existing_evidence_ids(apps, schema_editor):
    Evidence = apps.get_model("api", "Evidence")
    DirectCapture = apps.get_model("api", "DirectCapture")
    EvidenceSequence = apps.get_model("api", "EvidenceSequence")

    all_records = []

    # Collect uploaded evidence records
    for item in Evidence.objects.all():
        all_records.append(
            (
                item.uploaded_at,
                "uploaded",
                item.pk,
            )
        )

    # Collect directly captured evidence records
    for item in DirectCapture.objects.all():
        all_records.append(
            (
                item.captured_at,
                "captured",
                item.pk,
            )
        )

    # Sort all records together by their creation time
    all_records.sort(
        key=lambda record: record[0] or ""
    )

    next_id = 1

    for created_at, record_type, database_id in all_records:
        if record_type == "uploaded":
            Evidence.objects.filter(
                pk=database_id,
                evidence_id__isnull=True,
            ).update(
                evidence_id=next_id
            )
        else:
            DirectCapture.objects.filter(
                pk=database_id,
                evidence_id__isnull=True,
            ).update(
                evidence_id=next_id
            )

        next_id += 1

    # Make future IDs continue after the existing records
    sequence, created = EvidenceSequence.objects.get_or_create(
        pk=1,
        defaults={"next_id": next_id},
    )

    if not created:
        sequence.next_id = max(sequence.next_id, next_id)
        sequence.save(update_fields=["next_id"])


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0009_evidencesequence"),
    ]

    operations = [
        migrations.RunPython(
            assign_existing_evidence_ids,
            migrations.RunPython.noop,
        ),
    ]