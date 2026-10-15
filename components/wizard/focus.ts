import type { FieldErrors } from "react-hook-form";

// Legacy setErr() focused the field it had just marked invalid, so after
// validating every field the focus ended up on the last invalid one.
export function focusLastInvalid<T extends Record<string, unknown>>(
  order: readonly (keyof T & string)[],
  ids: Record<string, string>,
  errors: FieldErrors<T>,
): void {
  for (let index = order.length - 1; index >= 0; index -= 1) {
    const name = order[index];
    if (errors[name]) {
      document.getElementById(ids[name])?.focus();
      return;
    }
  }
}
