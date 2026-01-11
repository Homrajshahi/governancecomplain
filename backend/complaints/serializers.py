from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Complaint, UserProfile


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True, required=False)
    full_name = serializers.CharField(write_only=True, required=False, allow_blank=True)
    phone = serializers.CharField(write_only=True, required=False, allow_blank=True)
    role = serializers.CharField(read_only=True, default="user")

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "password",
            "confirm_password",
            "first_name",
            "last_name",
            "full_name",
            "phone",
            "role",
        ]
        extra_kwargs = {
            'first_name': {'required': False},
            'last_name': {'required': False},
            'username': {'required': False},
        }

    def validate(self, data):
        # Check if passwords match if confirm_password is provided
        if 'confirm_password' in data:
            if data.get('password') != data.get('confirm_password'):
                raise serializers.ValidationError({"password": "Passwords do not match"})
        
        # Check if email already exists
        email = data.get('email')
        if email and User.objects.filter(email=email).exists():
            raise serializers.ValidationError({"email": "Email already registered"})
        
        return data

    def create(self, validated_data):
        # Remove non-model/write-only fields
        full_name = validated_data.pop("full_name", "").strip()
        phone = validated_data.pop("phone", "").strip()
        validated_data.pop("confirm_password", None)
        password = validated_data.pop("password")

        # Always set username to email for consistency
        validated_data['username'] = validated_data.get('email')

        # If full_name provided, split into first_name and last_name
        if full_name:
            parts = [p for p in full_name.split() if p]
            if parts:
                validated_data['first_name'] = parts[0]
                if len(parts) > 1:
                    validated_data['last_name'] = " ".join(parts[1:])

        user = User(**validated_data)
        user.set_password(password)
        user.save()

        # Save phone on profile if provided
        profile, _ = UserProfile.objects.get_or_create(user=user)
        if phone:
            profile.phone = phone
        # Default all API registrations to end-user role
        if not profile.role:
            profile.role = "user"
        profile.save()

        return user


class ComplaintSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    province = serializers.CharField(required=True)
    district = serializers.CharField(required=True)
    office = serializers.CharField(required=True)

    class Meta:
        model = Complaint
        fields = [
            "id",
            "user",
            "title",
            "description",
            "category",
            "province",
            "district",
            "office",
            "remarks",
            "status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "user", "created_at", "updated_at"]

    def validate(self, attrs):
        request = self.context.get("request")
        province = attrs.get("province")
        district = attrs.get("district")
        office = attrs.get("office")

        # Location validation
        if request and request.method == "POST":
            missing = [field for field in ["province", "district", "office"] if not attrs.get(field)]
            if missing:
                raise serializers.ValidationError({"location": f"Missing fields: {', '.join(missing)}"})

        if request and request.method in ["PUT", "PATCH"]:
            if any(key in attrs for key in ["province", "district", "office"]):
                missing = [field for field in ["province", "district", "office"] if not attrs.get(field)]
                if missing:
                    raise serializers.ValidationError({"location": f"Missing fields: {', '.join(missing)}"})

        if province and district and office:
            from .locations import is_valid_location

            if not is_valid_location(province, district, office):
                raise serializers.ValidationError({"location": "Invalid province/district/office combination"})

        # Status transition rules for admin updates
        if "status" in attrs:
            instance = getattr(self, "instance", None)
            new_status = attrs["status"]
            if instance:
                current_status = instance.status
                allowed_map = {
                    "Pending": {"In Progress", "Rejected"},
                    "In Progress": {"Resolved"},
                    "Rejected": set(),
                    "Resolved": set(),
                }
                if new_status != current_status:
                    if new_status not in allowed_map.get(current_status, set()):
                        raise serializers.ValidationError({
                            "status": f"Cannot change {current_status} to {new_status}"
                        })

        # Only admins can edit status or remarks via API
        if request and request.method in ["PUT", "PATCH"]:
            if any(field in attrs for field in ["status", "remarks"]):
                user = request.user
                role = getattr(getattr(user, "profile", None), "role", "user")
                if not (user.is_staff or role == "admin"):
                    raise serializers.ValidationError({"detail": "Admin only"})

        return attrs
