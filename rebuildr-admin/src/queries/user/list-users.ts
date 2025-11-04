import { CmsListUsersInput, CmsListUsersResponse } from "gql/graphql";
import apiClient from "@/lib/api-client";

const query = `
  query CmsListUsers($input: CmsListUsersInput!) {
    cmsListUsers(input: $input) {
      users {
        id
        name
        email
        username
        address
        phoneNumber
        role
        type
        city
        postCode
      }
      total
    }
  }
`;

export const listUsers = async (input: CmsListUsersInput) => {
  const response = await apiClient.post<
    GraphQLResponse<{
      cmsListUsers: CmsListUsersResponse;
    }>
  >("/", {
    query,
    variables: { input },
  });

  return {
    users: response.data.data?.cmsListUsers.users,
    total: response.data.data?.cmsListUsers.total,
  };
};
