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
  ignorePatterns: ["*.html", "node_modules/", "dist/"],
  rules: {
    "no-console": "off",
  },
};
