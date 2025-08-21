import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  config: {
    sort: false,
  },
  overwrite: true,
  schema: ["../rebuildr-backend/src/schema.gql"],
  documents: [
    "./apollo/*.ts",
    "./components/**/*.tsx",
    "./components/**/*.ts",
    "./app/**/*.tsx",
    "./context/*.tsx",
    "./hooks/*.ts",
    "./queries/*.ts",
  ],
  generates: {
    "gql/": {
      preset: "client",
      presetConfig: {
        fragmentMasking: false,
      },
      plugins: [],
    },
  },
};

export default config;
