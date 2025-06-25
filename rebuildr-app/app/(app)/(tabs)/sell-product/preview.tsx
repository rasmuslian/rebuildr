import { PreviewDraftedProductQuery } from "@/gql/graphql";
import { gql, useQuery } from "@apollo/client";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { router } from "expo-router";
import { PreviewScreen } from "@components/product/preview-screen";

const PREVIEW_DRAFTED_PRODUCT = gql`
  query PreviewDraftedProduct {
    getDraftedProduct {
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
  const { data } = useQuery<PreviewDraftedProductQuery>(
    PREVIEW_DRAFTED_PRODUCT,
  );

  if (!data) {
    return <LoadingSpinner />;
  }
  if (!data.getDraftedProduct) {
    router.replace("/");
    return null;
  }

  return (
    <PreviewScreen
      product={data.getDraftedProduct}
      title="Ny annons"
      myAddress={data.me.address}
    />
  );
}
