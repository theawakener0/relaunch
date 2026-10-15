"use client";

import { useSyncExternalStore } from "react";
import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";

// Stable no-op subscription pair for the hydration-safe "am I on the client"
// probe. There is nothing to subscribe to: the answer flips exactly once,
// between the hydrating render (getServerSnapshot -> false) and the first
// client-only render (getSnapshot -> true).
const noopSubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

// The resolved theme is unknowable during SSR: next-themes only learns it from
// its own blocking script, which mutates <html>'s class before first paint and
// never touches the React tree. Rendering the glyph from `resolvedTheme`
// directly would make the server HTML and the first client render disagree, so
// nothing about the icon may branch on the theme until after mount. Until then
// the button renders its exact 44px box with no glyph — which is also what
// keeps the hit target from shifting once the icon appears.
function ThemeToggle() {
  const isMounted = useSyncExternalStore(
    noopSubscribe,
    getClientSnapshot,
    getServerSnapshot,
  );
  const { resolvedTheme, setTheme } = useTheme();

  const isDark = isMounted && resolvedTheme === "dark";

  return (
    <button
      type="button"
      className="theme-toggle"
      aria-label="Toggle colour theme"
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isMounted ? (
        isDark ? (
          <MoonIcon aria-hidden="true" />
        ) : (
          <SunIcon aria-hidden="true" />
        )
      ) : null}
    </button>
  );
}

export { ThemeToggle };