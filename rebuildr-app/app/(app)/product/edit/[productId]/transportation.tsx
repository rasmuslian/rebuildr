import {
  EditProductTransportationQuery,
  EditProductTransportationQueryVariables,
} from "@/gql/graphql";
import { gql, useQuery } from "@apollo/client";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { TransportationScreen } from "@components/product/transportation-screen";
import { router, useLocalSearchParams } from "expo-router";

const EDIT_PRODUCT_TRANSPORTATION = gql`
  query EditProductTransportation($input: GetProductInput!) {
    product(input: $input) {
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
  const { productId } = useLocalSearchParams<{ productId: string }>();
  const { data } = useQuery<
    EditProductTransportationQuery,
    EditProductTransportationQueryVariables
  >(EDIT_PRODUCT_TRANSPORTATION, { variables: { input: { id: productId } } });

  if (!data) {
    return <LoadingSpinner />;
  }

  return (
    <TransportationScreen
      product={data.product}
      title="Redigera annons"
      nextUrl={{
        pathname: "/product/edit/[productId]/preview",
        params: { productId },
      }}
      onDismiss={() =>
        router.dismissTo({
          pathname: "/product/[productId]",
          params: { productId },
        })
      }
    />
  );
}
