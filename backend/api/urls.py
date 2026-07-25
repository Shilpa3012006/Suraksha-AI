from django.urls import path

from .views import test_api, signup, protected_api, upload_evidence, my_evidence, verify_evidence, add_trusted_contact, list_trusted_contacts, delete_trusted_contact, generate_report

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)


urlpatterns = [

    path('test/', test_api),

    path('signup/', signup),

    path('login/', TokenObtainPairView.as_view()),

    path('refresh/', TokenRefreshView.as_view()),

    path('protected/', protected_api),

    path('upload-evidence/', upload_evidence),

    path('my-evidence/', my_evidence),

    path('verify-evidence/', verify_evidence),

    path(
    "trusted-contacts/",
    add_trusted_contact,
    name="add_trusted_contact",
),

path(
    "trusted-contacts/list/",
    list_trusted_contacts,
    name="list_trusted_contacts",
),

path(
    "trusted-contacts/delete/<int:contact_id>/",
    delete_trusted_contact,
    name="delete_trusted_contact",
),

path(
    "generate-report/<int:evidence_id>/",
    generate_report,
    name="generate_report",
),

]