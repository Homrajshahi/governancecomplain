from rest_framework import permissions, status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.core.cache import cache
from django.core.mail import send_mail
import random
import string
from .models import Complaint, UserProfile
from .serializers import ComplaintSerializer, UserSerializer
from .locations import LOCATION_DATA, get_districts, get_offices, get_provinces


class ComplaintViewSet(viewsets.ModelViewSet):
    serializer_class = ComplaintSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        profile = getattr(user, "profile", None)

        # Admins only see complaints matching their assigned location (if set)
        if user.is_staff or getattr(profile, "role", "user") == "admin":
            queryset = Complaint.objects.all()
            filters = {}
            if profile:
                if profile.assigned_province:
                    filters["province"] = profile.assigned_province
                if profile.assigned_district:
                    filters["district"] = profile.assigned_district
                if profile.assigned_office:
                    filters["office"] = profile.assigned_office
            if filters:
                queryset = queryset.filter(**filters)
            return queryset.order_by("-created_at")

        # End users only see their own complaints
        return Complaint.objects.filter(user=user).order_by("-created_at")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user, status="Pending")

    def partial_update(self, request, *args, **kwargs):
        role = getattr(getattr(request.user, "profile", None), "role", "user")
        if not (request.user.is_staff or role == "admin"):
            return Response({"detail": "Admin only"}, status=status.HTTP_403_FORBIDDEN)

        # Allow admins to change status and remarks only
        allowed_fields = {"status", "remarks"}
        extra_fields = set(request.data.keys()) - allowed_fields
        if extra_fields:
            return Response({"detail": "Only status and remarks can be updated"}, status=status.HTTP_400_BAD_REQUEST)

        return super().partial_update(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        role = getattr(getattr(request.user, "profile", None), "role", "user")
        if not (request.user.is_staff or role == "admin"):
            return Response({"detail": "Admin only"}, status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def me(request):
    user = request.user
    full_name = (f"{user.first_name} {user.last_name}".strip()) or user.email
    profile, _ = UserProfile.objects.get_or_create(user=user)
    return Response({
        "id": user.id,
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "full_name": full_name,
        "role": getattr(profile, "role", "user"),
        "assigned_province": getattr(profile, "assigned_province", ""),
        "assigned_district": getattr(profile, "assigned_district", ""),
        "assigned_office": getattr(profile, "assigned_office", ""),
    })


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def register(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def forgot_password(request):
    """Generate and send OTP for password reset (email)"""
    email = request.data.get("email")
    
    if not email:
        return Response(
            {"detail": "Email is required"}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        # Don't reveal if email exists or not for security
        return Response(
            {"detail": "If email exists, OTP will be sent"}, 
            status=status.HTTP_200_OK
        )
    
    # Generate OTP
    otp = ''.join(random.choices(string.digits, k=6))
    
    # Store OTP in cache for 10 minutes
    cache.set(f"otp_{email}", otp, 600)
    
    # In production, send via email. For now, we'll print it
    print(f"Email OTP for {email}: {otp}")
    
    # Try to send email (will fail in development without email config)
    try:
        send_mail(
            "Password Reset OTP",
            f"Your OTP for password reset is: {otp}\n\nThis OTP will expire in 10 minutes.",
            "noreply@dcms.com",
            [email],
            fail_silently=True,
        )
    except:
        pass
    
    return Response(
        {"detail": "OTP sent to email", "email": email}, 
        status=status.HTTP_200_OK
    )


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def verify_otp(request):
    """Verify OTP and return reset token (email)"""
    email = request.data.get("email")
    otp = request.data.get("otp")
    
    if not email or not otp:
        return Response(
            {"detail": "Email and OTP are required"}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    stored_otp = cache.get(f"otp_{email}")
    
    if not stored_otp:
        return Response(
            {"detail": "OTP expired or not found"}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if stored_otp != otp:
        return Response(
            {"detail": "Invalid OTP"}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Generate reset token
    reset_token = ''.join(random.choices(string.ascii_letters + string.digits, k=32))
    cache.set(f"reset_token_{email}", reset_token, 600)
    
    # Clear OTP after verification
    cache.delete(f"otp_{email}")
    
    return Response(
        {"detail": "OTP verified", "reset_token": reset_token}, 
        status=status.HTTP_200_OK
    )


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def reset_password(request):
    """Reset password using reset token (email)"""
    email = request.data.get("email")
    reset_token = request.data.get("reset_token")
    new_password = request.data.get("new_password")
    
    if not all([email, reset_token, new_password]):
        return Response(
            {"detail": "Email, reset token, and new password are required"}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    stored_token = cache.get(f"reset_token_{email}")
    
    if not stored_token or stored_token != reset_token:
        return Response(
            {"detail": "Invalid or expired reset token"}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        user = User.objects.get(email=email)
        user.set_password(new_password)
        user.save()
        
        # Clear reset token after use
        cache.delete(f"reset_token_{email}")
        
        return Response(
            {"detail": "Password reset successfully"}, 
            status=status.HTTP_200_OK
        )
    except User.DoesNotExist:
        return Response(
            {"detail": "User not found"}, 
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def forgot_password_phone(request):
    """Generate and send OTP for password reset (phone)"""
    phone = request.data.get("phone")

    if not phone:
        return Response({"detail": "Phone is required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        profile = UserProfile.objects.get(phone=phone)
        user = profile.user
    except UserProfile.DoesNotExist:
        # Don't reveal if phone exists
        return Response({"detail": "If phone exists, OTP will be sent"}, status=status.HTTP_200_OK)

    # Generate OTP
    otp = ''.join(random.choices(string.digits, k=6))

    # Store OTP in cache for 10 minutes
    cache.set(f"otp_phone_{phone}", otp, 600)

    # In production, send via SMS provider. For now, print it.
    print(f"SMS OTP for {phone}: {otp}")

    return Response({"detail": "OTP sent to phone", "phone": phone}, status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def verify_otp_phone(request):
    """Verify phone OTP and return reset token"""
    phone = request.data.get("phone")
    otp = request.data.get("otp")

    if not phone or not otp:
        return Response({"detail": "Phone and OTP are required"}, status=status.HTTP_400_BAD_REQUEST)

    stored_otp = cache.get(f"otp_phone_{phone}")

    if not stored_otp:
        return Response({"detail": "OTP expired or not found"}, status=status.HTTP_400_BAD_REQUEST)

    if stored_otp != otp:
        return Response({"detail": "Invalid OTP"}, status=status.HTTP_400_BAD_REQUEST)

    reset_token = ''.join(random.choices(string.ascii_letters + string.digits, k=32))
    cache.set(f"reset_token_phone_{phone}", reset_token, 600)

    cache.delete(f"otp_phone_{phone}")

    return Response({"detail": "OTP verified", "reset_token": reset_token}, status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def reset_password_phone(request):
    """Reset password using phone reset token"""
    phone = request.data.get("phone")
    reset_token = request.data.get("reset_token")
    new_password = request.data.get("new_password")

    if not all([phone, reset_token, new_password]):
        return Response({"detail": "Phone, reset token, and new password are required"}, status=status.HTTP_400_BAD_REQUEST)

    stored_token = cache.get(f"reset_token_phone_{phone}")

    if not stored_token or stored_token != reset_token:
        return Response({"detail": "Invalid or expired reset token"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        profile = UserProfile.objects.get(phone=phone)
        user = profile.user
        user.set_password(new_password)
        user.save()

        cache.delete(f"reset_token_phone_{phone}")

        return Response({"detail": "Password reset successfully"}, status=status.HTTP_200_OK)
    except UserProfile.DoesNotExist:
        return Response({"detail": "User not found"}, status=status.HTTP_404_NOT_FOUND)


@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def locations(request):
    """Return static Nepal location data (province → district → offices)."""
    return Response({
        "provinces": get_provinces(),
        "districts": {province: get_districts(province) for province in get_provinces()},
        "offices": LOCATION_DATA,
    })
