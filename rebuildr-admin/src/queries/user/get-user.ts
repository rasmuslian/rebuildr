import { User } from "gql/graphql";
import apiClient from "@/lib/api-client";

const query = `
  query CmsGetUser($id: String!) {
    cmsGetUser(id: $id) {
      id
      name
      email
      sellerAccountIsEnabled
      profilePicture {
        url
      }
    }
  }
`;

export const getUser = async (id: string) => {
  const response = await apiClient.post<
    GraphQLResponse<{ cmsGetUser: User }>
  >("/", {
    query,
    variables: { id },
  });

  return response.data.data?.cmsGetUser;
};
