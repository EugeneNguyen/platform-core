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

from rest_framework.viewsets import ModelViewSet

from core_api.filters import DynamicFilterBackend, QParamSearchFilter, SortParamOrderingFilter
from core_api.pagination import EnvelopePageNumberPagination
from core_api.serializers import DynamicRelationField


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

        declared_fields = getattr(self.get_serializer_class(), "_declared_fields", {})
        to_prefetch = [
            name for name, field in declared_fields.items() if name in included and isinstance(field, DynamicRelationField)
        ]
        return queryset.prefetch_related(*to_prefetch) if to_prefetch else queryset
