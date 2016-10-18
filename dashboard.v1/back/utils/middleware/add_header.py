from django.http import HttpResponse
import json


class AddCorsHeader(object):
    def __init__(self, get_response):
        self.get_response = get_response

    """
    The Django Debug Toolbar usually only works for views that return HTML.
    This middleware wraps any non-HTML response in HTML if the request
    has a 'debug' query parameter (e.g. http://localhost/foo?debug)
    Special handling for json (pretty printing) and
    binary data (only show data length)
    """

    def __call__(self, request):
        response = self.get_response(request)
        try:
            if request.META['HTTP_ORIGIN'] == "http://localhost:8080" or \
                            request.META['HTTP_ORIGIN'] == "http://localhost:3000":
                response['Access-Control-Allow-Credentials'] = "true"
                response['Access-Control-Allow-Origin'] = request.META['HTTP_ORIGIN']
                response[
                    'Access-Control-Allow-Headers'] = "Origin, X-Requested-With, Content-Type, Accept, Key, accept, authorization, content-type"
        except:
            pass
        return response
