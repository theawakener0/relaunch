import { plugin as shadcn } from "@shadcn/lint";
import tsParser from "@typescript-eslint/parser";
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Legacy static-site files preserved as-is — not linted:
    "app.js",
    "*.html",
    "styles.css",
    "assets/**",
  ]),
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: { shadcn },
    rules: {
      "shadcn/no-arbitrary-values": "error",
      "shadcn/no-raw-colors": "error",
      "shadcn/no-unknown-classes": "error",
      "shadcn/no-inline-styles": "error",
      "shadcn/require-static-classes": "error",
      "shadcn/no-restyle": [
        "error",
        {
          allow: ["layout"],
          contracts: [
            { pattern: "^Button$", allow: ["layout"] },
            { pattern: "^CardTitle$", allow: ["layout", "typography"] },
            { pattern: "^CardContent$", allow: ["layout", "spacing"] },
          ],
        },
      ],
    },
  },
  {
    // Design-system source directory: the shadcn primitives in components/ui
    // define these classes themselves (cva variants, theme var math). Per the
    // upstream @shadcn/lint pattern (README "Monorepos"), the rules govern
    // consumers of the components, not the component definitions. All rules
    // remain active for app code and any other component directories.
    files: ["components/ui/**"],
    rules: {
      "shadcn/no-arbitrary-values": "off",
      "shadcn/no-raw-colors": "off",
      "shadcn/no-unknown-classes": "off",
      "shadcn/no-inline-styles": "off",
      "shadcn/require-static-classes": "off",
      "shadcn/no-restyle": "off",
    },
  },
]);

export default eslintConfig;
