import { ApolloError } from "@apollo/client";

type ErrorFieldTypes = "BAD_INPUT" | "VALUE_TAKEN";
type BadFieldsInputException = {
  graphQLErrors: {
    extensions: {
      code: "BAD_FIELDS_INPUT";
      fields: {
        name: string;
        message: string;
        type: ErrorFieldTypes;
      }[];
    };
  }[];
} & ApolloError;

export const apolloBadFieldsError = (e: ApolloError) => {
  console.log("apolloBadFieldsError called");
  const isBadFieldsInputException = e.graphQLErrors.find(
    (gqlError) => gqlError.extensions?.code === "BAD_FIELDS_INPUT",
  );
  if (!isBadFieldsInputException) {
    return;
  }
  const badFieldsError = (e as BadFieldsInputException).graphQLErrors[0]
    .extensions;

  return badFieldsError.fields;
};
