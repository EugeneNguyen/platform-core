import { useCallback, useState } from "react";

/**
 * The Create/Edit screens' shared form state - field values plus submit's
 * loading/error, no validation library (this package adds no dependency
 * neither `Table`/`DataTable` needed either; native `required`/`type` on
 * `FormControl` is what validation there is). `setValues` (wholesale, not
 * just `setValue` per field) exists for `CrudEditScreen`, which loads a
 * record asynchronously and needs to replace the whole form once it
 * arrives, not merge into it.
 */
export function useCrudForm<T>(initialValues: Partial<T> = {}) {
  const [values, setValues] = useState<Partial<T>>(initialValues);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const setValue = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  const submit = useCallback(
    async (action: (values: Partial<T>) => Promise<T>): Promise<T | null> => {
      setSubmitting(true);
      setError(null);
      try {
        return await action(values);
      } catch (thrown) {
        setError(thrown instanceof Error ? thrown : new Error(String(thrown)));
        return null;
      } finally {
        setSubmitting(false);
      }
    },
    [values],
  );

  return { values, setValue, setValues, submitting, error, submit };
}
