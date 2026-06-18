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

        serializer.save(
            user=request.user
        )

        return Response({
            "message": "Evidence uploaded successfully"
        })


    return Response(
        serializer.errors
    )