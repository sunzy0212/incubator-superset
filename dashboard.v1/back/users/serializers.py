from rest_framework import serializers
from django.contrib.auth import authenticate
from django.db.models import Q

from django.contrib.auth.models import User
from . import constants


class LoginSerializer(serializers.Serializer):
    password = serializers.CharField(required=True, max_length=200)
    username = serializers.CharField(required=True, max_length=200)
    next = serializers.CharField(max_length=200, min_length=None, required=False, allow_blank=True)
    default_error_messages = {
        'inactive_account': constants.INACTIVE_ACCOUNT_ERROR,
        'invalid_credentials': constants.INVALID_CREDENTIALS_ERROR,
    }

    def __init__(self, *args, **kwargs):
        super(LoginSerializer, self).__init__(*args, **kwargs)
        self.user = None

    def validate(self, attrs):

        users = User.objects.filter(Q(email=attrs[User.USERNAME_FIELD]) | Q(username=attrs[User.USERNAME_FIELD]))
        if not users.exists():
            raise serializers.ValidationError(self.error_messages['invalid_credentials'])

        self.user = authenticate(username=users[0].username, password=attrs['password'])
        if self.user:
            if not self.user.is_active:
                raise serializers.ValidationError(self.error_messages['inactive_account'])
            return attrs
        else:
            raise serializers.ValidationError(self.error_messages['invalid_credentials'])
