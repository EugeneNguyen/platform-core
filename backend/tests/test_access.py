from django.test import TestCase, override_settings
from rest_framework.test import APIClient

from core_api.access import AccessPolicy, action_verb, resource_key, scope_of
from tests.testapp.models import Shelf


class HeaderPolicy(AccessPolicy):
    """Grants from an `X-Allow` header: `resource.verb` (everywhere) or
    `resource.verb:scope` (one scope), comma-separated."""

    def _grants(self, request, view):
        wanted = f"{resource_key(view)}.{action_verb(view)}"
        grants = [g.strip() for g in request.headers.get("X-Allow", "").split(",") if g.strip()]
        everywhere = wanted in grants
        scopes = {g.split(":", 1)[1] for g in grants if g.startswith(f"{wanted}:")}
        return everywhere, scopes

    def has_permission(self, request, view):
        everywhere, scopes = self._grants(request, view)
        return everywhere or bool(scopes)

    def has_object_permission(self, request, view, obj):
        everywhere, scopes = self._grants(request, view)
        return everywhere or str(scope_of(obj, view.scope_field)) in scopes

    def filter_queryset(self, request, view, queryset):
        everywhere, scopes = self._grants(request, view)
        if everywhere or view.action not in ("list", "retrieve"):
            return queryset
        return queryset.filter(**{f"{view.scope_field}__in": scopes})


@override_settings(CORE_API_ACCESS_POLICY="tests.test_access.HeaderPolicy")
class AccessPolicyTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.x = Shelf.objects.create(name="x", owner="me")
        self.y = Shelf.objects.create(name="y", owner="me")

    def call(self, method, path, allow, data=None):
        return getattr(self.client, method)(f"{path}?as=me", data, format="json", HTTP_X_ALLOW=allow)

    def names(self, response):
        return [row["name"] for row in response.json()["items"]]

    def test_list_needs_view(self):
        self.assertEqual(self.call("get", "/shelves", "").status_code, 403)

    def test_list_everywhere(self):
        self.assertEqual(self.names(self.call("get", "/shelves", "shelves.view")), ["x", "y"])

    def test_list_narrowed_to_scope(self):
        self.assertEqual(self.names(self.call("get", "/shelves", "shelves.view:x")), ["x"])

    def test_retrieve_outside_scope_is_hidden(self):
        self.assertEqual(self.call("get", f"/shelves/{self.y.pk}", "shelves.view:x").status_code, 404)

    def test_create_in_allowed_scope(self):
        response = self.call("post", "/shelves", "shelves.create:z", {"name": "z", "owner": "me"})
        self.assertEqual(response.status_code, 201)

    def test_create_outside_scope_rolls_back(self):
        response = self.call("post", "/shelves", "shelves.create:x", {"name": "z", "owner": "me"})
        self.assertEqual(response.status_code, 403)
        self.assertFalse(Shelf.objects.filter(name="z").exists())

    def test_update_cannot_move_into_other_scope(self):
        response = self.call("patch", f"/shelves/{self.x.pk}", "shelves.update:x", {"name": "y2"})
        self.assertEqual(response.status_code, 403)
        self.x.refresh_from_db()
        self.assertEqual(self.x.name, "x")

    def test_update_within_scope(self):
        response = self.call("patch", f"/shelves/{self.x.pk}", "shelves.update:x,shelves.update:x2", {"name": "x2"})
        self.assertEqual(response.status_code, 200)

    def test_delete_needs_delete_in_scope(self):
        self.assertEqual(self.call("delete", f"/shelves/{self.x.pk}", "shelves.delete:y").status_code, 403)
        self.assertEqual(self.call("delete", f"/shelves/{self.x.pk}", "shelves.delete:x").status_code, 204)


class AccessHelperTests(TestCase):
    def test_scope_of_walks_a_path(self):
        shelf = Shelf(name="x", owner="me")
        self.assertEqual(scope_of(shelf, "name"), "x")
        self.assertIsNone(scope_of(shelf, None))
        self.assertIsNone(scope_of(shelf, "missing__name"))

    def test_no_policy_changes_nothing(self):
        Shelf.objects.create(name="x", owner="me")
        response = APIClient().get("/shelves?as=me")
        self.assertEqual(response.status_code, 200)
