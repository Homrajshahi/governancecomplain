import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth.models import User
from complaints.models import UserProfile

admins = [
    {
        "username": "ktm_ward_admin",
        "email": "ward.kathmandu@dcms.gov.np",
        "password": "Admin@123",
        "province": "Bagmati",
        "district": "Kathmandu",
        "office": "Ward Office",
    },
    {
        "username": "lalitpur_municipality_admin",
        "email": "municipality.lalitpur@dcms.gov.np",
        "password": "Admin@123",
        "province": "Bagmati",
        "district": "Lalitpur",
        "office": "Municipality Office",
    },
    {
        "username": "bhaktapur_electric_admin",
        "email": "electric.bhaktapur@dcms.gov.np",
        "password": "Admin@123",
        "province": "Bagmati",
        "district": "Bhaktapur",
        "office": "Electricity Authority",
    },
    {
        "username": "chitwan_water_admin",
        "email": "water.chitwan@dcms.gov.np",
        "password": "Admin@123",
        "province": "Bagmati",
        "district": "Chitwan",
        "office": "Water Supply",
    },
    {
        "username": "makwanpur_police_admin",
        "email": "police.makwanpur@dcms.gov.np",
        "password": "Admin@123",
        "province": "Bagmati",
        "district": "Makwanpur",
        "office": "Police (Non-Emergency)",
    },
    {
        "username": "ktm_university_admin",
        "email": "university.kathmandu@dcms.edu.np",
        "password": "Admin@123",
        "province": "Bagmati",
        "district": "Kathmandu",
        "office": "University Administration",
    },
]

for admin_data in admins:
    username = admin_data["username"]
    if User.objects.filter(username=username).exists():
        print(f"✓ {username} already exists")
        continue
    
    user = User.objects.create_superuser(
        username=username,
        email=admin_data["email"],
        password=admin_data["password"],
    )
    
    profile, _ = UserProfile.objects.get_or_create(user=user)
    profile.role = "admin"
    profile.assigned_province = admin_data["province"]
    profile.assigned_district = admin_data["district"]
    profile.assigned_office = admin_data["office"]
    profile.save()
    
    print(f"✓ Created {username}")

print("\n✅ All admin accounts created!")
