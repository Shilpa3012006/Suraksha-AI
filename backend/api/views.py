import tempfile
import os

from django.core.files import File
from django.core.files.base import ContentFile

from .serializers import (
    EvidenceSerializer,
    VerificationSerializer,
    UserProfileSerializer,
    ReportSerializer,
    DirectCaptureSerializer,
)

from .serializers import TrustedContactSerializer

from .models import (
    Evidence,
    TrustedContact,
    DirectCapture,
    Report,
    get_next_evidence_id,
)

from api.utils.hashing import verify_hash, generate_hash
from api.utils.encryption import encrypt_file
from api.utils.backup import backup_file
from .utils.report_generator import generate_document_summary

from django.contrib.auth.models import User

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from rest_framework.parsers import MultiPartParser, FormParser


# -------------------------------------------------
# Test API
# -------------------------------------------------

@api_view(["GET"])
def test_api(request):
    return Response({
        "message": "Suraksha API active"
    })


# -------------------------------------------------
# Signup
# -------------------------------------------------

@api_view(["POST"])
def signup(request):

    full_name = request.data.get("full_name")
    username = request.data.get("username")
    email = request.data.get("email")
    password = request.data.get("password")

    if not full_name or not username or not email or not password:
        return Response(
            {
                "error": "All fields are required."
            },
            status=400
        )

    if User.objects.filter(username=username).exists():
        return Response(
            {
                "error": "Username already exists."
            },
            status=400
        )

    if User.objects.filter(email=email).exists():
        return Response(
            {
                "error": "Email already exists."
            },
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


# -------------------------------------------------
# Protected API
# -------------------------------------------------

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def protected_api(request):

    return Response({
        "message": "You are authenticated"
    })


# -------------------------------------------------
# Profile
# -------------------------------------------------

@api_view(["GET", "PUT"])
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


# -------------------------------------------------
# Change Password
# -------------------------------------------------

@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def change_password(request):

    user = request.user

    current_password = request.data.get("current_password")
    new_password = request.data.get("new_password")

    if not user.check_password(current_password):

        return Response(
            {
                "error": "Current password is incorrect."
            },
            status=400
        )

    user.set_password(new_password)
    user.save()

    return Response({
        "message": "Password changed successfully."
    })


# -------------------------------------------------
# Upload Evidence
# -------------------------------------------------

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def upload_evidence(request):

    serializer = EvidenceSerializer(
        data=request.data
    )

    if serializer.is_valid():

        evidence = serializer.save(
            user=request.user,
            evidence_id=get_next_evidence_id()
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

    return Response(
        serializer.errors,
        status=400
    )


# -------------------------------------------------
# My Evidence
# -------------------------------------------------

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_evidence(request):
    """
    Return one unified Evidence Library containing
    uploaded and directly captured evidence.
    """

    # Get all uploaded evidence
    uploaded_evidence = Evidence.objects.filter(
        user=request.user
    )

    # Get all directly captured evidence
    captured_evidence = DirectCapture.objects.all()

    unified_evidence = []

    # -------------------------------------------------
    # Add uploaded evidence
    # -------------------------------------------------

    for item in uploaded_evidence:

        unified_evidence.append({

            "id": item.evidence_id,

            "file_name": (
                item.file_name
                or item.file.name
            ),

            "file_type": (
                item.file_type
                or ""
            ),

            "file": (
                item.file.url
                if item.file
                else None
            ),

            "source": "Uploaded",

            "uploaded_at": item.uploaded_at,

            "verification_status": (
                "Tampered"
                if item.is_tampered
                else "Verified"
            ),

            "is_tampered": item.is_tampered,

            "hash_value": item.hash_value,

            "description": item.description,

            "user": item.user_id,

            "original_id": item.id,

            "record_type": "uploaded",
        })

    # -------------------------------------------------
    # Add directly captured evidence
    # -------------------------------------------------

    for item in captured_evidence:

        unified_evidence.append({

            "id": item.evidence_id,

            "file_name": (
                item.file_name
                or item.file.name
            ),

            "file_type": (
                item.file_type
                or ""
            ),

            "file": (
                item.file.url
                if item.file
                else None
            ),

            "source": "Captured",

            "uploaded_at": item.captured_at,

            "verification_status": "Pending",

            "is_tampered": False,

            "hash_value": item.hash_value,

            "description": "",

            "user": None,

            "original_id": item.id,

            "record_type": "captured",
        })

    # -------------------------------------------------
    # Show newest evidence first
    # -------------------------------------------------

    unified_evidence.sort(
        key=lambda item: item["uploaded_at"] or "",
        reverse=True
    )

    return Response(unified_evidence)


# -------------------------------------------------
# Verify Evidence
# -------------------------------------------------

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def verify_evidence(request):

    serializer = VerificationSerializer(
        data=request.data
    )

    if not serializer.is_valid():
        return Response(
            serializer.errors,
            status=400
        )

    evidence_id = serializer.validated_data["evidence_id"]
    uploaded_file = serializer.validated_data["file"]

    evidence = None
    capture = None

    # -------------------------------------------------
    # Find uploaded Evidence by canonical Evidence ID
    # -------------------------------------------------

    try:
        evidence = Evidence.objects.get(
            evidence_id=evidence_id,
            user=request.user
        )
    except Evidence.DoesNotExist:
        pass

    # -------------------------------------------------
    # If not uploaded evidence, check DirectCapture
    # -------------------------------------------------

    if evidence is None:

        try:
            capture = DirectCapture.objects.get(
                evidence_id=evidence_id
            )
        except DirectCapture.DoesNotExist:
            return Response(
                {
                    "message": "Evidence not found"
                },
                status=404
            )

    # -------------------------------------------------
    # Generate hash of submitted file
    # -------------------------------------------------

    with tempfile.NamedTemporaryFile(
        delete=False
    ) as temp_file:

        for chunk in uploaded_file.chunks():
            temp_file.write(chunk)

        temp_path = temp_file.name

    try:
        new_hash = generate_hash(temp_path)
    finally:
        os.remove(temp_path)

    # -------------------------------------------------
    # Get original stored hash
    # -------------------------------------------------

    original_hash = (
        evidence.hash_value
        if evidence is not None
        else capture.hash_value
    )

    # -------------------------------------------------
    # Compare hashes
    # -------------------------------------------------

    if new_hash == original_hash:

        return Response({
            "status": "original",
            "message": "Original Evidence",
            "evidence_id": evidence_id
        })

    return Response({
        "status": "modified",
        "message": "Evidence Modified",
        "evidence_id": evidence_id
    })


# -------------------------------------------------
# Add Trusted Contact
# -------------------------------------------------

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def add_trusted_contact(request):

    serializer = TrustedContactSerializer(
        data=request.data
    )

    if serializer.is_valid():

        serializer.save(
            user=request.user
        )

        return Response(
            serializer.data,
            status=201
        )

    return Response(
        serializer.errors,
        status=400
    )


# -------------------------------------------------
# List Trusted Contacts
# -------------------------------------------------

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_trusted_contacts(request):

    contacts = TrustedContact.objects.filter(
        user=request.user
    )

    serializer = TrustedContactSerializer(
        contacts,
        many=True
    )

    return Response(serializer.data)


# -------------------------------------------------
# Delete Trusted Contact
# -------------------------------------------------

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
            {
                "message": "Trusted contact deleted successfully."
            },
            status=200
        )

    except TrustedContact.DoesNotExist:

        return Response(
            {
                "error": "Trusted contact not found."
            },
            status=404
        )


# -------------------------------------------------
# Generate Report
# -------------------------------------------------

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def generate_report(request, evidence_id):
    try:
        evidence = None
        capture = None

        # -------------------------------------------------
        # 1. Find normal uploaded Evidence
        # -------------------------------------------------
        try:
            evidence = Evidence.objects.get(
                user=request.user,
                evidence_id=evidence_id
            )
        except Evidence.DoesNotExist:
            pass

        # -------------------------------------------------
        # 2. If not found, find DirectCapture
        # -------------------------------------------------
        if evidence is None:
            try:
                capture = DirectCapture.objects.get(
                    evidence_id=evidence_id
                )
            except DirectCapture.DoesNotExist:
                return Response(
                    {"error": "Evidence not found."},
                    status=404
                )

        # -------------------------------------------------
        # 3. Select the original record
        # -------------------------------------------------
        record = evidence if evidence is not None else capture

        # -------------------------------------------------
        # 4. Generate report without creating Evidence
        # -------------------------------------------------
        report_path = generate_document_summary(
            record,
            report_user=request.user
        )

        # -------------------------------------------------
        # 5. Save Report linked to original record
        # -------------------------------------------------
        with open(report_path, "rb") as pdf:
            report = Report.objects.create(
                user=request.user,
                evidence=evidence,
                direct_capture=capture
            )

            report.pdf_file.save(
                os.path.basename(report_path),
                File(pdf),
                save=True
            )

        # -------------------------------------------------
        # 6. Return response
        # -------------------------------------------------
        serializer = ReportSerializer(
            report,
            context={
                "request": request
            }
        )

        return Response(
            {
                "message": "Report generated successfully.",
                "report": serializer.data
            },
            status=201
        )

    except Exception as error:
        print(
            "REPORT GENERATION ERROR:",
            error
        )

        return Response(
            {
                "error": "Failed to generate report.",
                "details": str(error)
            },
            status=500
        )


# -------------------------------------------------
# List Reports
# -------------------------------------------------

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_reports(request):

    reports = Report.objects.filter(

        user=request.user

    ).order_by(
        "-created_at"
    )

    serializer = ReportSerializer(

        reports,

        many=True,

        context={
            "request": request
        }

    )

    return Response(
        serializer.data
    )


# -------------------------------------------------
# Direct Capture
# -------------------------------------------------

@api_view(["POST"])
def direct_capture(request):
    """
    Public endpoint for capturing evidence without login.
    """

    uploaded_file = request.FILES.get(
        "file"
    )

    capture_type = request.data.get(
        "capture_type"
    )

    latitude = request.data.get(
        "latitude"
    )

    longitude = request.data.get(
        "longitude"
    )

    # -------------------------------------------------
    # Basic validation
    # -------------------------------------------------

    if not uploaded_file:

        return Response(

            {
                "error": "No evidence file provided."
            },

            status=400

        )

    if capture_type not in [
        "photo",
        "video",
        "audio"
    ]:

        return Response(

            {
                "error": "Invalid capture type."
            },

            status=400

        )

    # -------------------------------------------------
    # File size limit: 50 MB
    # -------------------------------------------------

    max_file_size = 50 * 1024 * 1024

    if uploaded_file.size > max_file_size:

        return Response(

            {
                "error": "File size must not exceed 50 MB."
            },

            status=400

        )

    # -------------------------------------------------
    # Create DirectCapture record
    # -------------------------------------------------

    capture = DirectCapture(

        evidence_id=get_next_evidence_id(),

        capture_type=capture_type,

        latitude=(
            latitude
            if latitude
            else None
        ),

        longitude=(
            longitude
            if longitude
            else None
        ),

    )

    capture.file.save(

        uploaded_file.name,

        uploaded_file,

        save=False

    )

    capture.file_name = uploaded_file.name

    capture.file_size = uploaded_file.size

    capture.file_type = (
        uploaded_file.content_type
        or ""
    )

    capture.save()

    # -------------------------------------------------
    # Generate SHA-256 hash
    # -------------------------------------------------

    from api.utils.hashing import generate_hash

    original_path = capture.file.path

    capture.hash_value = generate_hash(
        original_path
    )

    # -------------------------------------------------
    # Encrypt captured evidence
    # -------------------------------------------------

    encrypted_path = (
        original_path
        + ".encrypted"
    )

    encrypt_file(

        original_path,

        encrypted_path

    )

    with open(

        encrypted_path,

        "rb"

    ) as encrypted_file:

        capture.encrypted_file.save(

            os.path.basename(
                encrypted_path
            ),

            File(encrypted_file),

            save=False

        )

    capture.save()

    # -------------------------------------------------
    # Create secure backup
    # -------------------------------------------------

    backup_directory = os.path.join(

        "backups",

        "direct_captures"

    )

    backup_path = backup_file(

        encrypted_path,

        backup_directory

    )

    capture.backup_path = backup_path

    capture.save(
        update_fields=["backup_path"]
    )

    serializer = DirectCaptureSerializer(
        capture
    )

    return Response(

        {

            "message": (
                "Evidence captured and securely preserved."
            ),

            "capture": serializer.data,

        },

        status=201

    )