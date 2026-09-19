import { Route, Routes } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import ProtectedRoute from "./auth/ProtectedRoute";
import AcceptInvite from "./pages/workflows/AcceptInvite";
import Dashboard from "./pages/workflows/Dashboard";
import Login from "./pages/workflows/Login";
import OrgHome from "./pages/workflows/OrgHome";
import OrgMembers from "./pages/workflows/OrgMembers";
import RootRedirect from "./pages/workflows/RootRedirect";
import Signup from "./pages/workflows/Signup";
import { EntityFormPage, EntityListPage, entityCrudRoutes } from "./container/entity-crud";

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* `/` is a pure auth-state redirect, not a screen: logged out ->
            `/login`, logged in -> `/dashboard`, boot refresh still in
            flight -> a spinner. See `RootRedirect.tsx`. */}
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        {/* Org list + chooser — the authenticated destination of the root
            guard above, and the uniform post-login/signup/accept-invite
            redirect target. */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        {/* Public accept-invite route: the invitee has no account/credentials
            yet, so this must sit outside ProtectedRoute — matching the
            backend's own `POST /invites/{token}/accept` being public,
            token-gated, not `Authorization`-gated. */}
        <Route path="/invites/:token/accept" element={<AcceptInvite />} />
        <Route
          path="/orgs/:orgId"
          element={
            <ProtectedRoute>
              <OrgHome />
            </ProtectedRoute>
          }
        />
        {/* Project list/edit — the generic admin CRUD surface
            (`container/entity-crud`), org-scoped, reached via `AppSidebar`'s
            "Projects" nav item. `entityKeyOverride="projects"` is needed
            because this route has no `:entity` segment the way
            `entityCrudRoutes()`'s own routes do (Project's real `create` is
            the bespoke bootstrap-aware `POST /orgs/{org_id}/projects`, not a
            generic admin form — see `app/api/routes/projects.py`). */}
        <Route
          path="/orgs/:orgId/projects"
          element={
            <ProtectedRoute>
              <EntityListPage entityKeyOverride="projects" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orgs/:orgId/projects/:id/edit"
          element={
            <ProtectedRoute>
              <EntityFormPage entityKeyOverride="projects" />
            </ProtectedRoute>
          }
        />
        {/* Org member management: authenticated (ProtectedRoute) — see
            `OrgMembers.tsx`'s own docstring for why org_admin-gating happens
            by attempting `GET /orgs/{org_id}/members` and rendering its
            403/404 rather than a pre-emptive client-side role check. */}
        <Route
          path="/orgs/:orgId/members"
          element={
            <ProtectedRoute>
              <OrgMembers />
            </ProtectedRoute>
          }
        />
        {/* Generic admin CRUD surface (List/Add/Edit/Delete), routed
            generically off the `:entity` param — the registry
            (`pages/admin/registry.ts`) maps it to a schema fetched live from
            `GET /entities/{resource}/schema`, not a hardcoded route per
            entity. `entityCrudRoutes()` is the whole feature's one call
            site — see `container/entity-crud/index.ts`. */}
        {entityCrudRoutes("/orgs/:orgId/admin")}
        {entityCrudRoutes("/projects/:projectId/admin")}
      </Routes>
    </AuthProvider>
  );
}

export default App;
