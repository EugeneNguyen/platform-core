/**
 * The generic admin surface's other page component — the dedicated `/edit`
 * route only (create renders inside a modal on `EntityListPage` instead).
 * Route: `/orgs/:orgId/admin/:entity/:id/edit` or
 * `/projects/:projectId/admin/:entity/:id/edit`.
 *
 * Raw Bootstrap 5 markup throughout (`div.container-fluid` + the `Card`/
 * `Alert`/`Spinner` atoms) — no component-library wrapper, per this repo's
 * design-system convention.
 *
 * Optional `entityKeyOverride` prop, for a route with no `:entity` segment
 * at all (`/orgs/:orgId/projects/:id/edit`) — passed straight through to
 * `useAdminRouteContext`. Every other mount omits it and behaves exactly as
 * before.
 *
 * A downstream app that needs a per-entity read-only detail section (the
 * TestNexa fork this was extracted from had one for its `TestCase` entity —
 * a "Defects" list + a "Requirement" link picker) adds it the same way:
 * gate a block on `entityKey === "<your-entity>"`, fetch via its own
 * `lib/api/<entity>.ts` module. Keep it out of this file if it's genuinely
 * one entity's own concern — this component stays fully generic otherwise.
 */
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Alert, Card, EntityForm, Spinner } from "../../../components";
import { ApiError } from "../../../lib/api/client";
import { EntityRow, getEntity, updateEntity } from "../../../lib/api/entityCrud";
import { useAdminRouteContext } from "../../../pages/admin/useAdminRouteContext";

function fieldErrorsFrom(error: unknown): Record<string, string> | undefined {
  if (!(error instanceof ApiError)) {
    return undefined;
  }
  const body = error.body as { field_errors?: Record<string, string[]> } | undefined;
  if (!body?.field_errors) {
    return undefined;
  }
  return Object.fromEntries(Object.entries(body.field_errors).map(([field, messages]) => [field, messages[0]]));
}

function EntityFormPage({ entityKeyOverride }: { entityKeyOverride?: string } = {}) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { entityKey, config, label, schemaLoading } = useAdminRouteContext(entityKeyOverride);

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string> | undefined>(undefined);

  const itemQuery = useQuery({
    queryKey: ["entity-item", entityKey, id],
    queryFn: () => getEntity<EntityRow>(config!, id as string),
    enabled: Boolean(config) && Boolean(id),
  });

  const updateMutation = useMutation({
    mutationFn: (values: Record<string, unknown>) => updateEntity(config!, id as string, values),
    onSuccess: () => navigate(-1),
    onError: (error: unknown) => {
      const errors = fieldErrorsFrom(error);
      if (errors) {
        setFieldErrors(errors);
      } else {
        setSubmitError(error instanceof ApiError ? error.message : "Something went wrong. Please try again.");
      }
    },
  });

  /**
   * `config` is `undefined` for one round trip while
   * `GET /entities/{resource}/schema` is in flight, not only for an unknown
   * `:entity` — gate the error branch below on the fetch having actually
   * settled, or every edit page flashes "Unknown admin entity" first. Reuses
   * this page's own item-fetch spinner markup.
   */
  if (schemaLoading) {
    return (
      <div className="container-fluid px-4 py-4 h-100">
        <Card className="h-100">
          <Card.Body>
            <Spinner wrapperClassName="py-4" />
          </Card.Body>
        </Card>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="container-fluid px-4 py-4 h-100">
        <Card className="h-100">
          <Card.Body>
            <Alert color="danger">Unknown admin entity &quot;{entityKey}&quot;.</Alert>
          </Card.Body>
        </Card>
      </div>
    );
  }

  return (
    <div className="container-fluid px-4 py-4 h-100">
      <Card className="h-100">
        <Card.Header>
          <Card.Title as="h1" className="fs-4 mb-0">
            Edit {label ?? entityKey.replace(/-/g, " ")}
          </Card.Title>
        </Card.Header>

        {itemQuery.isLoading ? (
          <Card.Body>
            <Spinner wrapperClassName="py-4" />
          </Card.Body>
        ) : itemQuery.isError ? (
          <Card.Body>
            <Alert color="danger">Something went wrong loading this record.</Alert>
          </Card.Body>
        ) : (
          <EntityForm
            config={config}
            mode="edit"
            initialValues={itemQuery.data}
            submitError={submitError}
            serverFieldErrors={fieldErrors}
            onCancel={() => navigate(-1)}
            onSubmit={async (values) => {
              setSubmitError(null);
              setFieldErrors(undefined);
              await updateMutation.mutateAsync(values);
            }}
            BodySection={Card.Body}
            FooterSection={Card.Footer}
          />
        )}
      </Card>
    </div>
  );
}

export default EntityFormPage;
