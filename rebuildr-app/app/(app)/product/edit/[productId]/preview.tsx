import {
  EditProductPreviewQuery,
  EditProductPreviewQueryVariables,
} from "@/gql/graphql";
import { gql, useQuery } from "@apollo/client";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { PreviewScreen } from "@components/product/preview-screen";
import { useLocalSearchParams } from "expo-router";

const EDIT_PRODUCT_PREVIEW = gql`
  query EditProductPreview($input: GetProductInput!) {
    product(input: $input) {
      id
      title
      description
      price
      isGiveaway
      condition
      primaryQuantity
      primaryUnit
      secondaryQuantity
      secondaryUnit
      height
      width
      length
      thickness
      diameter
      weight
      images {
        id
        mimeType
        url
        name
      }
      documents {
        id
        mimeType
        url
        name
      }
      category {
        id
        name
        parent {
          id
          name
        }
      }
      brand {
        id
        name
        type
      }
      location {
        lat
        lng
      }
      approximatePlace {
        lat
        lng
        address
      }
      project {
        id
        title
        address
        location {
          lat
          lng
        }
        approximatePlace {
          lat
          lng
          address
        }
      }
      pickupEnabled
      deliveryRadius
      deliveryPrice
      deliveryEnabled
      shippingPrices {
        id
        maxWeight
        price
        provider
      }
    }
    me {
      id
      address
    }
  }
`;

export default function Preview() {
  const { productId } = useLocalSearchParams<{ productId: string }>();
  const { data } = useQuery<
    EditProductPreviewQuery,
    EditProductPreviewQueryVariables
  >(EDIT_PRODUCT_PREVIEW, { variables: { input: { id: productId } } });

  if (!data) {
    return <LoadingSpinner />;
  }

  return (
    <PreviewScreen
      product={data.product}
      title="Redigera annons"
      myAddress={data.me.address}
    />
  );
}
