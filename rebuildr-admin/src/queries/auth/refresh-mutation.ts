import { GetNewTokensResponse, GetNewTokensInput } from "gql/graphql";
import axios from "axios";

const query = `
  mutation GetNewTokens($input: GetNewTokensInput!) {
    getNewTokens(input: $input) {
      accessToken
      refreshToken
    }
  }
`;

export async function refreshMutation(input: GetNewTokensInput) {
  const axiosClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
  });

  const response = await axiosClient.post<
    GraphQLResponse<{ getNewTokens: GetNewTokensResponse }>
  >("/", {
    query,
    variables: { input },
  });

  return response.data.data?.getNewTokens;
}
