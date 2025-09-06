// @ts-check
const eslint = require("@eslint/js");
const tseslint = require("typescript-eslint");
const angular = require("angular-eslint");

module.exports = tseslint.config(
  {
    files: ["**/*.ts"],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,
      ...angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      "@angular-eslint/directive-selector": [
        "error",
        {
          type: "attribute",
          prefix: "app",
          style: "camelCase",
        },
      ],
      "@angular-eslint/component-selector": [
        "error",
        {
          type: "element",
          prefix: "app",
          style: "kebab-case",
        },
      ],
      // Enforce OnPush change detection
      "@angular-eslint/prefer-on-push-component-change-detection": "error",
      // Enforce input() and output() functions
      "@angular-eslint/no-inputs-metadata-property": "error",
      "@angular-eslint/no-outputs-metadata-property": "error",
      // Enforce inject() function
      "@angular-eslint/prefer-standalone": "error",
      // Disallow any type
      "@typescript-eslint/no-explicit-any": "error",
      // Ban @Input/@Output decorators - enforce input()/output() functions
      "no-restricted-syntax": [
        "error",
        {
          selector: "Decorator[expression.callee.name='Input'], Decorator[expression.callee.name='Output']",
          message: "Use input()/output() functions instead of decorators.",
        },
      ],
      // Note: prefer-signal rule not available in current version
    },
  },
  {
    files: ["**/*.html"],
    extends: [
      ...angular.configs.templateRecommended,
      ...angular.configs.templateAccessibility,
    ],
    rules: {
      // Basic template rules
      "@angular-eslint/template/conditional-complexity": "error",
      "@angular-eslint/template/cyclomatic-complexity": "error",
    },
  }
);
