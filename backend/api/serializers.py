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