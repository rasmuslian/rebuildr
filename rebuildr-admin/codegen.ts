import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  overwrite: true,
  schema: ["http://localhost:3000/graphql"],
  generates: {
    "gql/": { preset: "client" },
  },
};

export default config;
