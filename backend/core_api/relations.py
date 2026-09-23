"""To-many relation introspection for `BaseViewSet` - what the schema tells
a generic detail screen about each to-many relation, and what the generic
`link`/`unlink` actions need to act on one.

Two kinds, both keyed by the name the serializer emits them under (a
forward M2M's field name, or a reverse relation's accessor name - the same
names `BaseSerializer.get_auto_relations()` uses):
- `one_to_many`: a reverse FK (`Metric.goal` seen from `Goal` as
  `metrics`). The children are managed as their own resource, filtered by
  `back_filter` (`?filter{goal}=<id>`), created with that field set.
- `many_to_many`: a `ManyToManyField`, either side. Rows are linked/
  unlinked rather than created/deleted. A custom `through` model's extra
  fields (`through_fields`) are asked for on link.
"""

from __future__ import annotations

from dataclasses import dataclass

from django.db import models
from rest_framework import serializers

ONE_TO_MANY = "one_to_many"
MANY_TO_MANY = "many_to_many"


@dataclass(frozen=True)
class ToManyRelation:
    name: str
    kind: str
    related_model: type[models.Model]
    # The lookup on the RELATED resource that points back at this row -
    # `?filter{<back_filter>}=<id>` lists exactly this row's related rows.
    back_filter: str
    # Only for `many_to_many` with a hand-written `through` model; `None`
    # for Django's auto-created one (nothing to ask for on link).
    through: type[models.Model] | None = None


def to_many_relation(model: type[models.Model], name: str) -> ToManyRelation | None:
    for field in model._meta.get_fields():
        if field.many_to_many and not field.auto_created and field.name == name:
            # Forward M2M (declared on this model).
            return ToManyRelation(
                name=name,
                kind=MANY_TO_MANY,
                related_model=field.related_model,
                back_filter=field.related_query_name(),
                through=_custom_through(field.remote_field.through),
            )
        if not (field.auto_created and not field.concrete):
            continue
        if not (field.one_to_many or field.many_to_many):
            continue
        if field.get_accessor_name() != name:
            continue
        if field.one_to_many:
            return ToManyRelation(name=name, kind=ONE_TO_MANY, related_model=field.related_model, back_filter=field.field.name)
        # Reverse M2M (declared on the other model).
        return ToManyRelation(
            name=name,
            kind=MANY_TO_MANY,
            related_model=field.related_model,
            back_filter=field.field.name,
            through=_custom_through(field.through),
        )
    return None


def _custom_through(through: type[models.Model]) -> type[models.Model] | None:
    return None if through._meta.auto_created else through


def through_serializer_class(through: type[models.Model]) -> type[serializers.ModelSerializer] | None:
    """A plain `ModelSerializer` over a through model's OWN fields - the
    ones a caller supplies on link (e.g. a membership's `role`). Skips the
    pk, both FKs (set by the link itself) and anything non-editable
    (`auto_now` timestamps). `None` when nothing is left to ask for.
    """
    names = [
        field.name
        for field in through._meta.concrete_fields
        if not field.primary_key and not field.is_relation and field.editable
    ]
    if not names:
        return None
    meta = type("Meta", (), {"model": through, "fields": names})
    return type(f"{through.__name__}LinkSerializer", (serializers.ModelSerializer,), {"Meta": meta})
