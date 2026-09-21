"""`BaseSerializer` - dynamic field selection + relation sideloading,
the same two ideas django-rest-framework's `dynamic-rest` package is
built around. Reimplemented against this platform's own conventions
(`?include[]=`/`?exclude[]=` naming, no dependency on dynamic-rest itself)
rather than vendored, since dynamic-rest hard-codes its own pagination/
routing opinions this platform already has its own answers for
(`EnvelopePageNumberPagination`, `?sort=`/`?q=` - see pagination.py/
filters.py).

Two behaviors:
- `?include[]=field`/`?exclude[]=field` control which declared fields
  actually serialize. A field listed in `Meta.deferred_fields` is left
  out unless explicitly included; any field can be excluded on request.
- `DynamicRelationField` wraps another `BaseSerializer` for a relation.
  It renders as a bare id (or list of ids for `many=True`) by default -
  "sideloading" it (naming it in `?include[]=`) swaps in the full nested
  representation instead. Usually paired with listing the relation's name
  in `Meta.deferred_fields`, so a plain list/retrieve stays cheap and a
  caller opts into the expensive nested representation explicitly.
"""

from __future__ import annotations

from rest_framework import serializers


def _query_param_set(request, param: str) -> set[str]:
    """Query lists sent as a bare comma-joined value (`?include[]=a,b`) as
    well as literal repeats (`?include[]=a&include[]=b`) - both are common
    depending on how the caller builds the query string.
    """
    if request is None:
        return set()
    values: set[str] = set()
    for raw in request.query_params.getlist(param):
        values.update(v for v in raw.split(",") if v)
    return values


class DynamicRelationField(serializers.Field):
    def __init__(self, serializer_class, *, many: bool = False, **kwargs):
        # Accepts the class directly, or a zero-arg callable returning it
        # (e.g. a lambda) - lets two serializers reference each other
        # (Organization -> memberships -> OrgMembership -> org -> ...)
        # without a circular import at module load time.
        self._serializer_class = serializer_class
        self.many = many
        kwargs.setdefault("read_only", True)
        super().__init__(**kwargs)

    def _resolve_serializer_class(self):
        cls = self._serializer_class
        return cls() if callable(cls) and not isinstance(cls, type) else cls

    def to_representation(self, value):
        if value is None:
            return [] if self.many else None

        request = self.context.get("request")
        included = _query_param_set(request, "include[]")

        if self.field_name in included:
            serializer_class = self._resolve_serializer_class()
            return serializer_class(value, many=self.many, context=self.context).data

        if self.many:
            related_iterable = value.all() if hasattr(value, "all") else value
            return [related.pk for related in related_iterable]
        return value.pk


class BaseSerializer(serializers.ModelSerializer):
    """Subclass instead of `serializers.ModelSerializer` for any entity
    that should support dynamic field selection. `Meta.fields` lists
    every field this serializer CAN emit, same as plain DRF; the optional
    `Meta.deferred_fields` (a subset of `Meta.fields`) lists the ones left
    out unless explicitly named in `?include[]=`.
    """

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get("request")
        deferred = set(getattr(self.Meta, "deferred_fields", ()))
        included = _query_param_set(request, "include[]")
        excluded = _query_param_set(request, "exclude[]")
        for name in list(self.fields):
            if name in excluded or (name in deferred and name not in included):
                del self.fields[name]
