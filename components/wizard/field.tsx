"use client";

import type { ReactNode } from "react";
import type { FieldError } from "react-hook-form";
import { cn } from "cn";

import { useShake } from "./use-shake";

// Legacy .field wrapper: owns the label/control/message stack, the .invalid
// shake animation and the always-present (empty) .msg spacer.
type FieldProps = {
  error: FieldError | undefined;
  shakeKey?: number;
  children: ReactNode;
};

function Field({ error, shakeKey = 0, children }: FieldProps) {
  const shaking = useShake(error, shakeKey);

  return (
    <div className={cn("field", shaking && "shake")}>
      {children}
      <small className="msg" hidden={!error}>
        {error?.message}
      </small>
    </div>
  );
}

export { Field };
