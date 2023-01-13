import { json } from "@remix-run/node";

export interface ActionWithFormData {
  fieldValues: Record<string, unknown>;
  fieldErrors?: Record<string, string[]>;
  formError?: string;
}

interface Input extends ActionWithFormData {
  statusCode?: number;
}

export function actionWithFormResponse(input: Input) {
  return json(
    {
      fieldValues: input.fieldValues,
      fieldErrors: input.fieldErrors,
      formError: input.formError,
    },
    { status: input.statusCode }
  );
}
