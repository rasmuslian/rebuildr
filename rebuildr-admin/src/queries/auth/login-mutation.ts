import { LoginResponse } from "gql/graphql";
import { LoginSchema, LoginSchemaType } from "@/schema/login-schema";
import axios from "axios";

const query = `
  mutation CmsLogin($input: LoginInput!) {
    cmsLogin(input: $input) {
      accessToken
      refreshToken
    }
  }
`;

export async function loginMutation(formData: LoginSchemaType) {
  const validationStatus = LoginSchema.safeParse(formData);
  if (!validationStatus.success) throw new Error("Login validation failed!");

  const axiosClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
  });

  const response = await axiosClient.post<
    GraphQLResponse<{ cmsLogin: LoginResponse }>
  >("/", {
    query,
    variables: { input: formData },
  });

  return response.data.data?.cmsLogin;
}
