import apiClient from "@/lib/api-client";
import { LogoutInput } from "gql/graphql";

const query = `
  mutation Logout($input: LogoutInput!) {
    logout(input: $input)
  }
`;

export const logoutMutation = async (input: LogoutInput) => {
  const response = await apiClient.post<GraphQLResponse<{ logout: boolean }>>(
    "/",
    {
      query,
      variables: { input },
    },
  );

  return response.data.data?.logout;
};
