// .eslintrc.cjs
module.exports = {
  root: true,
  extends: "@react-native",
  parserOptions: {
    project: "./tsconfig.json",
    extraFileExtensions: [".html"],
  },
  ignorePatterns: ["*.html"],
};
