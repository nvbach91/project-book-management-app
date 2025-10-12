import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "commonjs",
      globals: {
        ...globals.node, 
      },
    },
    extends: [js.configs.recommended],
    rules: {
      "no-unused-vars": "warn",
      "no-console": "off",
      quotes: ["error", "single"],
      semi: ["error", "always"],
      indent: ["error", 2],
    },
  },
]);
