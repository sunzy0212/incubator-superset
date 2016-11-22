# -*- coding:utf-8 -*-
from rest_framework import viewsets, permissions
from rest_framework.decorators import list_route
from rest_framework_jwt.settings import api_settings
from .serializers import LoginSerializer

from utils import response


class AuthViewSet(viewsets.GenericViewSet):
    """
    登录相关
    """
    serializer_class = LoginSerializer
    permission_classes = [permissions.AllowAny, ]

    @list_route(['post'])
    def login(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            token = get_jwt_token(serializer.user)
            return response.Ok({'jwt': token})
        else:
            return response.BadRequest(serializer.errors)


def get_jwt_token(user):
    jwt_payload_handler = api_settings.JWT_PAYLOAD_HANDLER
    jwt_encode_handler = api_settings.JWT_ENCODE_HANDLER
    payload = jwt_payload_handler(user)
    return jwt_encode_handler(payload)
