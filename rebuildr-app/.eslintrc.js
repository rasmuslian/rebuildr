// https://docs.expo.dev/guides/using-eslint/
module.exports = {
  root: true,
  extends: ["universe/native"],
  plugins: ["prettier"],
  rules: {
    // Ensures props and state inside functions are always up-to-date
    "react-hooks/exhaustive-deps": 0,
    "import/order": 0,
    "prettier/prettier": "error",
  },
};
