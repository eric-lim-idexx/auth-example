import path from "node:path";
import { fileURLToPath } from "node:url";

import { includeIgnoreFile } from "@eslint/compat";
import eslint from "@eslint/js";
import tsEslintPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import unicorn from "eslint-plugin-unicorn";
import tsEslint from "typescript-eslint";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const gitignorePath = path.resolve(__dirname, ".gitignore");

export default [
  includeIgnoreFile(gitignorePath),
  eslint.configs.recommended,
  ...tsEslint.configs.strict,
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tsParser,
    },
    plugins: {
      "@typescript-eslint": tsEslintPlugin,
      unicorn,
    },
    rules: {
      "no-console": "warn",
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          prefer: "type-imports",
          disallowTypeAnnotations: true,
          fixStyle: "inline-type-imports",
        },
      ],
      "@typescript-eslint/explicit-function-return-type": [
        "warn",
        {
          allowExpressions: true,
          allowTypedFunctionExpressions: true,
          allowHigherOrderFunctions: true,
        },
      ],
      "@typescript-eslint/no-non-null-assertion": "off",
      "unicorn/filename-case": [
        "error",
        {
          cases: {
            camelCase: true,
          },
        },
      ],
    },
  },

  // Disable filename case rule for migrations
  {
    files: ["**/migrations/*.ts", "**/seeds/*.ts"],
    rules: {
      "unicorn/filename-case": "off",
    },
  },

  // Any other config imports go at the top
  eslintPluginPrettierRecommended,
];
