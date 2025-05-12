// .eslintrc.cjs
module.exports = {
  root: true,
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: ["./tsconfig.json"],
    createDefaultProgram: true,
  },
  plugins: ["@typescript-eslint"],
  ignorePatterns: [
    "*.html",
    "node_modules/",
    "dist/",
    ".eslintrc.js",
    "jest.config.js",
    "metro.config.js",
    "app.config.js",
    "**/*.d.ts",
  ],
  globals: {
    console: "readonly",
    __DEV__: "readonly",
  },
  rules: {
    "no-console": "off",
    "@typescript-eslint/no-require-imports": "off",
    "@typescript-eslint/no-unused-vars": [
      "warn",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_",
      },
    ],
  },
  overrides: [
    {
      files: ["*.d.ts"],
      rules: {
        "@typescript-eslint/no-explicit-any": "off",
      },
    },
  ],
};
