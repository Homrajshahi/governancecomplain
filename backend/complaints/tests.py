from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth.models import User
from .models import Complaint


class ComplaintAPITest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="user", password="pass1234")
        self.admin = User.objects.create_superuser(username="admin", password="admin1234", email="admin@example.com")

    def test_register(self):
        url = reverse("register")
        payload = {"username": "newuser", "password": "pass1234"}
        response = self.client.post(url, payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_user_can_create_complaint(self):
        self.client.login(username="user", password="pass1234")
        url = reverse("complaint-list")
        payload = {"title": "Broken light", "description": "Fix needed", "category": "Maintenance"}
        response = self.client.post(url, payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Complaint.objects.count(), 1)

    def test_non_admin_cannot_update_status(self):
        self.client.login(username="user", password="pass1234")
        complaint = Complaint.objects.create(user=self.user, title="Test", description="", category="General")
        url = reverse("complaint-detail", args=[complaint.id])
        response = self.client.patch(url, {"status": "Resolved"})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
