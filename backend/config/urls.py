"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.urls import path

from core_api.views import HealthView, ModulesView

# Under /api - same convention platform-auth's own urls.py uses (its
# routes live at /api/v1/auth/...) - so hitting this backend directly
# (bypassing the gateway) shows the same paths the gateway forwards.
urlpatterns = [
    path('api/health', HealthView.as_view(), name='health'),
    path('api/modules', ModulesView.as_view(), name='modules'),
]
