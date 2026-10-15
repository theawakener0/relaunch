"use client";

import { useEffect, useState } from "react";
import type { FieldError } from "react-hook-form";

// Legacy shook a field only when a validation pass (a failed submit / manual
// setErr) marked it invalid — plain typing never re-triggered it. So the shake
// is keyed to the step's invalid-attempt counter plus error presence, not to
// re-validation object churn, and every state flip is deferred into timeouts
// (never applied synchronously inside the effect body).
export function useShake(
  error: FieldError | undefined,
  shakeKey: number,
): boolean {
  const [shaking, setShaking] = useState(false);
  const hasError = !!error;

  useEffect(() => {
    if (!hasError || shakeKey === 0) {
      // A fast-cleared error's cleanup below cancels the pending stop timer, so
      // drop the class here too or it sticks forever. Deferred one tick like
      // every other flip in this effect (never synchronous in the body).
      const reset = setTimeout(() => setShaking(false), 0);
      return () => clearTimeout(reset);
    }
    // Drop the class one frame first (legacy's forced reflow) so the 450ms
    // keyframes restart from 0 even mid-shake.
    const drop = setTimeout(() => setShaking(false), 0);
    const start = setTimeout(() => setShaking(true), 32);
    const stop = setTimeout(() => setShaking(false), 482);
    return () => {
      clearTimeout(drop);
      clearTimeout(start);
      clearTimeout(stop);
    };
  }, [hasError, shakeKey]);

  return shaking;
}
