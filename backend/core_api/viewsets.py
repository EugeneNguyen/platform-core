"""`BaseViewSet` - dynamic-rest's `DynamicModelViewSet` equivalent: wires
this platform's own pagination envelope, `?sort=`/`?q=` filtering, and the
`?include[]=`/`?exclude[]=`/`?filter{field}=` query-param conventions
`core_api.serializers.BaseSerializer`/`core_api.filters.
DynamicFilterBackend` implement, so a module only has to declare
`queryset`/`serializer_class` (the standard DRF `ModelViewSet` surface) to
get all of it - no per-module reimplementation of pagination/filtering.

Also auto-`prefetch_related`s any `DynamicRelationField` that's actually
been sideloaded (named in `?include[]=`) - without this, sideloading a
`many=True` relation on a list endpoint means one extra query per row
(the classic N+1), silently, the first time someone tries `?include[]=`
against a real dataset instead of a handful of local test rows.
"""

from rest_framework import serializers as drf_serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from core_api.filters import DynamicFilterBackend, QParamSearchFilter, SortParamOrderingFilter
from core_api.pagination import EnvelopePageNumberPagination
from core_api.registry import model_endpoint
from core_api.serializers import DynamicRelationField

_FIELD_TYPES = (
    (drf_serializers.BooleanField, "boolean"),
    (drf_serializers.ChoiceField, "string"),  # before CharField - not a subclass of it
    (drf_serializers.DecimalField, "number"),
    (drf_serializers.FloatField, "number"),
    (drf_serializers.IntegerField, "integer"),
    (drf_serializers.DateTimeField, "datetime"),  # before DateField - IS a subclass of it
    (drf_serializers.DateField, "date"),
    (drf_serializers.EmailField, "email"),
    (drf_serializers.CharField, "string"),
    (drf_serializers.UUIDField, "string"),
)


def _field_type(field) -> str:
    if isinstance(field, DynamicRelationField):
        return "relation"
    for field_class, type_name in _FIELD_TYPES:
        if isinstance(field, field_class):
            return type_name
    return "string"


def _describe_field(name: str, field, *, deferred: bool, cross_module_endpoint: str | None = None) -> dict:
    description = {
        "name": name,
        "type": _field_type(field),
        "required": bool(getattr(field, "required", False)),
        "read_only": bool(getattr(field, "read_only", False)),
        "label": str(getattr(field, "label", None) or name),
        # Whether an explicit null is accepted - lets a generic form tell
        # "clear this optional value" (send null) apart from "leave it to
        # the server's default" (omit the key) for an emptied input.
        "nullable": bool(getattr(field, "allow_null", False)),
    }
    help_text = getattr(field, "help_text", None)
    if help_text:
        description["help_text"] = str(help_text)
    if isinstance(field, drf_serializers.ChoiceField):
        description["choices"] = [{"value": value, "label": str(label)} for value, label in field.choices.items()]
    if isinstance(field, DynamicRelationField):
        related_serializer_class = field._resolve_serializer_class()
        related_model = getattr(getattr(related_serializer_class, "Meta", None), "model", None)
        description["many"] = field.many
        description["related_model"] = related_model.__name__ if related_model else None
        description["related_endpoint"] = model_endpoint(related_model) if related_model else None
        # Only a to-many relation is ever actually deferred (see
        # BaseSerializer.get_fields()) - carried through here anyway,
        # explicitly, rather than left to be inferred from "many", so a
        # schema consumer doesn't have to know that rule itself.
        description["deferred"] = deferred
    elif cross_module_endpoint:
        # A bare id field (e.g. Goal.org_id) pointing at ANOTHER module's
        # model - never a real FK/`DynamicRelationField` (see root
        # AGENTS.md's "no cross-module DB access" rule and `Goal.org_id`'s
        # own docstring), so `_field_type` above already reported it as a
        # plain "string". A serializer's own `Meta.related_endpoints`
        # (see `BaseViewSet.schema`) is what tags it as a relation anyway,
        # purely for the frontend picker's sake - `related_model` stays
        # `None` (there's no local model class to name; a cross-module
        # import here is exactly what the rule forbids), `many` is always
        # `False` (a bare cross-module id is never a list).
        description["type"] = "relation"
        description["many"] = False
        description["related_model"] = None
        description["related_endpoint"] = cross_module_endpoint
    return description


class BaseViewSet(ModelViewSet):
    pagination_class = EnvelopePageNumberPagination
    filter_backends = [DynamicFilterBackend, SortParamOrderingFilter, QParamSearchFilter]

    def get_queryset(self):
        queryset = super().get_queryset()
        included = set()
        for raw in self.request.query_params.getlist("include[]"):
            included.update(v for v in raw.split(",") if v)
        if not included:
            return queryset

        serializer_class = self.get_serializer_class()
        declared_fields = getattr(serializer_class, "_declared_fields", {})
        prefetchable = {name for name, field in declared_fields.items() if isinstance(field, DynamicRelationField)}
        get_auto_relations = getattr(serializer_class, "get_auto_relations", None)
        if get_auto_relations is not None:
            prefetchable |= set(get_auto_relations())
        to_prefetch = [name for name in included if name in prefetchable]
        return queryset.prefetch_related(*to_prefetch) if to_prefetch else queryset

    @action(detail=False, methods=["get"])
    def schema(self, request):
        """`GET <resource>/schema` - every field this resource's serializer
        can emit, machine-readable enough for a generic CRUD builder to
        derive a form/column/relation-picker config from instead of one
        being hand-written per resource (see goalnexa-frontend's
        `goalsCrudConfig.ts`/`metricsCrudConfig.ts`/`checkInsCrudConfig.ts`
        for the hand-written version this is meant to eventually replace).

        Deliberately bypasses `?include[]=`/`?exclude[]=` filtering (calls
        `get_fields()` directly on a bare instance, not `.fields`, which
        `BaseSerializer.__init__` would have already pruned) - a schema
        describes every POSSIBLE field, including a deferred to-many
        relation this particular request didn't ask to sideload; each
        relation's own `deferred` flag tells the caller which ones that
        applies to, rather than hiding them from the schema entirely.
        No auth/permission bypass here - this action still goes through
        the viewset's own `permission_classes` like any other.

        A serializer's own `Meta.related_endpoints` (`{field_name: url}`,
        e.g. `GoalSerializer`'s `{"org_id": "/api/v1/orgs"}`) tags a bare
        cross-module id field as a relation too, same picker treatment a
        real `DynamicRelationField` gets - see `_describe_field`'s own
        `cross_module_endpoint` branch for why that field can never just
        BE one.
        """
        serializer = self.get_serializer_class()()
        fields = serializer.get_fields()
        deferred = getattr(serializer, "_auto_deferred", set())
        related_endpoints = getattr(getattr(serializer, "Meta", None), "related_endpoints", {})
        for name, field in fields.items():
            # `get_fields()` returns fresh, UNBOUND field instances - only
            # `Field.bind()` (normally triggered by `BindingDict.__setitem__`,
            # i.e. the `.fields` property this deliberately bypasses - see
            # this method's own docstring) fills in `label`'s humanized
            # default ("Target date", not "target_date").
            field.bind(field_name=name, parent=serializer)
        return Response(
            {
                "fields": [
                    _describe_field(name, field, deferred=name in deferred, cross_module_endpoint=related_endpoints.get(name))
                    for name, field in fields.items()
                ]
            }
        )
