# AGENTS.md

After making changes, run `npm run lint` and fix all errors.

## Project facts

- Next.js 16.3.6 (App Router) + React 19 + TypeScript, import alias `@/*` (`@/*` → root, components at `@/components`, UI primitives at `@/components/ui`), package manager: npm.
- Tailwind CSS v4 configured via `app/globals.css` and `@tailwindcss/postcss` (no `tailwind.config` file).
- shadcn/ui initialized: see `components.json` (style `base-nova`, base color `neutral`, CSS variables in `app/globals.css`). UI primitives live in `components/ui/`, helpers in `lib/utils.ts` (`cn` re-export).
- ESLint 9 flat config in `eslint.config.mjs`: Next.js `core-web-vitals` + `typescript` configs, plus `@shadcn/lint` design-system rules (`no-arbitrary-values`, `no-raw-colors`, `no-unknown-classes`, `no-inline-styles`, `require-static-classes`, `no-restyle` with layout-only allowances and Button/CardTitle/CardContent contracts).
- `npm run lint` runs `eslint .`. Type-check separately with `npx tsc --noEmit`.
- Legacy static site files (`index.html`, `step2.html`, `step3.html`, `app.js`, `styles.css`, `assets/`, loose `.png` files) are preserved as-is — do not modify or delete them.
