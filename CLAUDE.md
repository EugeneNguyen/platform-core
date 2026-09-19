# CLAUDE.md

Guidance for Claude Code (and any agent) working in this repo. This is a
starter kit extracted from a larger production app — the gotchas below are
the ones that survived extraction because they're about the *mechanism*
(FastAPI/SQLAlchemy/Docker/AdminLTE), not about any specific product domain.

## Repo layout

| Path | What |
|---|---|
| `backend/` | FastAPI + SQLAlchemy 2.0 (async) + Alembic. Auth, orgs, RBAC, generic CRUD factory. |
| `frontend/` | Vite + React + TypeScript. AdminLTE v4 design system, generic admin CRUD surface. |
| `nginx/` | dev/prod reverse-proxy configs, single external entrypoint. |
| `docker-compose.yml` | dev/prod profiles, nginx is the only service exposing a host port. |

## Multi-tenancy

Every tenant-scoped table carries a resolvable `org_id` path. **Cross-tenant
resource access returns 404, never 403** — existence must never be
confirmable across an org boundary. Don't add a query that skips the
`org_id` filter, generic or bespoke.

When adding a bespoke create route for an entity that already has a
hand-written resolver in `crud_factory.py` (or a `chain_resolver`/
`branching_resolver` build of one), check the resolver's branches actually
cover the new route's row shape — a resolver written before that create path
existed has no branch for it, so the row inserts fine and then 404s as
"unresolvable" on the very next read. Test with a create-then-immediate-read
round trip, not a create-only assertion.

## Before changing a route's response *shape*

Nothing in this codebase generates frontend types from the backend's
Pydantic response models — a `tsc --noEmit` and a green Vitest run prove the
frontend is internally consistent, not that it still agrees with a changed
backend contract (hand-typed mocks stay green regardless of what the real
route now returns). `grep -rn "<route path>" frontend/src/lib/api/` for every
existing caller and update it in the same change whenever you add/remove/
rename a response field or wrap a bare list in an envelope.

## RBAC bundle extensions always need a new data migration

Editing `backend/app/db/rbac_seed_catalog.py` alone only affects a fresh
DB's initial seed — an already-seeded DB needs its own idempotent Alembic
data migration (existence-check-then-insert, see
`alembic/versions/0002_seed_rbac_system_roles.py` for the pattern) to
backfill the new permission onto already-seeded system roles.

## Docker

- **Backend image has no dev dependencies** — `pip install --no-cache-dir .`
  only, no `pytest`/`httpx`. Run tests from a host venv
  (`pip install -e ".[dev]"`), not `docker exec <container> pytest`.
- **Backend has no dev volume mount** — after any backend code edit in a
  running stack, `docker compose build backend` again.
- **Frontend's `.dockerignore` (already present, don't delete it) excludes
  `node_modules`/`dist`** — without it, the `dev`/`build` stages' `COPY . .`
  silently overwrites the image's freshly-`npm ci`'d `node_modules` with
  whatever's on the host, if a host checkout happens to have one.

## Frontend design system (AdminLTE v4 + Bootstrap 5)

- Raw HTML/JSX against the shipped CSS — no component-library wrapper. Check
  `frontend/src/components/{atoms,molecules,organisms,templates}` for an
  existing primitive before hand-rolling a `.card`/`.btn`/`.alert`/`.modal`
  block.
- CSS import order in `frontend/src/main.tsx` matters: `bootstrap` →
  `admin-lte` → `@fortawesome/fontawesome-free` → `./index.css`. AdminLTE's
  rules are authored to override Bootstrap's, not the reverse.
- No AdminLTE JS/jQuery is vendored — every interactive behavior (sidebar
  collapse, treeview, color mode) is plain React state/effects toggling
  AdminLTE's own literal classes.
- Badges use `bg-*`, not Bootstrap 5.3's `text-bg-*` — existing assertions
  check the exact class.

## Auth

- AI-agent bearer keys are prefixed `pcore_agent_` (`app/core/security.py`'s
  `generate_api_key`) — rename this per-deployment if you want a distinct
  prefix, but keep it a fixed literal so `get_current_actor` can branch on
  credential *shape* cheaply.
- Seeded/demo accounts need a real-shaped email domain — `POST /auth/login`'s
  `EmailStr` validation rejects IANA reserved special-use TLDs (`.local`,
  `.test`, `.invalid`, `.example`); `@example.com` itself is fine.
- `POST /auth/signup` is bootstrap-only — it 409s `signup_closed` the moment
  any `Organization` row exists. There is no reset path for a lost password
  short of a direct DB write using the app's own `hash_password()`.

## Testing

- Backend: `pytest tests/unit` (no DB), `pytest tests/integration` (needs
  `DATABASE_URL` + a live server via `TEST_API_BASE_URL`).
- Frontend: `npm run test` (Vitest + RTL, co-located with source under
  `frontend/src/`), `npm run typecheck` (`tsc --noEmit`).
