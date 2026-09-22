"""Tiny model -> API endpoint registry, so `BaseViewSet.schema()` can tell
a relation field's frontend picker where to fetch its OWN rows from (e.g.
`parent`'s `related_model` is `"Goal"` - this is what turns that into
`"/api/v1/goals"`, see `viewsets.py`'s `_describe_field`). A plural
doesn't invert to a model name (or vice versa) in a general way - see
`Organization`'s own `"orgs"` abbreviation - so this can't be derived, it
has to be told: each app's own urls.py calls `register_model_endpoint`
right next to the `router.register(...)` call that already decides the
same mapping, one extra line per resource.
"""

_registry: dict[type, str] = {}


def register_model_endpoint(model: type, path: str) -> None:
    _registry[model] = path


def model_endpoint(model: type) -> str | None:
    return _registry.get(model)
