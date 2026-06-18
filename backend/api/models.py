import hashlib
from django.db import models
from django.contrib.auth.models import User


class Evidence(models.Model):

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE
    )

    file = models.FileField(
        upload_to='evidence_files/'
    )

    file_type = models.CharField(
        max_length=50
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

        super().save(*args, **kwargs)

        if not self.hash_value:

            self.hash_value = self.generate_hash()

            super().save(update_fields=['hash_value'])