from rest_framework.response import Response
from rest_framework.views import APIView

from core_api.modules import get_enabled_modules


class HealthView(APIView):
    authentication_classes = []

    def get(self, request):
        return Response({"status": "ok"})


class ModulesView(APIView):
    """The gateway/registry read-side: which modules the consuming
    platform's `modules.yaml` declares enabled. See core_api/modules.py
    for why the manifest path is env-configured, never hardcoded.
    """

    authentication_classes = []

    def get(self, request):
        return Response({"modules": [module.model_dump() for module in get_enabled_modules()]})
