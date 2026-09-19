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
    evidence_name = serializers.SerializerMethodField()
    evidence_id = serializers.SerializerMethodField()
    source = serializers.SerializerMethodField()

    class Meta:
        model = Report
        fields = [
            "id",
            "evidence",
            "direct_capture",
            "evidence_id",
            "evidence_name",
            "source",
            "pdf_file",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "evidence_id",
            "evidence_name",
            "source",
            "pdf_file",
            "created_at",
        ]

    def get_evidence_name(self, obj):
        if obj.evidence:
            return obj.evidence.file_name

        if obj.direct_capture:
            return (
                obj.direct_capture.file_name
                or obj.direct_capture.file.name
            )

        return ""

    def get_evidence_id(self, obj):
        if obj.evidence:
            return obj.evidence.evidence_id

        if obj.direct_capture:
            return obj.direct_capture.evidence_id

        return None

    def get_source(self, obj):
        if obj.direct_capture:
            return "Captured"

        if obj.evidence:
            return "Uploaded"

        return ""

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