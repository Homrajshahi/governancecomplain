from django.contrib import admin
from .models import Complaint, UserProfile


@admin.register(Complaint)
class ComplaintAdmin(admin.ModelAdmin):
	list_display = (
		"id",
		"title",
		"category",
		"province",
		"district",
		"office",
		"status",
		"created_at",
	)
	list_filter = ("status", "province", "district", "office", "category")
	search_fields = ("title", "description", "office", "district", "province")


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
	list_display = ("user", "role", "assigned_province", "assigned_district", "assigned_office")
	list_filter = ("role", "assigned_province", "assigned_district")
