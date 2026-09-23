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
- **`GET /api/modules`** — reads the consuming platform's `modules.yaml`
  (path from the `MODULES_MANIFEST_PATH` env var, since this repo doesn't
  know where a given platform keeps its own manifest) and lists the
  enabled modules. Returns `{"modules": []}` if the env var is unset —
  this is read-only registry groundwork for a future gateway, not a hard
  requirement to boot.
- One other real route: `GET /api/health`. Both live under `/api` on this
  same port, the same convention every module in this platform follows
  (see `platform-auth`'s own `/api/v1/auth/...`).

That's it. Auth lives in its own module
([`platform-auth`](https://github.com/PMNexa/platform-auth)); orgs,
RBAC, and any product feature are expected to become their own modules
the same way — this repo deliberately does not grow entity-specific code
again.

## Frontend

`frontend/` is a thin React Router shell, not a design system or admin
UI — it fetches `GET /api/modules` and, for a module with a `remote_entry`,
loads its exposed component via Module Federation and renders it inline
(`src/lib/remoteComponents.tsx`'s `loadRemoteComponent`); for a module
with only a `url_prefix`, it falls back to a plain same-origin link. The
single-port gateway (parent platform's `nginx/default.conf`) still
handles full-page cross-module navigation (`/platform-auth/*`) - this
frontend's federation loading is for composing a module's UI *into its
own page*, a different thing.

`vite.config.ts`'s `federation()` plugin declares `shared: { react,
'react-dom' }` as singletons with no static `remotes` - which remote(s)
to load is entirely runtime data from `modules.yaml`, registered via
`@module-federation/runtime`'s `registerRemotes`/`loadRemote` as each
module's data arrives.

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
curl http://localhost:8000/api/health
curl http://localhost:8000/api/modules
```

Frontend:

```
cd frontend
npm install
npm run dev   # VITE_API_BASE_URL defaults to "" (same-origin) - only
              # override it if the backend isn't on this same port
```

See the parent platform's own root `docker-compose.yml`/`nginx/
default.conf` for how this actually runs composed with other modules
behind one port.

## License

platform-core is **source-available** under the [PolyForm Shield License 1.0.0](LICENSE).
You may use, modify and share it for any purpose, including inside your
company, **except** providing a product or service that competes with it or
with the licensor's products. That means no hosting it as a paid service and
no selling it or a modified copy of it. For uses the license doesn't allow,
ask about a commercial license. Contributions are accepted under the
[Contributor License Agreement](CONTRIBUTING.md#contributor-license-agreement).

Versions up to and including commit `288df6f` were published under the
MIT License, and copies of those versions remain available under MIT. Later
versions are PolyForm Shield only.
