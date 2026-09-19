import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AppBreadcrumb from "./app-breadcrumb";
import { allEntities } from "../../pages/admin/registry";
import { ApiError } from "../../lib/api/client";
import { getProject } from "../../lib/api/projects";

/**
 * breadcrumb unit tests, /008 plus the
 * 2026-09-07 route-coverage correction, extended with
 * /033.
 *
 * Same per-route-pattern render approach as `AppSidebar.test.tsx`: mount
 * `AppBreadcrumb` as a `Route`'s element so `useLocation()`/`matchPath`
 * resolve against the same path patterns a real `ProtectedRoute` screen
 * would use.
 *
 * ** changed two things about this file, both structural:**
 *
 * 1. A `QueryClientProvider` is now mandatory around every render — the
 * component calls `useResolvedOrgId()`, which calls `useQuery`
 * unconditionally (a hook cannot sit behind a route-shape branch), so
 * without a provider every test in this file throws "No QueryClient set"
 * regardless of which route it exercises.
 * 2. **The three project-scoped route tests below previously asserted a bare,
 * unlinked "Project" crumb — the exact behavior replaces.** Those
 * assertions are rewritten here to the resolved `Projects -> {project name}`
 * trail, in the same change as the implementation, own
 * Consequences ("every existing e2e/Vitest assertion on those trails' exact
 * segment count/text needs updating"). They previously carried
 * `/017/019` labels; those IDs in
 * `docs/items/2026-09-03-items.md` in fact belong to
 * org-switcher rows, not to any breadcrumb row — a pre-existing labelling
 * drift this story did not create and does not renumber. The tests are
 * relabelled here against the row that genuinely pins their (new) behavior,
 *, rather than carrying a wrong pointer forward.
 */

vi.mock("../../lib/api/projects", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../lib/api/projects")>();
  return {...actual, getProject: vi.fn() };
});

const mockGetProject = vi.mocked(getProject);

const PROJECT_ID = "9f1d2c3b-4a5e-6f70-8192-a3b4c5d6e7f8";
const PROJECT_ORG_ID = "22222222-2222-2222-2222-222222222222";
/**
 * A real, distinctive name — explicitly requires asserting against
 * "a seeded fixture's actual name string, not a placeholder", so that a
 * resolution which silently fell back to the old bare "Project" label fails
 * this file even though *a* breadcrumb still renders.
 */
const PROJECT_NAME = "Acme Payments Gateway";
const PROJECT_FIXTURE = {
  id: PROJECT_ID,
  org_id: PROJECT_ORG_ID,
  name: PROJECT_NAME,
  standards_profile: null,
};

