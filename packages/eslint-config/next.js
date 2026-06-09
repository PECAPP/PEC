const { resolve } = require("node:path");

const project = resolve(process.cwd(), "tsconfig.json");

/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: [
    "eslint:recommended",
    "prettier",
    "plugin:@typescript-eslint/recommended",
  ],
  globals: {
    React: true,
    JSX: true,
  },
  env: {
    node: true,
    browser: true,
    es2020: true,
  },
  parserOptions: {
    sourceType: "module",
    ecmaVersion: 2020,
  },
  plugins: ["@typescript-eslint", "boundaries", "unused-imports"],
  settings: {
    "import/resolver": {
      typescript: {
        project,
      },
    },
    "boundaries/elements": [
      { type: "frontend", pattern: "apps/frontend/**" },
      { type: "server", pattern: "apps/server/**" },
      { type: "shared", pattern: "packages/shared/**" }
    ],
  },
  ignorePatterns: [
    ".*.js",
    "node_modules/",
  ],
  rules: {
    "unused-imports/no-unused-imports": "error",
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-require-imports": "warn",
    "@typescript-eslint/no-empty-object-type": "warn",
    "no-useless-escape": "warn",
    "no-empty": "warn",
    "prefer-const": "warn",
    "boundaries/element-types": [
      "error",
      {
        default: "allow",
        rules: [
          {
            from: ["frontend"],
            disallow: ["server"],
            message: "Frontend apps must not import from the server backend!"
          }
        ]
      }
    ]
  },
};
