import { CmsListPurchasesInput, CmsListPurchasesResponse } from "gql/graphql";
import apiClient from "@/lib/api-client";

const query = `
  mutation CmsListPurchase($input: CmsListPurchasesInput!) {
    cmsListPurchases(input: $input) {
      purchases {
        id
        status
        pausedAt
        paymentAcceptedAt
        shipmentBookedAt
        shipmentDroppedOffAt
        deliveredAt
        payoutReceivedAt
        status
        isRefunded
        reportPurchase {
          id
          createdAt
          message
          resolution
          type
        }
        product {
          id
          title
          price
          seller {
            id
            username
            email
          }
        }
        buyer {
          id
          username
          email
        }
      }
      total
    }
  }
`;

export const listPurchases = async (input: CmsListPurchasesInput) => {
  const response = await apiClient.post<
    GraphQLResponse<{
      cmsListPurchases: CmsListPurchasesResponse;
    }>
  >("/", {
    query,
    variables: { input },
  });

  return {
    purchases: response.data.data?.cmsListPurchases.purchases,
    total: response.data.data?.cmsListPurchases.total,
  };
};
