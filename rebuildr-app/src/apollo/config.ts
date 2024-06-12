import { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "http://localhost:3000/graphql",
  documents: ["./src/**/*.{ts,tsx}"],
  generates: {
    "./src/apollo/__generated__/": {
      preset: "client",
      plugins: [],
      presetConfig: {
        gqlTagName: "gql",
      },
    },
  },
  hooks: {
    afterOneFileWrite: ["prettier --write"],
  },
};

export default config;
