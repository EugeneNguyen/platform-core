"""Shared query-param naming: `?sort=`/`?q=`, not DRF's default
`?ordering=`/`?search=` - every module's list endpoints should use these.
"""

import re

from rest_framework.filters import BaseFilterBackend, OrderingFilter, SearchFilter


class SortParamOrderingFilter(OrderingFilter):
    ordering_param = "sort"


class QParamSearchFilter(SearchFilter):
    search_param = "q"


_FILTER_KEY_RE = re.compile(r"^filter\{(-?)([\w.]+)\}$")
_LOOKUP_ALIASES = {"in", "icontains", "contains", "gt", "gte", "lt", "lte", "isnull"}


class DynamicFilterBackend(BaseFilterBackend):
    """`?filter{field}=value` (exact match) - the same bracket syntax
    dynamic-rest's own `DynamicFilterBackend` uses, reimplemented here
    against plain Django ORM `.filter()`/`.exclude()` (no dynamic-rest
    dependency). Variants:
    - `?filter{field.lookup}=value` for `icontains`/`contains`/`gt`/`gte`/
      `lt`/`lte`/`isnull` (`isnull` reads `value` as `true`/`false`/`1`/`0`).
    - `?filter{field.in}=a,b,c` (comma-split) for an `IN` lookup.
    - A leading `-` on the field name negates it: `?filter{-status}=invited`
      excludes rather than filters.
    - `.` also traverses relations (`?filter{org.slug}=acme`) the same way
      Django's own `__` does - this only reads as "a nested field path"
      when the last segment ISN'T one of the lookup names above, which
      makes a field or relation literally named e.g. `in` ambiguous. Rare
      enough in practice to accept rather than invent an escape syntax.
    """

    def filter_queryset(self, request, queryset, view):
        for key, values in request.query_params.lists():
            match = _FILTER_KEY_RE.match(key)
            if not match:
                continue
            negate, field_path = match.groups()
            segments = field_path.split(".")
            has_lookup = len(segments) > 1 and segments[-1] in _LOOKUP_ALIASES
            lookup = segments[-1] if has_lookup else None
            field_segments = segments[:-1] if has_lookup else segments
            orm_lookup = "__".join(field_segments) + (f"__{lookup}" if lookup else "")

            value: object = values[-1]
            if lookup == "in":
                value = [v for v in value.split(",") if v]
            elif lookup == "isnull":
                value = value.lower() in ("1", "true", "yes")

            condition = {orm_lookup: value}
            queryset = queryset.exclude(**condition) if negate else queryset.filter(**condition)
        return queryset
