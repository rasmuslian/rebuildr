import apiClient from "@/lib/api-client";
import { Co2Factor } from "gql/graphql";

export type Co2FactorWithDisposal = Co2Factor & {
  productionCoefficient: number;
  disposalCoefficient: number;
};

type UpdateCO2FactorInput = {
  id: string;
  disposalCoefficient: number;
};

const mutation = `
  mutation CmsUpdateCO2Factor($input: CmsUpdateCO2Factor!) {
    cmsUpdateCO2Factor(input: $input) {
      id
      categoryName
      productName
      productionCoefficient
      disposalCoefficient
    }
  }
`;

export const updateCO2Factor = async (input: UpdateCO2FactorInput) => {
  const response = await apiClient.post<
    GraphQLResponse<{ cmsUpdateCO2Factor: Co2FactorWithDisposal }>
  >("/", {
    query: mutation,
    variables: { input },
  });

  return response.data.data?.cmsUpdateCO2Factor;
};
