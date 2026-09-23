from django.test import TestCase
from rest_framework.test import APIClient

from tests.testapp.models import Book, Club, Shelf, Tag


def schema_field(response, name):
    return next(field for field in response.json()["fields"] if field["name"] == name)


class SchemaRelationKindTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_reverse_fk_is_one_to_many(self):
        field = schema_field(self.client.get("/shelves/schema"), "books")
        self.assertEqual(field["kind"], "one_to_many")
        self.assertEqual(field["back_filter"], "shelf")
        self.assertEqual(field["related_endpoint"], "/books")
        self.assertNotIn("through_fields", field)

    def test_forward_m2m_auto_through(self):
        field = schema_field(self.client.get("/books/schema"), "tags")
        self.assertEqual(field["kind"], "many_to_many")
        self.assertEqual(field["back_filter"], "books")
        self.assertEqual(field["through_fields"], [])

    def test_reverse_m2m(self):
        field = schema_field(self.client.get("/tags/schema"), "books")
        self.assertEqual(field["kind"], "many_to_many")
        self.assertEqual(field["back_filter"], "tags")

    def test_custom_through_fields(self):
        field = schema_field(self.client.get("/clubs/schema"), "books")
        self.assertEqual(field["kind"], "many_to_many")
        self.assertEqual([f["name"] for f in field["through_fields"]], ["role"])
        self.assertTrue(field["through_fields"][0]["required"])

    def test_to_one_relation_has_no_kind(self):
        field = schema_field(self.client.get("/books/schema"), "shelf")
        self.assertNotIn("kind", field)


class LinkTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.book = Book.objects.create(owner="me", title="Dune")
        self.mine = Tag.objects.create(owner="me", name="scifi")
        self.mine2 = Tag.objects.create(owner="me", name="classic")
        self.theirs = Tag.objects.create(owner="them", name="secret")

    def post(self, path, body):
        return self.client.post(f"{path}?as=me", body, format="json")

    def test_link_and_unlink(self):
        response = self.post(f"/books/{self.book.pk}/relations/tags/link", {"ids": [self.mine.pk, self.mine2.pk]})
        self.assertEqual(response.status_code, 204)
        self.assertEqual(set(self.book.tags.all()), {self.mine, self.mine2})

        response = self.post(f"/books/{self.book.pk}/relations/tags/unlink", {"ids": [self.mine.pk]})
        self.assertEqual(response.status_code, 204)
        self.assertEqual(list(self.book.tags.all()), [self.mine2])
        self.assertTrue(Tag.objects.filter(pk=self.mine.pk).exists())

    def test_linked_rows_listable_by_back_filter(self):
        self.book.tags.add(self.mine)
        response = self.client.get(f"/tags?as=me&filter{{books}}={self.book.pk}")
        self.assertEqual([row["name"] for row in response.json()["items"]], ["scifi"])
        response = self.client.get(f"/tags?as=me&filter{{-books}}={self.book.pk}")
        self.assertEqual([row["name"] for row in response.json()["items"]], ["classic"])

    def test_link_from_reverse_side(self):
        response = self.post(f"/tags/{self.mine.pk}/relations/books/link", {"ids": [self.book.pk]})
        self.assertEqual(response.status_code, 204)
        self.assertEqual(list(self.book.tags.all()), [self.mine])

    def test_cannot_link_row_outside_related_scope(self):
        response = self.post(f"/books/{self.book.pk}/relations/tags/link", {"ids": [self.mine.pk, self.theirs.pk]})
        self.assertEqual(response.status_code, 400)
        self.assertEqual(list(self.book.tags.all()), [])

    def test_cannot_link_from_row_outside_own_scope(self):
        other = Book.objects.create(owner="them", title="Hidden")
        response = self.post(f"/books/{other.pk}/relations/tags/link", {"ids": [self.mine.pk]})
        self.assertEqual(response.status_code, 404)

    def test_one_to_many_is_not_linkable(self):
        shelf = Shelf.objects.create(owner="me", name="Top")
        response = self.post(f"/shelves/{shelf.pk}/relations/books/link", {"ids": [self.book.pk]})
        self.assertEqual(response.status_code, 404)

    def test_ids_required(self):
        response = self.post(f"/books/{self.book.pk}/relations/tags/link", {"ids": []})
        self.assertEqual(response.status_code, 400)

    def test_custom_through_requires_and_stores_fields(self):
        club = Club.objects.create(owner="me", name="Readers")
        response = self.post(f"/clubs/{club.pk}/relations/books/link", {"ids": [self.book.pk]})
        self.assertEqual(response.status_code, 400)
        self.assertEqual(club.books.count(), 0)

        response = self.post(
            f"/clubs/{club.pk}/relations/books/link", {"ids": [self.book.pk], "through": {"role": "pick"}}
        )
        self.assertEqual(response.status_code, 204)
        self.assertEqual(club.clubbook_set.get().role, "pick")

        response = self.post(f"/clubs/{club.pk}/relations/books/unlink", {"ids": [self.book.pk]})
        self.assertEqual(response.status_code, 204)
        self.assertEqual(club.books.count(), 0)


class SchemaResourceTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_names_display_field_and_searchable(self):
        schema = self.client.get("/books/schema").json()
        self.assertEqual(schema["label"], "book")
        self.assertEqual(schema["label_plural"], "books")
        self.assertEqual(schema["display_field"], "title")
        self.assertTrue(schema["searchable"])
        self.assertFalse(self.client.get("/tags/schema").json()["searchable"])

    def test_first_charfield(self):
        self.assertEqual(self.client.get("/shelves/schema").json()["display_field"], "name")

    def test_explicit_display_field(self):
        self.assertEqual(self.client.get("/clubs/schema").json()["display_field"], "name")

    def test_uuid_and_multiline_hints(self):
        fields = {f["name"]: f for f in self.client.get("/books/schema").json()["fields"]}
        self.assertEqual(fields["ref"]["format"], "uuid")
        self.assertTrue(fields["blurb"]["multiline"])
        self.assertNotIn("multiline", fields["title"])
        self.assertNotIn("format", fields["title"])
