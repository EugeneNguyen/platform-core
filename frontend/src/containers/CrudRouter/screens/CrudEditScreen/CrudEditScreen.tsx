import { useEffect, useMemo, useState, type SubmitEvent } from "react";
import { Button, Card, CardBody, CardFooter } from "../../../../components";
import { createDefaultCrudApi } from "../../lib/api";
import { pickFieldValues } from "../../lib/fields";
import type { CrudConfig } from "../../lib/types";
import { useCrudForm } from "../../lib/useCrudForm";
import CrudFormFields from "../CrudFormFields";

export interface CrudEditScreenProps<T> {
  config: CrudConfig<T>;
  /** The record's id - a prop, not read from a router param: same "routing-dependent value passed in" rule as `platform-org-frontend`'s `OrgsScreen` taking `accessToken`. The host reads its own `:id` param and passes it here. */
  id: string | number;
  onUpdated?: (row: T) => void;
  /** Fires after a successful delete - the host still owns navigating away. */
  onDeleted?: () => void;
}

/** The "U" (and an optional "D") of `CrudRouter`'s three screens - loads the record via `config.api.read`, then the same `Card`-framed field form `CrudCreateScreen` uses, prefilled (Save + Delete both in `CardFooter`). */
function CrudEditScreen<T>({ config, id, onUpdated, onDeleted }: CrudEditScreenProps<T>) {
  const api = useMemo(() => ({ ...createDefaultCrudApi<T>(config.endpoint), ...config.api }), [config.endpoint, config.api]);
  const form = useCrudForm<T>();
  const { setValues } = form;
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<Error | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    // Synchronizing with an external system (the network) - see
    // useDataTable's own fetch effect for the same rule applied there.
    // oxlint-disable-next-line react/set-state-in-effect
    setLoading(true);
    // oxlint-disable-next-line react/set-state-in-effect
    setLoadError(null);

    api
      .read(id)
      .then((row) => {
        if (!cancelled) setValues(row);
      })
      .catch((thrown: unknown) => {
        if (!cancelled) setLoadError(thrown instanceof Error ? thrown : new Error(String(thrown)));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [api, id, setValues]);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const row = await form.submit((values) => api.update(id, pickFieldValues(values, config.fields)));
    if (row) onUpdated?.(row);
  }

  async function handleDelete() {
    if (!window.confirm("Delete this item?")) return;
    setDeleting(true);
    try {
      await api.remove(id);
      onDeleted?.();
    } finally {
      setDeleting(false);
    }
  }

  if (loading)
    return (
      <Card>
        <CardBody>
          <p className="text-secondary mb-0">Loading…</p>
        </CardBody>
      </Card>
    );
  if (loadError)
    return (
      <Card>
        <CardBody>
          <p className="text-danger mb-0" role="alert">
            {loadError.message}
          </p>
        </CardBody>
      </Card>
    );

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Card>
        <CardBody>
          <CrudFormFields fields={config.fields} values={form.values} onChange={form.setValue} />
          {form.error && (
            <p className="text-danger mb-0" role="alert">
              {form.error.message}
            </p>
          )}
        </CardBody>
        <CardFooter className="d-flex gap-2">
          <Button type="submit" variant="primary" disabled={form.submitting}>
            {form.submitting ? "Saving…" : "Save"}
          </Button>
          <Button type="button" variant="danger" outline disabled={deleting} onClick={handleDelete}>
            Delete
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}

export default CrudEditScreen;
