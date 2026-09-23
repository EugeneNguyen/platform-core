from core_api.serializers import BaseSerializer
from core_api.viewsets import BaseViewSet
from tests.testapp.models import Book, Club, Shelf, Tag


class ShelfSerializer(BaseSerializer):
    class Meta:
        model = Shelf


class TagSerializer(BaseSerializer):
    class Meta:
        model = Tag


class BookSerializer(BaseSerializer):
    class Meta:
        model = Book


class ClubSerializer(BaseSerializer):
    class Meta:
        model = Club
        display_field = "name"


class OwnedViewSet(BaseViewSet):
    """Scoped to `?as=<owner>` - stands in for a real module's
    `request.user.id` scoping without needing an auth stack."""

    def get_queryset(self):
        return super().get_queryset().filter(owner=self.request.query_params.get("as", "")).order_by("pk")


class ShelfViewSet(OwnedViewSet):
    queryset = Shelf.objects.all()
    serializer_class = ShelfSerializer


class TagViewSet(OwnedViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer


class BookViewSet(OwnedViewSet):
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    search_fields = ["title"]


class ClubViewSet(OwnedViewSet):
    queryset = Club.objects.all()
    serializer_class = ClubSerializer
