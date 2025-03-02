const globals = require("globals");
const pluginJs = require("@eslint/js");
const tseslint = require("typescript-eslint");

/** @type {import('eslint').Linter.Config[]} */
module.exports = [
  { files: ["**/*.{js,mjs,cjs,ts}"] },
  { languageOptions: { globals: globals.node } },
  { ignores: ["node_modules", "env.setup.ts", "eslint.config.js"] },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
];
