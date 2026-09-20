"""Shared query-param naming: `?sort=`/`?q=`, not DRF's default
`?ordering=`/`?search=` - every module's list endpoints should use these.
"""

from rest_framework.filters import OrderingFilter, SearchFilter


class SortParamOrderingFilter(OrderingFilter):
    ordering_param = "sort"


class QParamSearchFilter(SearchFilter):
    search_param = "q"
