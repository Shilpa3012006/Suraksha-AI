import os
from django.core.files import File
from django.core.files.base import ContentFile

from api.utils.encryption import encrypt_file
from django.contrib.auth.models import User

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response


@api_view(['GET'])
def test_api(request):

    return Response({
        "message": "Suraksha API active"
    })


@api_view(['POST'])
def signup(request):

    username = request.data['username']
    password = request.data['password']

    user = User.objects.create_user(
        username=username,
        password=password
    )

    return Response({
        "message": "User created successfully"
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def protected_api(request):

    return Response({
        "message": "You are authenticated"
    })

from rest_framework.parsers import MultiPartParser, FormParser

from .models import Evidence
from .serializers import EvidenceSerializer


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_evidence(request):

    serializer = EvidenceSerializer(
        data=request.data
    )

    if serializer.is_valid():

        evidence = serializer.save(
            user=request.user
        )

        original_path = evidence.file.path

        encrypted_path = original_path + ".encrypted"

        encrypt_file(
            original_path,
            encrypted_path
        )
        with open(encrypted_path, "rb") as encrypted_file:

            evidence.encrypted_file.save(
            os.path.basename(encrypted_path),
            File(encrypted_file),
        save=False
        )

        evidence.save()

        return Response({
            "message": "Evidence uploaded successfully"
        })

    return Response(serializer.errors)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_evidence(request):

    evidence = Evidence.objects.filter(
        user=request.user
    )

    serializer = EvidenceSerializer(
        evidence,
        many=True
    )

    return Response(serializer.data)