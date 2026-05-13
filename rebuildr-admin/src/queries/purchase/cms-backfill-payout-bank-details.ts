import apiClient from "@/lib/api-client";

const query = `
  mutation CmsBackfillPayoutBankDetails {
    cmsBackfillPayoutBankDetails
  }
`;

export const cmsBackfillPayoutBankDetails = async () => {
  const response = await apiClient.post<
    GraphQLResponse<{ cmsBackfillPayoutBankDetails: number }>
  >("/", { query });

  return response.data.data?.cmsBackfillPayoutBankDetails;
};
