import { defineConfig } from "eslint/config";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const config = defineConfig(
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    ignores: [
      ".next/**",
      ".vercel/**",
      "node_modules/**",
      "coverage/**",
      "dist/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  {
    files: ["*.js", "*.cjs", "*.mjs"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
);

export default config;
