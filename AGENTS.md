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
| `backend/` | Django + DRF. `config/` (settings/urls/wsgi/asgi), `core_api/` (errors, exceptions, pagination, filters, uuid7 utils — a library, not a Django app; no models). One real route: `GET /health`. |

This repo is backend-only now — the old `frontend/`/`nginx/`/
`docker-compose.yml` (built against the removed FastAPI auth/org/RBAC/
CRUD-factory routes) were deleted rather than rebuilt against the new
minimal backend. A design-system/admin-shell frontend can come back later
as its own module if a real need for one shows up.

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
