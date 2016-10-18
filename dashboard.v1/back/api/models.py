
from django.db import models


class Layout(models.Model):
    dataSet = models.TextField()
    layout = models.TextField()
    datetime = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ('datetime',)
