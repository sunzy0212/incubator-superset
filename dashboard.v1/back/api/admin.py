from django.contrib import admin
from .models import Layout


class LayoutAdmin(admin.ModelAdmin):
    list_display = ('dataSet', 'layout', 'datetime',)


admin.site.register(Layout, LayoutAdmin)
