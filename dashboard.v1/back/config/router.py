from rest_framework import routers

router = routers.SimpleRouter(trailing_slash=False)
# profile
from users.apis import AuthViewSet
from api.apis import LayoutViewSet

router.register(r"auth", AuthViewSet, base_name="login")
router.register(r"layout", LayoutViewSet, base_name="layout")
