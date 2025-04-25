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
    project: "./tsconfig.json",
    extraFileExtensions: [".html"],
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
  ],
  rules: {
    "no-console": "off",
    "@typescript-eslint/no-require-imports": "off",
  },
};
