import { Body, Headline } from "@components/typography/text";
import { View } from "react-native";
import {
  SinglePickupOptionQuery,
  SinglePickupOptionQueryVariables,
} from "@/gql/graphql";
import { gql, useQuery } from "@apollo/client";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { Summary } from "./summary";
import { useSubmitSummary } from "@hooks/buy/use-submit-summary";
import MapThumbnail from "@components/maps/map-thumbnail";

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

type Props = {
  productId: string;
  quantity?: number;
};
export const SinglePickup = ({ productId, quantity }: Props) => {
  const { submitPickup, verifyMeSheet } = useSubmitSummary({ quantity });
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
        quantity,
      },
    },
  });

  if (!data) {
    return <LoadingSpinner />;
  }

  if (!data.getPickupOption) {
    return null;
  }

  const onPurchase = () => {
    submitPickup(productId, totalPrice);
  };

  const totalPrice = data.product.price * (quantity ?? 1);

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
        <MapThumbnail
          coords={[data.getPickupOption.lat, data.getPickupOption.lng]}
          style={{ height: 185 }}
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
        price={totalPrice}
        mainButton={{
          label: totalPrice ? "Fortsätt till Betalning" : "Fortsätt",
          onPress: () => {
            onPurchase();
          },
        }}
        bottomText="Du hämtar varan inom 7 dagar."
      />
      {verifyMeSheet}
    </View>
  );
};
