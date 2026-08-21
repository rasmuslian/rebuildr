import apiClient from "@/lib/api-client";

export type CategoryImportSuggestion = {
  clientId: string;
  name: string;
  description: string;
  parentId?: string;
  parentClientId?: string;
  searchAliases: string[];
  measurements: string[];
  inSeason: boolean;
  inSelection: boolean;
  brandIds?: string[];
};

export const analyzeCategoryImport = async (rows: string[]) => {
  const response = await apiClient.post<
    GraphQLResponse<{
      cmsAnalyzeCategoryImport: {
        suggestions: CategoryImportSuggestion[];
        excluded: string[];
      };
    }>
  >("/", {
    query: `mutation CmsAnalyzeCategoryImport($input: CmsAnalyzeCategoryImportInput!) {
      cmsAnalyzeCategoryImport(input: $input) {
        excluded
        suggestions { clientId name description parentId parentClientId searchAliases measurements inSeason inSelection }
      }
    }`,
    variables: { input: { rows } },
  });
  return response.data.data?.cmsAnalyzeCategoryImport;
};

export const createCategories = async (categories: CategoryImportSuggestion[]) => {
  const response = await apiClient.post<
    GraphQLResponse<{
      cmsCreateCategories: { results: { clientId: string; skippedReason?: string }[] };
    }>
  >("/", {
    query: `mutation CmsCreateCategories($input: CmsCreateCategoriesInput!) {
      cmsCreateCategories(input: $input) {
        results { clientId skippedReason category { id name imageGenerationStatus imageGenerationError } }
      }
    }`,
    variables: { input: { categories } },
  });
  return response.data.data?.cmsCreateCategories;
};
