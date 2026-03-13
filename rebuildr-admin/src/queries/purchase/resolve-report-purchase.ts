import apiClient from "@/lib/api-client";
import { ReportPurchase, ReportPurchaseResolutionEnum } from "gql/graphql";

type ResolveReportPurchaseInput = {
  reportPurchaseId: string;
  resolution: ReportPurchaseResolutionEnum;
};

const query = `
  mutation CmsResolveReportPurchase($input: CmsResolveReportPurchaseInput!) {
    cmsResolveReportPurchase(input: $input) {
      id
      resolution
      type
    }
  }
`;

export const resolveReportPurchase = async (
  input: ResolveReportPurchaseInput,
) => {
  const response = await apiClient.post<
    GraphQLResponse<{ cmsResolveReportPurchase: ReportPurchase }>
  >("/", {
    query,
    variables: { input },
  });

  return response.data.data?.cmsResolveReportPurchase;
};
