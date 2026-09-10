from rest_framework import serializers

from .models import Evidence, Report, DirectCapture


class EvidenceSerializer(serializers.ModelSerializer):

    class Meta:

        model = Evidence

        fields = '__all__'

        read_only_fields = [
            'user',
            'uploaded_at',
            'hash_value',
            'is_tampered'
        ]

class VerificationSerializer(serializers.Serializer):

    evidence_id = serializers.IntegerField()

    file = serializers.FileField()

from .models import TrustedContact

class TrustedContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrustedContact
        fields = [
            "id",
            "name",
            "email",
            "phone",
            "relationship",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]

from django.contrib.auth.models import User


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "first_name",
            "username",
            "email",
            "date_joined",
        ]

class ReportSerializer(serializers.ModelSerializer):
    evidence_name = serializers.CharField(
        source="evidence.file_name",
        read_only=True
    )

    class Meta:
        model = Report
        fields = [
            "id",
            "evidence",
            "evidence_name",
            "pdf_file",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "evidence_name",
            "pdf_file",
            "created_at",
        ]

class DirectCaptureSerializer(serializers.ModelSerializer):
    class Meta:
        model = DirectCapture
        fields = [
            "id",
            "capture_type",
            "file",
            "encrypted_file",
            "file_name",
            "file_size",
            "file_type",
            "captured_at",
            "latitude",
            "longitude",
            "hash_value",
            "backup_path",
        ]
        read_only_fields = [
            "id",
            "encrypted_file",
            "file_name",
            "file_size",
            "file_type",
            "captured_at",
            "hash_value",
            "backup_path",
        ]