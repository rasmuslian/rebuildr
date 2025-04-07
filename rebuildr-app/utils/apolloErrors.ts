import { ApolloError } from "@apollo/client";

type BadFieldsInputException = {
  graphQLErrors: {
    extensions: {
      code: "BAD_FIELDS_INPUT";
      fields: {
        name: string;
        message: string;
      }[];
    };
  }[];
} & ApolloError;

export const errorFields = (
  e: ApolloError,
): { name: string; message: string }[] | undefined => {
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
