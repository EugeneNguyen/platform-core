# AGENTS.md

Guidance for AI coding agents (Claude Code and others — this repo follows
the cross-tool `AGENTS.md` convention, not a Claude-specific file) working
in this repo.

## What this repo is now

platform-core used to be a starter kit bundling auth, orgs, RBAC, and a
generic CRUD factory (FastAPI + SQLAlchemy + Alembic). That's gone: the
backend was rewritten on Django + DRF and stripped down to a pure
**kernel with no models of its own** — shared conventions other modules
build on (error contract, pagination, filters, uuid7/timestamp utils),
nothing else. Auth now lives in its own module (`platform-auth`); orgs/
RBAC/product features are expected to become their own modules the same
way, not get added back here.

## Repo layout

| Path | What |
|---|---|
| `backend/` | Django + DRF. `config/` (settings/urls/wsgi/asgi), `core_api/` (errors, exceptions, pagination, filters, uuid7 utils — a library, not a Django app; no models). Real routes: `GET /health`, `GET /modules`. |
| `frontend/` | React + Vite + TS + react-router-dom only — no design system, no admin CRUD surface (that's gone, see history note below). Fetches `GET /modules` and routes `/:moduleName/*` to that module's own `frontend_url` (a redirect, not module federation). |

`core_api/modules.py` reads `MODULES_MANIFEST_PATH` (an env var, not a
hardcoded path) to find the consuming platform's `modules.yaml` — this
repo is reused across platforms and must never assume where a given one
keeps its manifest. Unset var / missing file -> empty list, not an error.
`ModuleConfig.frontend_url` is optional (a backend-only module, or
platform-core itself, has none) — the frontend must handle `null` rather
than assuming every module has one.

## History note

An earlier frontend (Tabler design system, generic admin CRUD surface,
login/signup/org pages) was deleted when the backend dropped its auth/
org/RBAC/CRUD-factory routes — the current `frontend/` is a from-scratch,
much smaller replacement (a router shell, not a UI), not a continuation
of that one.

## Adding a shared convention

Only add something here if it's genuinely reusable with **zero model
coupling** — `core_api/` should stay a library other Django apps import
(error classes, a pagination class, uuid7), never grow entity-specific
code again. A new capability (even something as central-feeling as orgs
or RBAC) belongs in its own module/repo, following `platform-auth`'s
shape (own backend, own frontend, own repo), not back in this kernel.

## Testing

`cd backend && python manage.py check` / `python manage.py runserver` —
no DB is required to boot (contenttypes/auth tables get created by
`migrate` but nothing queries them yet).
