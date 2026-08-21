import apiClient from "@/lib/api-client";

export type CmsImportFile = {
  file: File;
  uid: string;
};

export type CmsImportProduct = {
  id: string;
  title: string;
  cmsImportValidationIssues: string[];
  primaryImage?: { url: string } | null;
};

export type CmsAdImportDeliveryDefaults = {
  address?: string;
  pickupEnabled?: boolean;
  deliveryEnabled?: boolean;
  deliveryRadius?: number;
  deliveryPrice?: number;
  shippingPriceId?: string;
};

export type CmsImportBatch = {
  id: string;
  status:
    | "UPLOADING"
    | "QUEUED"
    | "PROCESSING"
    | "READY"
    | "FAILED"
    | "PUBLISHED";
  progress: number;
  errorMessage?: string | null;
  products: CmsImportProduct[];
};

const request = async <T>(
  query: string,
  variables: Record<string, unknown>,
) => {
  const response = await apiClient.post<GraphQLResponse<T>>("/", {
    query,
    variables,
  });
  if (response.data.errors?.length)
    throw new Error(response.data.errors[0].message);
  if (!response.data.data) throw new Error("Begäran kunde inte genomföras");
  return response.data.data;
};

export const createCmsAdImportBatch = async (
  sellerId: string,
  files: CmsImportFile[],
  deliveryDefaults?: CmsAdImportDeliveryDefaults,
) => {
  const data = await request<{
    createCmsAdImportBatch: { batch: CmsImportBatch; uploadUrls: string[] };
  }>(
    `
    mutation CreateCmsAdImportBatch($input: CreateCmsAdImportBatchInput!) {
      createCmsAdImportBatch(input: $input) { uploadUrls batch { id status progress } }
    }`,
    {
      input: {
        sellerId,
        deliveryDefaults,
        files: files.map(({ file }) => ({
          name: file.name,
          mimeType: file.type || "application/octet-stream",
        })),
      },
    },
  );
  return data.createCmsAdImportBatch;
};

export const startCmsAdImportBatch = async (batchId: string) => {
  const data = await request<{ startCmsAdImportBatch: CmsImportBatch }>(
    `
    mutation StartCmsAdImportBatch($batchId: String!) {
      startCmsAdImportBatch(batchId: $batchId) { id status progress }
    }`,
    { batchId },
  );
  return data.startCmsAdImportBatch;
};

export const getCmsAdImportBatch = async (batchId: string) => {
  const data = await request<{ cmsAdImportBatch: CmsImportBatch }>(
    `
    query CmsAdImportBatch($batchId: String!) {
      cmsAdImportBatch(batchId: $batchId) {
        id status progress errorMessage
        products { id title cmsImportValidationIssues primaryImage { url } }
      }
    }`,
    { batchId },
  );
  return data.cmsAdImportBatch;
};

export const removeCmsAdImportBatch = async (batchId: string) => {
  const data = await request<{ removeCmsAdImportBatch: boolean }>(
    `
    mutation RemoveCmsAdImportBatch($batchId: String!) {
      removeCmsAdImportBatch(batchId: $batchId)
    }`,
    { batchId },
  );
  return data.removeCmsAdImportBatch;
};

export const removeCmsImportedAdDraft = async (
  batchId: string,
  productId: string,
) => {
  const data = await request<{ removeCmsImportedAdDraft: boolean }>(
    `
    mutation RemoveCmsImportedAdDraft($batchId: String!, $productId: String!) {
      removeCmsImportedAdDraft(batchId: $batchId, productId: $productId)
    }`,
    { batchId, productId },
  );
  return data.removeCmsImportedAdDraft;
};

export const publishCmsImportedAds = async (
  batchId: string,
  productIds: string[],
) => {
  const data = await request<{ publishCmsImportedAds: CmsImportProduct[] }>(
    `
    mutation PublishCmsImportedAds($batchId: String!, $productIds: [String!]!) {
      publishCmsImportedAds(batchId: $batchId, productIds: $productIds) { id }
    }`,
    { batchId, productIds },
  );
  return data.publishCmsImportedAds;
};
