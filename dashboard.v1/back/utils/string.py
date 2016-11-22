import random

from django.utils import timezone


def randomWord(length, date=False):
    key = ''.join(
        random.choice("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789") for i in range(length))
    if date:
        key += timezone.now().strftime("%Y%m%d%H%M%S")
    return key


def randomKey(length):
    key = ''.join(
        random.choice("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789") for i in range(length))
    return key
