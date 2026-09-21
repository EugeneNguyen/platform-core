# AGENTS.md

Guidance for AI coding agents (Claude Code and others — this repo follows
the cross-tool `AGENTS.md` convention, not a Claude-specific file) working
in this repo.

## What this repo is now

platform-core used to be a starter kit bundling auth, orgs, RBAC, and a
generic CRUD factory (FastAPI + SQLAlchemy + Alembic). That's gone: the
backend was rewritten on Django + DRF and stripped down to a pure
**kernel with no models of its own** — shared conventions other modules
build on (error contract, pagination, filters, uuid7/timestamp utils,
`BaseSerializer`/`BaseViewSet`), nothing else. Auth now lives in its own
module (`platform-auth`); orgs/RBAC/product features are expected to
become their own modules the same way, not get added back here.

**No longer just "kept for reference".** `platform-auth` and
`platform-org` both depend on this repo's `core_api` for real now (see
their own AGENTS.md) - each used to vendor its own near-identical copy of
`errors.py`/`exceptions.py`/`utils.py` (a deliberate "modules share
nothing at source level" choice from when this repo was still the
Module-Federation-era kernel, not in active use). That copy-per-module
approach doesn't scale once a module needs `BaseSerializer`/`BaseViewSet`
(real, nontrivial code, not three small files worth re-vendoring
everywhere) - so this is now a genuine shared dependency, installed
editable alongside every module that needs it (see
`apps/main`'s root `AGENTS.md` and `docker-compose.yml`). The frontend
half (Module Federation shell) is unaffected and still not part of the
default `docker-compose.yml` - this change is backend-only.

## Repo layout

| Path | What |
|---|---|
| `backend/` | Django + DRF. `config/` (settings/urls/wsgi/asgi), `core_api/` (errors, exceptions, pagination, filters, uuid7 utils, `BaseSerializer`/`BaseViewSet` — a library, not a Django app; no models). Real routes: `GET /api/health`, `GET /api/modules` — under `/api`, same convention every module in this platform follows. |
| `frontend/` | Two things sharing one package: (1) its own React + Vite + TS + react-router-dom Module Federation shell — no design system, no admin CRUD surface (that's gone, see history note below); fetches `GET /api/modules`, loads a module's `remote_entry` and renders it inline when present, falls back to a plain `url_prefix` link otherwise; and (2) the `platform-core` npm package (`src/index.ts`, `exports` in `package.json`) that `apps/main` imports as a `file:` dependency for `AppShell` (sidemenu + sticky header) — see "AppShell" below. |

`core_api/modules.py` reads `MODULES_MANIFEST_PATH` (an env var, not a
hardcoded path) to find the consuming platform's `modules.yaml` — this
repo is reused across platforms and must never assume where a given one
keeps its manifest. Unset var / missing file -> empty list, not an error.
`ModuleConfig.url_prefix`/`remote_entry` are both optional (a backend-only
module, or platform-core itself at the gateway root, has neither) — the
frontend must handle `null` rather than assuming every module has them.

## Module Federation (frontend composing another module's UI inline)

`src/lib/remoteComponents.tsx`'s `loadRemoteComponent(module, exposedName)`
registers a module as a runtime remote (`registerRemotes`, idempotent)
and loads one exposed component (`loadRemote`) from `@module-federation/
runtime`. `vite.config.ts` declares `shared: { react, 'react-dom' }` as
singletons - **this must match the remote's own shared config exactly**
(same packages, `singleton: true`, compatible `requiredVersion` ranges)
or you get two React instances loaded and a genuinely confusing "invalid
hook call" crash from inside the remote's own component, not this repo's
code. If you add a new shared dependency here, add it to every remote's
`vite.config.ts` too.

A remote must be built (`vite build`), not served via `vite dev` — Vite's
dev server has no bundling step to emit a `remoteEntry.js` from. This
repo's own frontend (the host) stays on `vite dev` fine; it's only the
remote side (`platform-auth`, etc.) that needs `vite build --watch` +
`vite preview` instead — see root `docker-compose.yml`.

## AppShell (`src/atoms`/`molecules`/`organisms`/`templates`)

Absorbed from the former `platform-ui` module — that repo was frontend-
only (no backend, no models), so it had nothing else to justify its own
git submodule once this platform's convention became "packaged frontend
+ Django app together" per module. Same "frontend npm package, main
imports it" rule as `platform-auth`/`platform-org`'s frontend halves
(see root `AGENTS.md`), just living inside this repo's `frontend/`
alongside the Module Federation shell above rather than in its own repo
— the two don't share code, they just happen to be packaged together
now.

`AppShell` (`templates/DashboardLayout`, exported from `src/index.ts`)
is pure presentation: sidemenu + sticky header, built from Tabler's own
vertical-navbar page layout, composed atomic-design style (`atoms/` →
`molecules/` → `organisms/` → `templates/`, each level only importing
from levels below it — `types.tsx` holds the shared prop types every
level imports from). Zero react-router dependency of its own (every
level that renders a link takes a `linkComponent` prop instead of
calling a router hook) and zero auth-state of its own (`user`/`onLogout`
are passed in) — same conventions as this platform's other module
frontends. See `apps/main/frontend/app/routes/app-shell.tsx` for the
reference consumer.

**`Header` must never carry a `navbar-expand-*` class** — Tabler's CSS
treats any `.page` child matching `[class*=navbar-expand]` that isn't
`.navbar-vertical` as "the other navigation" and hides one of the two
navbars depending on `data-bs-navbar-position`; an earlier version of
`Header` had `navbar-expand-md` leftover from copying Tabler's
single-navbar sample, which made `Sidebar` invisible unconditionally at
every viewport width, not just mobile (the element still reports
`position: fixed` from `getComputedStyle` even while `display:none`,
which is what made an earlier check wrongly conclude only mobile was
broken). Keep checking this if you ever add a class to `Header`.

**The sidebar's mobile toggler needs Bootstrap's JS** (`data-bs-toggle=
"collapse"`) — inert without it. The host loads Tabler's JS bundle (see
`apps/main/frontend/app/root.tsx`'s `<script>` tag), same "host loads
the design system" convention as Tabler's CSS.

## Single-port composition

The parent platform composes every module behind one nginx port
(`nginx/default.conf` in that platform's own repo), path-prefixed per
`modules.yaml`'s `url_prefix`. If you add a route here, it's reachable
both directly (`platform-core-backend:8000/api/...`) and through the
gateway (`<gateway>/api/...`, no rewriting needed since platform-core
itself has no prefix). A module WITH a prefix (like `platform-auth` at
`/platform-auth`) needs its own frontend served with a matching Vite
`base` and any absolute cookie paths built from an env-configured prefix
— see `platform-auth`'s `URL_PREFIX` setting for the pattern.

## History note

An earlier frontend (Tabler design system, generic admin CRUD surface,
login/signup/org pages) was deleted when the backend dropped its auth/
org/RBAC/CRUD-factory routes — the current `frontend/` is a from-scratch,
much smaller replacement (a router shell, not a UI), not a continuation
of that one.

## `BaseSerializer` / `BaseViewSet` - dynamic fields, sideloading, filtering

`core_api/serializers.py`/`viewsets.py`/`filters.py` add DRF base classes
inspired by django-rest-framework's `dynamic-rest` package - reimplemented
against this platform's own conventions (`?sort=`/`?q=` naming,
`EnvelopePageNumberPagination`) rather than vendored, since dynamic-rest
bakes in its own opinions on both of those. A module's own serializer/
viewset subclasses these instead of plain `ModelSerializer`/`ModelViewSet`
to get, for free:

- **Dynamic fields**: `?include[]=field`/`?exclude[]=field` control which
  declared fields serialize. List a field in `Meta.deferred_fields` to
  leave it out unless explicitly included - useful for anything expensive
  (a relation, a computed field) that most callers don't need.
- **Relation sideloading**: `DynamicRelationField(serializer_class,
  many=False)` wraps another `BaseSerializer` for a relation. Renders as
  a bare id (or list of ids) by default; naming the field in
  `?include[]=` swaps in the full nested representation instead.
  `serializer_class` accepts a zero-arg callable that does its own
  deferred import instead of the class directly - needed the moment two
  serializers reference each other (see `platform-org`'s `Organization`/
  `OrgMembership` serializers for the actual pattern: a plain lambda
  capturing a name from module scope reintroduces the circular-import
  deadlock a naive fix looks like it solves, since the OTHER module still
  needs a working name to capture *from* - a function that imports inside
  its own body, only ever called later at render time, is what actually
  breaks the cycle).
- **Filtering**: `?filter{field}=value` (exact), `?filter{field.lookup}=
  value` (`icontains`/`gt`/`gte`/`lt`/`lte`/`in`/`isnull`), a leading `-`
  on the field name negates. See `filters.py`'s own docstring for the
  field-vs-lookup-name ambiguity this accepts as a limitation.
- `BaseViewSet.get_queryset()` auto-`prefetch_related`s any sideloaded
  `many=True` relation, so using `?include[]=` against a real dataset
  doesn't quietly turn into an N+1.

**Every process that installs this package must point its OWN
`REST_FRAMEWORK["EXCEPTION_HANDLER"]` at
`"core_api.exceptions.platform_exception_handler"`** - this is easy to
miss because each module's OWN `settings.py` (used only for its
standalone deployment) already has this right, but a HOST importing the
module (e.g. `apps/main`) has its own separate `settings.py` with its own
copy of this setting, which doesn't automatically follow along. Hit this
for real while building `BaseSerializer`/`BaseViewSet`: `apps/main`'s
`config/settings.py` had a copy-pasted `EXCEPTION_HANDLER` still pointing
at a module-specific handler name (`platform_auth_exception_handler`)
that got removed from this consolidation - every request that errored
then 500'd on `ImportError` INSIDE DRF's own exception handling, instead
of returning the error it was actually trying to report. Grep every
`settings.py` across the platform for `EXCEPTION_HANDLER` after touching
this file's exception handler name.

## Adding a shared convention

Only add something here if it's genuinely reusable with **zero model
coupling** — `core_api/` should stay a library other Django apps import
(error classes, a pagination class, uuid7, the dynamic serializer/viewset
base classes above), never grow entity-specific code. A new capability
(even something as central-feeling as orgs or RBAC) belongs in its own
module/repo, following `platform-auth`'s shape (own backend, own
frontend, own repo), not back in this kernel.

## Testing

`cd backend && python manage.py check` / `python manage.py runserver` —
no DB is required to boot (contenttypes/auth tables get created by
`migrate` but nothing queries them yet).
