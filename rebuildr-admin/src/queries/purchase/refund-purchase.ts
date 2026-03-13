import apiClient from "@/lib/api-client";
import { Purchase } from "gql/graphql";

type RefundPurchaseInput = {
  purchaseId: string;
};

const query = `
  mutation CmsRefundPurchase($input: CmsRefundPurchaseInput!) {
    cmsRefundPurchase(input: $input) {
      id
      status
    }
  }
`;

export const refundPurchase = async (input: RefundPurchaseInput) => {
  const response = await apiClient.post<
    GraphQLResponse<{ cmsRefundPurchase: Purchase }>
  >("/", {
    query,
    variables: { input },
  });

  return response.data.data?.cmsRefundPurchase;
};
