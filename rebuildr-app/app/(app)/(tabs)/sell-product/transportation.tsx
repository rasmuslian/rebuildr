import { TransportationQueryQuery } from "@/gql/graphql";
import { gql, useQuery } from "@apollo/client";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { router } from "expo-router";
import { TransportationScreen } from "@components/product/transportation-screen";

const TRANSPORTATION_QUERY = gql`
  query TransportationQuery {
    getDraftedProduct {
      id
      address
      pickupEnabled
      deliveryEnabled
      deliveryPrice
      deliveryRadius
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
      shippingPrices {
        id
        maxWeight
        price
        provider
      }
    }
  }
`;

export default function Transportation() {
  const { data } = useQuery<TransportationQueryQuery>(TRANSPORTATION_QUERY, {
    onCompleted: (data) => {
      if (!data.getDraftedProduct) {
        console.error("No draft found");
        router.replace("/");
      }
    },
  });

  if (!data?.getDraftedProduct) {
    return <LoadingSpinner />;
  }

  return (
    <TransportationScreen
      product={data.getDraftedProduct}
      title="Ny annons"
      nextUrl="/sell-product/preview"
    />
  );
}
