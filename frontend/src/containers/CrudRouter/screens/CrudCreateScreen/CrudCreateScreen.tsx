import type { SubmitEvent } from "react";
import { Button, Card, CardBody, CardFooter } from "../../../../components";
import { createDefaultCrudApi } from "../../lib/api";
import { pickFieldValues } from "../../lib/fields";
import type { CrudConfig } from "../../lib/types";
import { useCrudForm } from "../../lib/useCrudForm";
import CrudFormFields from "../CrudFormFields";

export interface CrudCreateScreenProps<T> {
  config: CrudConfig<T>;
  /** Fires after a successful create - typically the host navigates back to the list. Router-agnostic on purpose (see `createCrudRouter`'s docstring): this screen never navigates itself. */
  onCreated?: (row: T) => void;
}

/**
 * The "C" of `CrudRouter`'s three screens - `config.fields` rendered via
 * `CrudFormFields`, submitting to `config.api.create`/the default REST
 * call. The `<form>` wraps the whole `Card` (fields in `CardBody`,
 * submit in `CardFooter`) rather than living inside it, so the submit
 * button in the footer still triggers the same native form submission.
 */
function CrudCreateScreen<T>({ config, onCreated }: CrudCreateScreenProps<T>) {
  const api = { ...createDefaultCrudApi<T>(config.endpoint), ...config.api };
  const form = useCrudForm<T>();

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const row = await form.submit((values) => api.create(pickFieldValues(values, config.fields)));
    if (row) onCreated?.(row);
  }

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
        <CardFooter>
          <Button type="submit" variant="primary" disabled={form.submitting}>
            {form.submitting ? "Saving…" : "Create"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}

export default CrudCreateScreen;
