import { ToggleCard } from "@components/toggle-card/toggle-card";
import { View } from "react-native";
import { Body, Title } from "@components/typography/text";
import { BuyProductTransportationOptionsQuery } from "@/gql/graphql";
import MapThumbnail from "@components/maps/map-thumbnail";

type Props = {
  methodSelected?: boolean;
  toggleMethod: () => void;
  pickupOption: Exclude<
    BuyProductTransportationOptionsQuery["getPickupOption"],
    null | undefined
  >;
};
export const PickupCard = ({
  methodSelected,
  toggleMethod,
  pickupOption,
}: Props) => {
  return (
    <ToggleCard
      title="Avhämtning"
      valueString="0 kr"
      enabled={methodSelected}
      onPress={() => toggleMethod()}
      headerDivider
    >
      <View style={{ gap: 16 }}>
        <View style={{ gap: 4 }}>
          <Title size="medium">Plats för avhämtning</Title>
          <Body size="medium">
            Avhämtning planeras i chatten mellan dig och säljaren och ska ske
            inom 7 dagar.
          </Body>
        </View>
        <MapThumbnail
          coords={[pickupOption.lat, pickupOption.lng]}
          markerType="product"
          style={{ height: 185 }}
        />
        <View style={{ gap: 12 }}>
          <Body size="medium">{pickupOption.address}</Body>
          <Body size="small" color="secondary">
            Ungefärligt område. Adress visas först när ett köp har genomförts.
          </Body>
        </View>
      </View>
    </ToggleCard>
  );
};
