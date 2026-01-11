from django.contrib import admin
from django.urls import include, path
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.contrib.auth.models import User


class AllowAnyTokenObtainPairView(TokenObtainPairView):
    permission_classes = (AllowAny,)
    
    def post(self, request, *args, **kwargs):
        # Allow login with either username or email
        username = request.data.get('username')
        
        # If it looks like an email, try to find the user by email
        if username and '@' in username:
            try:
                user = User.objects.get(email=username)
                request.data['username'] = user.username
            except User.DoesNotExist:
                pass
        
        return super().post(request, *args, **kwargs)


class AllowAnyTokenRefreshView(TokenRefreshView):
    permission_classes = (AllowAny,)


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/login/", AllowAnyTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/auth/refresh/", AllowAnyTokenRefreshView.as_view(), name="token_refresh"),
        path("api/", include("complaints.urls")),
]
