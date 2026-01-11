from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import (
    ComplaintViewSet,
    register,
    forgot_password,
    verify_otp,
    reset_password,
    me,
    forgot_password_phone,
    verify_otp_phone,
    reset_password_phone,
    locations,
)

router = DefaultRouter()
router.register(r"complaints", ComplaintViewSet, basename="complaint")

urlpatterns = [
    path("me/", me, name="me"),
    path("auth/register/", register, name="register"),
    path("auth/forgot-password/", forgot_password, name="forgot_password"),
    path("auth/verify-otp/", verify_otp, name="verify_otp"),
    path("auth/reset-password/", reset_password, name="reset_password"),
    path("auth/forgot-password-phone/", forgot_password_phone, name="forgot_password_phone"),
    path("auth/verify-otp-phone/", verify_otp_phone, name="verify_otp_phone"),
    path("auth/reset-password-phone/", reset_password_phone, name="reset_password_phone"),
    path("locations/", locations, name="locations"),
    path("", include(router.urls)),
]
