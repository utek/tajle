from pyramid.view import view_config
from .models import TrainsCollection


@view_config(context=TrainsCollection, renderer='jsonp')
def pkp(context, request):
    # Yup. I know that this here is kinda bad.
    # Need to fix it ASAP :)
    headers = ("Access-Control-Allow-Origin", request.headers.get("Origin", ""))
    request.response.headerlist.append(headers)
    return context.geodict
