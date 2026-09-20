# platform-core

A pure kernel of shared Django + DRF conventions for building modules in
this platform's `apps/`-based, multi-module architecture — no models, no
auth, no product logic of its own. Ships:

- **`{code, message, field_errors}` error contract** — a `core_api.errors`
  hierarchy plus a DRF `EXCEPTION_HANDLER` (`core_api.exceptions`) that
  maps DRF's own exceptions to it too, so every module wiring this in
  responds with the same error shape.
- **`{items, total, page, page_size}` pagination envelope**
  (`core_api.pagination.EnvelopePageNumberPagination`) — not DRF's own
  default envelope.
- **`?sort=`/`?q=` filter/search param names**
  (`core_api.filters.SortParamOrderingFilter`/`QParamSearchFilter`) — not
  DRF's `?ordering=`/`?search=` defaults.
- **UUIDv7 primary keys + a timestamp mixin** (`core_api.utils`) — every
  module's own models should use `generate_uuid7` as their PK default and
  inherit `TimestampedModel`, for id/timestamp consistency across modules
  with independent databases.
- **`GET /modules`** — reads the consuming platform's `modules.yaml` (path
  from the `MODULES_MANIFEST_PATH` env var, since this repo doesn't know
  where a given platform keeps its own manifest) and lists the enabled
  modules. Returns `{"modules": []}` if the env var is unset — this is
  read-only registry groundwork for a future gateway, not a hard
  requirement to boot.
- One other real route: `GET /health`.

That's it. Auth lives in its own module
([`platform-auth`](https://github.com/EugeneNguyen/platform-auth)); orgs,
RBAC, and any product feature are expected to become their own modules
the same way — this repo deliberately does not grow entity-specific code
again.

## Frontend

`frontend/` is a thin React Router shell, not a design system or admin
UI — it fetches `GET /modules` from this repo's own backend and, for each
module that has a `frontend_url`, either lists it on the home page or
hands off the browser to it on `/:moduleName/*` (`/platform-auth/login`
redirects to `${frontend_url}/login`). There is no module federation yet
— composing another module's UI in-process is future work, this is just
routing between separately-deployed frontends.

## Using this in your own module

There's no submodule/import coupling expected between modules in this
architecture (see the parent platform's `docs/architecture/
microservices-design.md`) — copy the `core_api/` conventions into your
module's own settings (`EXCEPTION_HANDLER`, `DEFAULT_PAGINATION_CLASS`,
`DEFAULT_FILTER_BACKENDS`) the way `platform-auth` does, rather than
importing this repo's code directly. Treat this repo as the reference
implementation of these conventions, not a runtime dependency.

## Running it

```
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -e ".[dev]"
python manage.py migrate   # only auth/contenttypes tables; nothing queries them yet
MODULES_MANIFEST_PATH=/path/to/your/platform/modules.yaml python manage.py runserver
curl http://localhost:8000/health
curl http://localhost:8000/modules
```

Frontend:

```
cd frontend
npm install
echo "VITE_API_BASE_URL=http://localhost:8000" > .env
npm run dev
```

## License

MIT — see [LICENSE](LICENSE).
