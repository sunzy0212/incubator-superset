from django.http import HttpResponsePermanentRedirect
from django.conf import settings

class AddApiPermission(object):
    def process_request(self, request):
        if settings.DEBUG != True:
            allow_url = ['/user/login/',
                         '/',
                         '/user/logout/',
                         '/error',
                         '/user/login/token/',
                         '/api/submissions/snippet/']
            if request.META['PATH_INFO'] not in allow_url:
                if not request.user.is_staff:
                    return HttpResponsePermanentRedirect("/")
