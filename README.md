# platform-core

A self-hosted starter kit for the auth/org/RBAC/design-system plumbing every
multi-tenant SaaS app needs — extracted from a production codebase, not
written from scratch as a toy scaffold. Ships:

- **Backend** (FastAPI + SQLAlchemy 2.0 + Alembic, async, Postgres):
  - `Actor`/`User`/`AIAgent` — joined-table-inheritance auth model. Human
    login is JWT access token + opaque, revocable, httpOnly-cookie refresh
    token (argon2 password hashing, rate-limited login). An `AIAgent` gets a
    separate long-lived bearer API-key flow (`pcore_agent_...`), never the
    human login route — useful for service accounts / bot integrations, not
    just literal AI agents.
  - `Organization`/`OrgMembership`/`Invite` — real multi-tenancy. Every
    tenant-scoped table carries a resolvable `org_id` path; cross-tenant
    access always 404s, never 403 (existence is never confirmable across an
    org boundary).
  - `Role`/`Permission`/`RolePermission`/`RoleAssignment` — RBAC, org-wide or
    project-scoped grants, 3 seeded system roles (`org_admin`, full access;
    `project_owner`, auto-granted project-scoped on project creation;
    `member`, read-only baseline).
  - `Project` — a generic org-scoped sub-resource RBAC can grant
    project-scoped roles against. Rename/extend it, or add sibling entities
    that FK to it, for your own domain.
  - A **generic CRUD router factory** (`app/api/crud_factory.py`) — register
    a `CrudEntityConfig` for a new SQLAlchemy model and get `list`/`get`/
    `create`/`update`/`delete` routes, pagination, search/filter/sort, and a
    served `GET /entities/{resource}/schema` for free. This is most of what
    you'll actually reuse day-to-day.

- **Frontend** (Vite + React + TypeScript):
  - AdminLTE v4 + Bootstrap 5 + Font Awesome design system, raw HTML/JSX
    against the shipped CSS — no component-library wrapper.
  - An atomic-design component library (`components/{atoms,molecules,
    organisms,templates}`) — Button, Card, Modal, Table with sort/filter/
    columns, FkAutocomplete, generic admin List/Add/Edit/Delete pages.
  - `AuthContext` (in-memory access token, boot-time silent refresh via the
    httpOnly cookie), React Hook Form + Zod for forms.
  - A working shell: login/signup/accept-invite, an org dashboard/chooser,
    org member management, and the generic admin CRUD surface wired to the 6
    entities the backend ships.

## Stack

| | |
|---|---|
| Backend | FastAPI, SQLAlchemy 2.0 (async), Alembic, Postgres, argon2, PyJWT |
| Frontend | Vite, React 18, TypeScript, React Router, TanStack Query, React Hook Form + Zod |
| Design system | AdminLTE v4 + Bootstrap 5 + Font Awesome |
| Infra | Docker Compose (dev + prod profiles), nginx single-entrypoint topology |

## Running it

```
cp.env.example.env
docker compose --profile dev up --build
```

Open `http://localhost:8080`. nginx is the single external entrypoint
(`/api/*` → backend, `/*` → frontend dev server). First visit: sign up
(`POST /auth/signup`) to bootstrap the first org + `org_admin` user —
self-registration closes automatically the moment any `Organization` row
exists.

Backend only, no Docker:

```
cd backend
python3 -m venv.venv && source.venv/bin/activate
pip install -e ".[dev]"
export DATABASE_URL=postgresql+asyncpg://platform_core:platform_core_dev_password@localhost:5432/platform_core
alembic upgrade head
uvicorn app.main:app --reload
```

Frontend only, no Docker:

```
cd frontend
npm install
npm run dev
```

## Using this as a submodule in your own project

```
git submodule add https://github.com/EugeneNguyen/platform-core.git platform-core
```

Two common shapes, pick per project:

- **Copy the pieces you need.** `backend/app/{models,core,db,api}` and
  `frontend/src/{components,auth,container,hooks,entityConfigs}` are the
  reusable core; copy them into your own `backend/app`/`frontend/src` and
  wire your own domain routes/pages alongside. Simplest, most common — you
  own the code from day one and this repo is just the starting point.
- **Consume in place.** Import from `platform-core/backend/app/...` and
  `platform-core/frontend/src/...` directly, and add your own domain
  models/routes/pages in your project's own tree, registering new
  `CrudEntityConfig`s in `app/api/entity_registry.py` and new registry
  entries in `pages/admin/registry.ts`. Keeps this repo's own fixes/updates
  a plain `git submodule update` away, at the cost of coupling your app's
  import paths to this repo's internal structure.

Either way: `cd platform-core && git pull && cd.. && git add platform-core &&
git commit` to pull in updates.

### Extending it

- **New entity, generic CRUD:** add a SQLAlchemy model, a `CrudEntityConfig`
  (see any `_*_CONFIG` in `backend/app/api/routes/*.py` for the pattern),
  register it in `entity_registry.py`, add a route entry in
  `frontend/src/pages/admin/registry.ts` — you get full CRUD, search, sort,
  filter, pagination, and an admin UI with zero new frontend code.
- **New permission:** add the resource to `CRUD_RESOURCES`/
  `READ_ONLY_RESOURCES` in `backend/app/db/rbac_seed_catalog.py`, grant it to
  whichever system role(s) should hold it, and write a new idempotent Alembic
  data migration to backfill it onto already-seeded databases (editing the
  catalog alone only affects a fresh DB's initial seed).
- **New design-system component:** check
  `frontend/src/components/{atoms,molecules,organisms,templates}` for an
  existing primitive before hand-rolling Bootstrap/AdminLTE markup — this is
  the single biggest source of drift in a codebase built on raw HTML against
  a design system instead of a component library.

## License

MIT — see [LICENSE](LICENSE).
