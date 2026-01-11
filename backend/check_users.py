import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth.models import User
from complaints.models import UserProfile

users = User.objects.all()
print('Total users:', users.count())
for user in users:
    profile = getattr(user, 'profile', None)
    role = getattr(profile, 'role', 'N/A') if profile else 'N/A'
    is_active = 'YES' if user.is_active else 'NO'
    is_staff = 'YES' if user.is_staff else 'NO'
    print(f'  {user.username} | active={is_active} | staff={is_staff} | role={role}')
