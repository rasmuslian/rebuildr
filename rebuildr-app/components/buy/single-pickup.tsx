import { Body, Headline } from "@components/typography/text";
import { View } from "react-native";
import { Map } from "@components/maps/map";
import {
  SinglePickupCreateFreePurchaseMutation,
  SinglePickupCreateFreePurchaseMutationVariables,
  SinglePickupOptionQuery,
  SinglePickupOptionQueryVariables,
  TransportationEnum,
} from "@/gql/graphql";
import { gql, useMutation, useQuery } from "@apollo/client";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { Summary } from "./summary";
import { router } from "expo-router";

const SINGLE_PICKUP_OPTION = gql`
  query SinglePickupOption(
    $productInput: GetProductInput!
    $optionInput: GetTransportationOptionsInput!
  ) {
    product(input: $productInput) {
      id
      price
    }
    getPickupOption(input: $optionInput) {
      lat
      lng
      address
    }
  }
`;

const SINGLE_PICKUP_CREATE_FREE_PURCHASE = gql`
  mutation SinglePickupCreateFreePurchase($input: PurchaseProductInput!) {
    purchaseProduct(input: $input) {
      purchase {
        id
        status
      }
    }
  }
`;

type Props = {
  productId: string;
};
export const SinglePickup = ({ productId }: Props) => {
  const { data } = useQuery<
    SinglePickupOptionQuery,
    SinglePickupOptionQueryVariables
  >(SINGLE_PICKUP_OPTION, {
    variables: {
      productInput: {
        id: productId,
      },
      optionInput: {
        productId,
      },
    },
  });
  const [purchaseProduct] = useMutation<
    SinglePickupCreateFreePurchaseMutation,
    SinglePickupCreateFreePurchaseMutationVariables
  >(SINGLE_PICKUP_CREATE_FREE_PURCHASE);

  if (!data) {
    return <LoadingSpinner />;
  }

  if (!data.getPickupOption) {
    return null;
  }

  const onPurchase = () => {
    //If the whole purchase is free, create the purchase and move on directly to success screen, skipping payment screen
    if (data.product.price === 0) {
      purchaseProduct({
        variables: {
          input: {
            productId,
            transportationMethod: TransportationEnum.Pickup,
          },
        },
        onCompleted: (data) => {
          router.navigate({
            pathname: "/buy/[productId]/success",
            params: { productId, purchaseId: data.purchaseProduct.purchase.id },
          });
        },
      });
      return;
    }

    router.navigate({
      pathname: "/buy/[productId]/payment",
      params: { productId, transportationMethod: "pickup" },
    });
  };

  return (
    <View style={{ gap: 24 }}>
      <View style={{ gap: 8 }}>
        <Headline size="small">Avhämtning: 0 kr</Headline>
        <Body size="large">
          Avhämtning planeras i chatten mellan dig och säljaren och ska ske inom
          7 dagar.
        </Body>
      </View>
      <View style={{ gap: 16 }}>
        <Map
          radius={3000}
          interactive={false}
          lat={data.getPickupOption.lat}
          lng={data.getPickupOption.lng}
        />
        <View style={{ gap: 12 }}>
          <Body size="medium">{data.getPickupOption.address}</Body>
          <Body size="small" color="secondary">
            Ungefärligt område. Adress visas först när ett köp har genomförts.
          </Body>
        </View>
      </View>
      <Summary
        text="Du betalar:"
        price={data.product.price}
        mainButton={{
          label: "Fortsätt till Betalning",
          onPress: () => {
            onPurchase();
          },
        }}
        bottomText="Du hämtar varan inom 7 dagar."
      />
    </View>
  );
};
