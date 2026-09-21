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
| `backend/` | Django + DRF. `config/` (settings/urls/wsgi/asgi), `core_api/` (errors, exceptions, pagination, filters, uuid7 utils — a library, not a Django app; no models). Real routes: `GET /api/health`, `GET /api/modules` — under `/api`, same convention every module in this platform follows. |
| `frontend/` | React + Vite + TS + react-router-dom only — no design system, no admin CRUD surface (that's gone, see history note below). Fetches `GET /api/modules`, loads a module's `remote_entry` via Module Federation and renders it inline when present, falls back to a plain `url_prefix` link otherwise. |

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
