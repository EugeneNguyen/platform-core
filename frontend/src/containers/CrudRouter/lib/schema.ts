/**
 * The shape `core_api.viewsets.BaseViewSet.schema` (`GET <resource>/schema`)
 * returns - see its own docstring (platform-core backend) for exactly
 * how each field gets built. Kept as its own file (not folded into
 * `types.ts`) since this is the SERVER's OWN description of a resource,
 * while `CrudField` (`types.ts`) describes ONE FORM FIELD `CrudFormFields`
 * actually renders - `schemaColumns.ts`/`schemaFields.ts` are the two
 * places a `Schema` turns into the latter (`DataTableColumn`/`CrudField`
 * respectively).
 */

export interface SchemaFieldChoice {
  value: string;
  label: string;
}

export type SchemaFieldType = "string" | "integer" | "number" | "boolean" | "date" | "datetime" | "email" | "relation";

export interface SchemaField {
  name: string;
  type: SchemaFieldType;
  required: boolean;
  read_only: boolean;
  label: string;
  /** Whether the field accepts an explicit `null` (DRF's `allow_null`). */
  nullable?: boolean;
  /** The model field's `help_text`, when it has one. */
  help_text?: string;
  /** Only present on a `ChoiceField` (e.g. a model's `TextChoices` status). */
  choices?: SchemaFieldChoice[];
  /** Only present when `type === "relation"`. */
  many?: boolean;
  related_model?: string | null;
  /** Only present when `type === "relation"` - the related resource's own base URL (e.g. `"/api/v1/goals"`), from the backend's `core_api.registry`. `null` if that model was never registered there - `schemaFields.ts` falls back to a bare text input for the id in that case. */
  related_endpoint?: string | null;
  /** Only present when `type === "relation"` - whether this field is left off a plain response unless `?include[]=`'d (a to-many relation always is - see `core_api.serializers.BaseSerializer`'s own docstring; a to-one relation never is). */
  deferred?: boolean;
}

export interface Schema {
  fields: SchemaField[];
}
