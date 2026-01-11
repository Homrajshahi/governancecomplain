import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.test import Client

client = Client()

# Test admin login
response = client.post(
    '/api/auth/login/',
    json.dumps({
        'username': 'bhaktapur_electric_admin',
        'password': 'Admin@123'
    }),
    content_type='application/json'
)

print(f"Status: {response.status_code}")
print(f"Response: {response.json()}")
