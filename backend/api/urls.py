from django.urls import path

from .views import test_api, signup, protected_api, upload_evidence

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

]