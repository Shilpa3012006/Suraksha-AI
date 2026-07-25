from rest_framework import serializers

from .models import Evidence


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