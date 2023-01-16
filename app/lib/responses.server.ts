import { json, redirect } from "@remix-run/node";

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

export function redirectBack(
  request: Request,
  { fallback, ...init }: ResponseInit & { fallback: string }
): Response {
  const referer = request.headers.get("Referer");
  if (referer) {
    const url = new URL(referer);
    return redirect(url.pathname + url.search, init);
  }

  return redirect(fallback, init);
}
