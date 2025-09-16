const { defineConfig, globalIgnores } = require("eslint/config");

const prettier = require("eslint-plugin-prettier");
const js = require("@eslint/js");

const { FlatCompat } = require("@eslint/eslintrc");

const compat = new FlatCompat({
  // eslint-disable-next-line no-undef
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

module.exports = defineConfig([
  {
    extends: compat.extends("universe/native"),

    plugins: {
      prettier,
    },

    rules: {
      "react-hooks/exhaustive-deps": 0,
      "import/order": 0,
      "node/handle-callback-err": "off",
    },
  },
  globalIgnores(["**/node_modules", ".expo", "**/assets", "**/gql"]),
]);
