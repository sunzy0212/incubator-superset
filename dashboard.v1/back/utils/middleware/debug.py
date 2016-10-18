from django.http import HttpResponse
import json


class NonHtmlDebugToolbarMiddleware(object):
    """
    The Django Debug Toolbar usually only works for views that return HTML.
    This middleware wraps any non-HTML response in HTML if the request
    has a 'debug' query parameter (e.g. http://localhost/foo?debug)
    Special handling for json (pretty printing) and
    binary data (only show data length)
    """

    @staticmethod
    def process_response(request, response):
        if request.GET.get('debug') == '':
            if response['Content-Type'] == 'application/octet-stream':
                new_content = '<html><body>Binary Data, ' \
                              'Length: {}</body></html>'.format(len(response.content))
                response = HttpResponse(new_content)
            elif response['Content-Type'] != 'text/html':
                content = response.content
                try:
                    json_ = json.loads(content.decode("utf-8"))
                    content = json.dumps(json_, sort_keys=True, indent=2)
                except ValueError:
                    pass
                html = '''
                <html><body><style type="text/css">
                pre {outline: 1px solid #ccc; padding: 5px; margin: 5px; font: 20px;}
                .string { color: #3498db; }
                .number { color: #8e44ad; }
                .boolean { color: #8e44ad; }
                .null { color: magenta; }
                .key { color: #e74c3c; }
                </style>
                <script >
                function output(inp) {
                    document.body.appendChild(document.createElement('pre')).innerHTML = inp;
                }

                function syntaxHighlight(json) {
                    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
                        var cls = 'number';
                        if (/^"/.test(match)) {
                            if (/:$/.test(match)) {
                                cls = 'key';
                            } else {
                                cls = 'string';
                            }
                        } else if (/true|false/.test(match)) {
                            cls = 'boolean';
                        } else if (/null/.test(match)) {
                            cls = 'null';
                        }
                        return '<span class="' + cls + '">' + match + '</span>';
                    });
                }

                var obj = %s;
                var str = JSON.stringify(obj, undefined, 4);


                output(syntaxHighlight(str));
                </script></body></html>


                ''' % content
                response = HttpResponse(html)

        return response
