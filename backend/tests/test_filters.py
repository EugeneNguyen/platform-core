from django.test import TestCase
from rest_framework.test import APIClient

from tests.testapp.models import Book


class DynamicFilterTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        Book.objects.create(owner="me", title="Dune")

    def get(self, query):
        return self.client.get(f"/books?as=me&{query}")

    def test_valid_filter(self):
        self.assertEqual(self.get("filter{title.icontains}=dun").json()["total"], 1)

    def test_bad_filters_are_400s(self):
        for query in (
            "filter{nope}=1",  # unknown field
            "filter{title.name.icontains}=x",  # relation path through a plain field
            "filter{ref}=not-a-uuid",  # value the field can't take
            "filter{-shelf.nope}=1",  # negated, through a relation
        ):
            with self.subTest(query=query):
                response = self.get(query)
                self.assertEqual(response.status_code, 400)
                self.assertEqual(response.json()["code"], "validation_error")
