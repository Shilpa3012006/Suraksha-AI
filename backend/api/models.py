import hashlib
from django.db import models, transaction
from django.contrib.auth.models import User
from .utils.backup_manager import create_backup

class EvidenceSequence(models.Model):
    next_id = models.PositiveIntegerField(default=1)

    def __str__(self):
        return str(self.next_id)

def get_next_evidence_id():
    with transaction.atomic():
        sequence, created = EvidenceSequence.objects.select_for_update().get_or_create(
            pk=1,
            defaults={"next_id": 1}
        )

        current_id = sequence.next_id
        sequence.next_id += 1
        sequence.save(update_fields=["next_id"])

        return current_id
class Evidence(models.Model):
    evidence_id = models.PositiveIntegerField(
        unique=True,
        null=True,
        blank=True,
        editable=False
    )


    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE
    )

    file = models.FileField(
        upload_to='evidence_files/'
    )

    encrypted_file = models.FileField(
    upload_to="encrypted_evidence/",
    blank=True,
    null=True
    )

    file_type = models.CharField(
        max_length=50
    )

    file_name = models.CharField(
    max_length=255,
    blank=True
    )

    file_size = models.BigIntegerField(
    default=0
    )

    description = models.TextField(
        blank=True
    )

    uploaded_at = models.DateTimeField(
        auto_now_add=True
    )

    latitude = models.FloatField(
        null=True,
        blank=True
    )

    longitude = models.FloatField(
        null=True,
        blank=True
    )

    hash_value = models.CharField(
        max_length=256,
        blank=True
    )

    backup_path = models.CharField(
        max_length=500,
        blank=True
    )

    is_tampered = models.BooleanField(
        default=False
    )


    def __str__(self):

        return self.file.name


    def generate_hash(self):

        sha256 = hashlib.sha256()

        self.file.open('rb')

        for chunk in self.file.chunks():

            sha256.update(chunk)

        self.file.close()

        return sha256.hexdigest()


    def save(self, *args, **kwargs):

        if self.file:

            self.file_name = self.file.name
            self.file_size = self.file.size

            if not self.file_type:
                self.file_type = self.file.content_type

        super().save(*args, **kwargs)

        if not self.hash_value:

            self.hash_value = self.generate_hash()

            super().save(update_fields=["hash_value"])


        if self.file and not self.backup_path:

            create_backup(self)

class TrustedContact(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="trusted_contacts"
    )

    name = models.CharField(max_length=100)

    email = models.EmailField()

    phone = models.CharField(max_length=20)

    relationship = models.CharField(max_length=50)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.relationship})"

class Report(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="reports"
    )

    # Existing uploaded evidence reports
    evidence = models.ForeignKey(
        Evidence,
        on_delete=models.CASCADE,
        related_name="reports",
        null=True,
        blank=True
    )

    # Reports generated from Direct Capture
    direct_capture = models.ForeignKey(
        "DirectCapture",
        on_delete=models.CASCADE,
        related_name="reports",
        null=True,
        blank=True
    )

    pdf_file = models.FileField(
        upload_to="reports/"
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        if self.evidence:
            return f"Report for Evidence {self.evidence.id}"

        if self.direct_capture:
            return f"Report for Captured Evidence {self.direct_capture.id}"

        return f"Report {self.id}"

class DirectCapture(models.Model):
    evidence_id = models.PositiveIntegerField(
        unique=True,
        null=True,
        blank=True,
        editable=False
    )
    capture_type = models.CharField(
        max_length=20
    )

    file = models.FileField(
        upload_to="direct_captures/"
    )

    encrypted_file = models.FileField(
        upload_to="encrypted_direct_captures/",
        blank=True,
        null=True
    )

    file_name = models.CharField(
        max_length=255,
        blank=True
    )

    file_size = models.BigIntegerField(
        default=0
    )

    file_type = models.CharField(
        max_length=50,
        blank=True
    )

    captured_at = models.DateTimeField(
        auto_now_add=True
    )

    latitude = models.FloatField(
        null=True,
        blank=True
    )

    longitude = models.FloatField(
        null=True,
        blank=True
    )

    hash_value = models.CharField(
        max_length=256,
        blank=True
    )

    backup_path = models.CharField(
        max_length=500,
        blank=True
    )

    def __str__(self):
        return self.file_name