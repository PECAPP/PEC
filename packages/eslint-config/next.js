const { resolve } = require("node:path");

const project = resolve(process.cwd(), "tsconfig.json");

/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: [
    "eslint:recommended",
    "prettier",
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended",
  ],
  globals: {
    React: true,
    JSX: true,
  },
  env: {
    node: true,
    browser: true,
  },
  plugins: ["@typescript-eslint", "boundaries"],
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
    "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    "@typescript-eslint/no-explicit-any": "warn",
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
