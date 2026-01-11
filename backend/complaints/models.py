from django.conf import settings
from django.db import models


class UserProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="profile")
    phone = models.CharField(max_length=20, unique=True, blank=True, null=True)
    role = models.CharField(
        max_length=20,
        choices=[("user", "User"), ("admin", "Admin")],
        default="user",
    )
    assigned_province = models.CharField(max_length=100, blank=True, null=True)
    assigned_district = models.CharField(max_length=100, blank=True, null=True)
    assigned_office = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self) -> str:
        return f"{self.user.email} - {self.phone or 'no phone'}"


class Complaint(models.Model):
    STATUS_CHOICES = [
        ("Pending", "Pending"),
        ("In Progress", "In Progress"),
        ("Rejected", "Rejected"),
        ("Resolved", "Resolved"),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="complaints")
    title = models.CharField(max_length=255)
    description = models.TextField()
    category = models.CharField(max_length=100)
    province = models.CharField(max_length=100, blank=True, null=True)
    district = models.CharField(max_length=100, blank=True, null=True)
    office = models.CharField(max_length=100, blank=True, null=True)
    remarks = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="Pending")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return f"{self.title} - {self.status}"
