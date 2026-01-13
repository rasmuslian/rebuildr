import apiClient from "@/lib/api-client";
import { Product } from "gql/graphql";

const query = `
  query CmsGetProduct($productId: String!) {
    cmsGetProduct(productId: $productId) {
      id
      title
      description
      condition
      price
      isGiveaway
      status
      address
      primaryQuantity
      primaryUnit
      secondaryQuantity
      secondaryUnit
      diameter
      diameterUnit
      weight
      weightUnit
      thickness
      thicknessUnit
      length
      lengthUnit
      width
      widthUnit
      height
      heightUnit
      noProject
      sellerId
      color
      colorType
      pickupEnabled
      deliveryEnabled
      deliveryPrice
      deliveryRadius
      shippingPrices {
        id
        maxWeight
        price
      }
      category {
        id
        name
      }
      brand {
        id
        name
      }
      images {
        id
        name
        url
      }
      documents {
        id
        name
        url
      }
      project {
        id
        title
      }
    }
  }
`;

export const getProduct = async (productId: string) => {
  const response = await apiClient.post<
    GraphQLResponse<{ cmsGetProduct: Product }>
  >("/", {
    query,
    variables: { productId },
  });

  return response.data.data?.cmsGetProduct;
};
