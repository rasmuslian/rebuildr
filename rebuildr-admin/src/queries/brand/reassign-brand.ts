import apiClient from "@/lib/api-client";
import { Brand, CmsBrandIdInput, CmsReassignBrandInput } from "gql/graphql";

const query = `
  mutation ReassignBrand($input: CmsReassignBrandInput!) {
    cmsReassignBrand(input: $input) {
      fromBrand {
        id
        canDelete
      }
      toBrand {
        id
      }
    }
  }
`;

export const reassignBrand = async (input: CmsReassignBrandInput) => {
  const response = await apiClient.post<
    GraphQLResponse<{ cmsReassignBrand: { fromBrand: Brand; toBrand: Brand } }>
  >("/", {
    query,
    variables: { input },
  });

  return response.data.data?.cmsReassignBrand;
};
