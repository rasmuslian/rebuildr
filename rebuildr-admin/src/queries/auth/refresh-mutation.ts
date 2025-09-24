import { GetNewTokensResponse } from "gql/graphql";
import axios from "axios";

const query = `
  mutation GetNewTokens($input: GetNewTokensInput!) {
    getNewTokens(input: $input) {
      accessToken
      refreshToken
    }
  }
`;

type Props = {
  accessToken?: string;
  refreshToken?: string;
};

export async function refreshMutation({ accessToken, refreshToken }: Props) {
  const axiosClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
  });

  const response = await axiosClient.post<
    GraphQLResponse<{ getNewTokens: GetNewTokensResponse }>
  >("/", {
    query,
    variables: { input: { accessToken, refreshToken } },
  });

  return response.data.data?.getNewTokens;
}
