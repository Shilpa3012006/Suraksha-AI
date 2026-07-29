import tempfile
import os
from django.core.files import File
from django.core.files.base import ContentFile
from .serializers import (
    EvidenceSerializer,
    VerificationSerializer,
    UserProfileSerializer,
)
from .serializers import TrustedContactSerializer
from .models import TrustedContact
# from .serializers import VerificationSerializer

from api.utils.hashing import verify_hash, generate_hash
from api.utils.encryption import encrypt_file
from api.utils.backup import backup_file
from .utils.report_generator import generate_legal_report
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

    full_name = request.data.get("full_name")
    username = request.data.get("username")
    email = request.data.get("email")
    password = request.data.get("password")

    if not full_name or not username or not email or not password:
        return Response(
            {"error": "All fields are required."},
            status=400
        )

    if User.objects.filter(username=username).exists():
        return Response(
            {"error": "Username already exists."},
            status=400
        )

    if User.objects.filter(email=email).exists():
        return Response(
            {"error": "Email already exists."},
            status=400
        )

    user = User.objects.create_user(
        username=username,
        email=email,
        password=password,
        first_name=full_name
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

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def profile(request):

    if request.method == "GET":

        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)

    elif request.method == "PUT":

        user = request.user

        user.first_name = request.data.get(
            "first_name",
            user.first_name
        )

        user.email = request.data.get(
            "email",
            user.email
        )

        user.save()

        serializer = UserProfileSerializer(user)

        return Response({
            "message": "Profile updated successfully",
            "user": serializer.data
        })

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def change_password(request):

    user = request.user

    current_password = request.data.get("current_password")
    new_password = request.data.get("new_password")

    if not user.check_password(current_password):
        return Response(
            {"error": "Current password is incorrect."},
            status=400
        )

    user.set_password(new_password)
    user.save()

    return Response({
        "message": "Password changed successfully."
    })

from rest_framework.parsers import MultiPartParser, FormParser

from .models import Evidence
# from .serializers import EvidenceSerializer


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

        backup_directory = "backups"

        backup_path = backup_file(
            encrypted_path,
            backup_directory
        )

        print(f"Backup created at: {backup_path}")
        return Response({
            "message": "Evidence uploaded successfully"
        })

    return Response(serializer.errors)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_evidence(request):

    evidence = Evidence.objects.filter(
        user=request.user
    ).order_by("-uploaded_at")

    serializer = EvidenceSerializer(
        evidence,
        many=True
    )

    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_evidence(request):

    serializer = VerificationSerializer(data=request.data)

    if not serializer.is_valid():

        return Response(serializer.errors, status=400)

    evidence_id = serializer.validated_data["evidence_id"]

    uploaded_file = serializer.validated_data["file"]

    try:

        evidence = Evidence.objects.get(
            id=evidence_id,
            user=request.user
        )

    except Evidence.DoesNotExist:

        return Response(
            {
                "message": "Evidence not found"
            },
            status=404
        )

    with tempfile.NamedTemporaryFile(delete=False) as temp_file:

        for chunk in uploaded_file.chunks():
            temp_file.write(chunk)

        temp_path = temp_file.name

    new_hash = generate_hash(temp_path)

    os.remove(temp_path)

    if new_hash == evidence.hash_value:

        return Response({
            "status": "original",
            "message": "Original Evidence"
        })

    return Response({
        "status": "modified",
        "message": "Evidence Modified"
    })

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def add_trusted_contact(request):

    serializer = TrustedContactSerializer(data=request.data)

    if serializer.is_valid():

        serializer.save(user=request.user)

        return Response(serializer.data, status=201)

    return Response(serializer.errors, status=400)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_trusted_contacts(request):

    contacts = TrustedContact.objects.filter(user=request.user)

    serializer = TrustedContactSerializer(
        contacts,
        many=True
    )

    return Response(serializer.data)

@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_trusted_contact(request, contact_id):

    try:
        contact = TrustedContact.objects.get(
            id=contact_id,
            user=request.user
        )

        contact.delete()

        return Response(
            {"message": "Trusted contact deleted successfully."},
            status=200
        )

    except TrustedContact.DoesNotExist:

        return Response(
            {"error": "Trusted contact not found."},
            status=404
        )

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def generate_report(request, evidence_id):

    try:

        evidence = Evidence.objects.get(
            id=evidence_id,
            user=request.user
        )

        report_path = generate_legal_report(evidence)

        return Response({
            "message": "Report generated successfully.",
            "report_path": report_path
        })

    except Evidence.DoesNotExist:

        return Response(
            {
                "error": "Evidence not found."
            },
            status=404
        )