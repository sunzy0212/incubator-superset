# -*- coding:utf-8 -*-
from rest_framework import viewsets, mixins, response, status
from .serializers import LayoutSerializer
from .models import Layout
import json
from utils import response


class LayoutViewSet(viewsets.GenericViewSet, mixins.CreateModelMixin):
    serializer_class = LayoutSerializer
    queryset = Layout.objects.all()

    def create(self, request, *args, **kwargs):
        _data = request.data
        _data['layout'] = json.dumps(_data['layout'])
        _data['dataSet'] = json.dumps(_data['dataSet'])
        serializer = self.get_serializer(data=_data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return response.Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def list(self, request, *args, **kwargs):
        serializer = self.get_serializer(self.get_queryset().last())
        return response.Response(serializer.data)
