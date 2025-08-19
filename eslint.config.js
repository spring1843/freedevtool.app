import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import react from "eslint-plugin-react";
import tseslint from "typescript-eslint";
import unusedImports from "eslint-plugin-unused-imports";

export default tseslint.config(
  { ignores: ["dist", "node_modules"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        console: "readonly",
        process: "readonly",
        Buffer: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        global: "readonly",
        window: "readonly",
        document: "readonly",
        navigator: "readonly",
        localStorage: "readonly",
        sessionStorage: "readonly",
        fetch: "readonly",
      },
      parserOptions: {
        ecmaVersion: "latest",
        ecmaFeatures: { jsx: true },
        sourceType: "module",
      },
    },
    settings: {
      react: { version: "18.3" },
    },
    plugins: {
      react,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      "unused-imports": unusedImports,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...react.configs["jsx-runtime"].rules,

      // React specific rules
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react/jsx-no-leaked-render": "warn",
      "react/jsx-no-useless-fragment": "error",
      "react/self-closing-comp": "error",
      "react/no-unescaped-entities": "warn",
      "react/no-unknown-property": [
        "error",
        { ignore: ["data-cmdk-input-wrapper"] },
      ],

      // Import/Export management
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],

      // TypeScript specific rules (non-type-aware)
      "@typescript-eslint/no-unused-vars": "off", // Use unused-imports instead
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/array-type": ["error", { default: "array-simple" }],
      "@typescript-eslint/consistent-type-definitions": ["error", "interface"],
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/prefer-as-const": "error",
      "@typescript-eslint/no-empty-interface": "error",
      "@typescript-eslint/no-inferrable-types": "error",

      // General code quality rules
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-debugger": "error",
      "no-duplicate-imports": "error",
      "no-unused-expressions": "error",
      "prefer-const": "error",
      "no-var": "error",
      "no-nested-ternary": "warn",
      "no-unneeded-ternary": "error",
      "no-else-return": "error",
      "prefer-template": "error",
      "prefer-arrow-callback": "error",
      "arrow-body-style": ["error", "as-needed"],
      "object-shorthand": ["error", "always"],
      "prefer-destructuring": ["error", { object: true, array: false }],
      "consistent-return": "off", // Too strict for React components
      "default-case": "error",
      eqeqeq: ["error", "always"],
      "no-empty-function": "error",
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-loop-func": "error",
      "no-new-func": "error",
      "no-return-assign": "error",
      "no-self-compare": "error",
      "no-throw-literal": "error",
      "no-useless-concat": "error",
      "no-useless-return": "error",
      "no-duplicate-case": "error",
      "no-fallthrough": "error",
      "no-unreachable": "error",
      "valid-typeof": "error",
    },
  },
  {
    // Node.js specific configuration for server files
    files: ["server/**/*.{ts,js}"],
    rules: {
      "no-console": "off", // Allow console in server files
      "no-magic-numbers": "off", // More lenient for server configuration
      "@typescript-eslint/no-require-imports": "off", // Allow require in server files
    },
  },
  {
    // Configuration files
    files: ["*.config.{js,ts}", "tailwind.config.ts"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
      "no-magic-numbers": "off",
    },
  },
  {
    // Tool pages - more lenient rules for business logic
    files: ["client/src/pages/tools/**/*.{ts,tsx}"],
    rules: {
      "no-magic-numbers": "off",
      "no-nested-ternary": "off",
      "react/no-unescaped-entities": "off",
      "no-case-declarations": "off",
    },
  },
  {
    // UI components - allow some flexibility for design values
    files: ["client/src/components/ui/**/*.{ts,tsx}"],
    rules: {
      "no-magic-numbers": "off",
      "react-refresh/only-export-components": "off",
      "consistent-return": "off",
    },
  }
);