function renderBreadcrumb(initialEntry: string) {
  return render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route path="/dashboard" element={<AppBreadcrumb />} />
          <Route path="/orgs/:orgId" element={<AppBreadcrumb />} />
          <Route path="/orgs/:orgId/projects" element={<AppBreadcrumb />} />
          <Route path="/orgs/:orgId/members" element={<AppBreadcrumb />} />
          <Route path="/orgs/:orgId/ui-elements/colors" element={<AppBreadcrumb />} />
          <Route path="/orgs/:orgId/admin/:entity" element={<AppBreadcrumb />} />
          <Route path="/orgs/:orgId/admin/:entity/:id" element={<AppBreadcrumb />} />
          <Route path="/orgs/:orgId/admin/:entity/:id/edit" element={<AppBreadcrumb />} />
          <Route path="/projects/:projectId" element={<AppBreadcrumb />} />
          <Route path="/projects/:projectId/batchs/:testPlanId" element={<AppBreadcrumb />} />
          <Route
            path="/projects/:projectId/batchs/:testPlanId/rounds/:testCycleId"
            element={<AppBreadcrumb />}
          />
          <Route path="/projects/:projectId/admin/:entity" element={<AppBreadcrumb />} />
          <Route path="/projects/:projectId/admin/:entity/:id" element={<AppBreadcrumb />} />
          <Route path="/projects/:projectId/admin/:entity/:id/edit" element={<AppBreadcrumb />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

/** The trail's crumb texts, in DOM order — used for exact-sequence assertions. */
function crumbTexts(container: HTMLElement): string[] {
  return [...container.querySelectorAll("ol.breadcrumb > li.breadcrumb-item")].map(
    (li) => li.textContent?.trim() ?? "",
  );
}

describe("AppBreadcrumb", () => {
  beforeEach(() => {
    mockGetProject.mockReset();
  });

  it(": resolves known route segments on /orgs/:orgId/members", () => {
    renderBreadcrumb("/orgs/org-1/members");

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Members")).toBeInTheDocument();
    // The active (final) segment is plain text, not a link — only the
    // earlier "Dashboard" segment is clickable.
    expect(screen.getByText("Dashboard").closest("a")).toHaveAttribute("href", "/orgs/org-1");
    expect(screen.getByText("Members").closest("a")).toBeNull();
  });

  it("renders a single, non-linked segment on /orgs/:orgId", () => {
    renderBreadcrumb("/orgs/org-1");

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Dashboard").closest("a")).toBeNull();
  });

  it(": resolves Dashboard -> Projects on /orgs/:orgId/projects, Dashboard linked", () => {
    renderBreadcrumb("/orgs/org-1/projects");

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Dashboard").closest("a")).toHaveAttribute("href", "/orgs/org-1");
    expect(screen.getByText("Projects")).toBeInTheDocument();
    expect(screen.getByText("Projects").closest("a")).toBeNull();
  });

  it("resolves a nested UI-elements route with 3 segments", () => {
    renderBreadcrumb("/orgs/org-1/ui-elements/colors");

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("UI Elements")).toBeInTheDocument();
    expect(screen.getByText("Colors")).toBeInTheDocument();
  });

  it(": degrades gracefully on an unmapped/root route — renders nothing, no raw param or undefined fragment", () => {
    const { container } = renderBreadcrumb("/dashboard");

    expect(container.querySelector(".breadcrumb")).not.toBeInTheDocument();
    expect(screen.queryByText("undefined")).not.toBeInTheDocument();
  });

  it(": resolves an org-scoped admin list route's entity label from the registry", () => {
    renderBreadcrumb("/orgs/org-1/admin/roles");

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    // The TC says "Dashboard" links — assert the href, not just its presence.
    expect(screen.getByText("Dashboard").closest("a")).toHaveAttribute("href", "/orgs/org-1");
    // "Roles" is the registry's own label for the `roles` key, not a
    // hardcoded string in this component.
    expect(allEntities.find((e) => e.key === "roles")?.label).toBe("Roles");
    expect(screen.getByText("Roles")).toBeInTheDocument();
    expect(screen.getByText("Roles").closest("a")).toBeNull();
  });

  /**
   * /: the new read-only detail route gets its own
   * trail in both scopes, entity segment linked back to that entity's list,
   * `Details` as the active (unlinked) final segment — the same shape the
   * pre-existing `/edit` entries already use.
   */
  it(": an org-scoped admin detail route resolves Dashboard -> {entity label} -> Details", () => {
    const { container } = renderBreadcrumb("/orgs/org-1/admin/roles/role-1");

    const rolesLabel = allEntities.find((e) => e.key === "roles")!.label;
    expect(crumbTexts(container)).toEqual(["Dashboard", rolesLabel, "Details"]);
    expect(screen.getByText(rolesLabel).closest("a")).toHaveAttribute("href", "/orgs/org-1/admin/roles");
    expect(screen.getByText("Details").closest("a")).toBeNull();
  });

  // A project-scoped admin detail route (Projects -> {name} -> {entity
  // label} -> Details) needs a real project-scoped entity to test against —
  // platform-core ships none out of the box (`pages/admin/registry.ts`'s
  // `projectScopedEntities` is empty). Add this case back once a downstream
  // app registers one.

  // ------------------------------------------------------------------
  // /: the resolved project trail.
  //
  // The TC requires `/projects/:projectId` AND "each of its 4 nested route
  // patterns in turn", each asserted for its own full segment sequence per UI
  // Design Document §1b — not just the shared two-segment prefix checked once.
  // Each case below therefore asserts the ENTIRE ordered crumb list, so a trail
  // that grew or lost a segment fails rather than passing on a substring match.
  // ------------------------------------------------------------------

  it(": /projects/:projectId resolves Projects (linked) -> {project name} (active)", async () => {
    mockGetProject.mockResolvedValue(PROJECT_FIXTURE);

    const { container } = renderBreadcrumb(`/projects/${PROJECT_ID}`);

    await waitFor(() => {
      expect(crumbTexts(container)).toEqual(["Projects", PROJECT_NAME]);
    });
    // "Projects" links to the resolved org's own list route — the whole point
    // of the story: a click-path back out of the project.
    expect(screen.getByText("Projects").closest("a")).toHaveAttribute(
      "href",
      `/orgs/${PROJECT_ORG_ID}/projects`,
    );
    // The project's real name is the active, unlinked final segment.
    const active = container.querySelector("li.breadcrumb-item.active")!;
    expect(active).toHaveTextContent(PROJECT_NAME);
    expect(active).toHaveAttribute("aria-current", "page");
    expect(active.querySelector("a")).toBeNull();
    // "never the old bare unlinked 'Project' label" — the literal negative the
    // TC's own Expected-result cell names.
    expect(screen.queryByText("Project")).not.toBeInTheDocument();
    expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
  });

  it(": /projects/:projectId/batchs/:testPlanId resolves Projects -> {name} -> Test Plan", async () => {
    mockGetProject.mockResolvedValue(PROJECT_FIXTURE);

    const { container } = renderBreadcrumb(`/projects/${PROJECT_ID}/batchs/plan-1`);

    await waitFor(() => {
      expect(crumbTexts(container)).toEqual(["Projects", PROJECT_NAME, "Test Plan"]);
    });
    expect(screen.getByText("Projects").closest("a")).toHaveAttribute(
      "href",
      `/orgs/${PROJECT_ORG_ID}/projects`,
    );
    // On a nested pattern the project's name links back to its own detail screen.
    expect(screen.getByText(PROJECT_NAME).closest("a")).toHaveAttribute(
      "href",
      `/projects/${PROJECT_ID}`,
    );
    expect(screen.getByText("Test Plan").closest("a")).toBeNull();
    expect(screen.queryByText("Project")).not.toBeInTheDocument();
  });

  it(": the rounds route resolves Projects -> {name} -> Test Plan -> Test Cycle", async () => {
    mockGetProject.mockResolvedValue(PROJECT_FIXTURE);

    const { container } = renderBreadcrumb(
      `/projects/${PROJECT_ID}/batchs/plan-1/rounds/cycle-1`,
    );

    await waitFor(() => {
      expect(crumbTexts(container)).toEqual([
        "Projects",
        PROJECT_NAME,
        "Test Plan",
        "Test Cycle",
      ]);
    });
    expect(screen.getByText("Projects").closest("a")).toHaveAttribute(
      "href",
      `/orgs/${PROJECT_ORG_ID}/projects`,
    );
    expect(screen.getByText(PROJECT_NAME).closest("a")).toHaveAttribute(
      "href",
      `/projects/${PROJECT_ID}`,
    );
    expect(screen.getByText("Test Plan").closest("a")).toHaveAttribute(
      "href",
      `/projects/${PROJECT_ID}/batchs/plan-1`,
    );
    expect(screen.getByText("Test Cycle").closest("a")).toBeNull();
    expect(screen.queryByText("Project")).not.toBeInTheDocument();
    expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
  });

  // Project-scoped admin list/edit breadcrumb trails need a real
  // project-scoped entity to test against — platform-core ships none out of
  // the box (see the detail-route case above). Add these back once a
  // downstream app registers one.

  // ------------------------------------------------------------------
  // /, breadcrumb half — two DISTINCT cases (pending vs.
  // a real 404), per test-design §39: "a resolver that only handles 'still
  // loading' but throws unhandled on a real 404 would pass a pending-only
  // check". The sidebar half lives in `AppSidebar.test.tsx`.
  // ------------------------------------------------------------------

  it("(a): renders nothing at all (no partial trail, no raw id) while resolution is pending", () => {
    mockGetProject.mockReturnValue(new Promise(() => {}));

    const { container } = renderBreadcrumb(`/projects/${PROJECT_ID}/batchs/plan-1`);

    // The existing `segments.length === 0 -> null` path — own
    // invariant, now proven to also cover this new failure source.
    expect(container.querySelector(".breadcrumb")).not.toBeInTheDocument();
    expect(container.querySelector("nav[aria-label='breadcrumb']")).not.toBeInTheDocument();
    // Specifically NOT a rootless partial trail ("Test Plan" with no ancestors).
    expect(screen.queryByText("Test Plan")).not.toBeInTheDocument();
    expect(screen.queryByText(PROJECT_ID)).not.toBeInTheDocument();
    expect(screen.queryByText("undefined")).not.toBeInTheDocument();
    expect(container.textContent).not.toContain("undefined");
  });

  it("(b): renders nothing at all (no crash) when the project 404s", async () => {
    mockGetProject.mockRejectedValue(new ApiError("Not Found", 404, { code: "not_found" }));

    const { container } = renderBreadcrumb(`/projects/${PROJECT_ID}/batchs/plan-1`);

    await waitFor(() => {
      expect(mockGetProject).toHaveBeenCalledTimes(1);
    });
    await waitFor(() => {
      expect(container.querySelector(".breadcrumb")).not.toBeInTheDocument();
    });
    expect(screen.queryByText("Test Plan")).not.toBeInTheDocument();
    expect(screen.queryByText("Projects")).not.toBeInTheDocument();
    expect(screen.queryByText(PROJECT_ID)).not.toBeInTheDocument();
    expect(container.textContent).not.toContain("undefined");
  });
});
