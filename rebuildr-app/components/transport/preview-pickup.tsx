import {
  PreviewPickupQueryQuery,
  PreviewPickupQueryQueryVariables,
} from "@/gql/graphql";
import { gql, useSuspenseQuery } from "@apollo/client";
import { Button } from "@components/buttons/button";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { Map } from "@components/maps/map";
import { Body, Label, Title } from "@components/typography/text";
import { View } from "react-native";

const PREVIEW_PICKUP_QUERY = gql`
  query PreviewPickupQuery($input: GetProductInput!) {
    product(input: $input) {
      id
      address
      approximatePlace {
        lat
        lng
        address
      }
      project {
        id
        title
        address
        approximatePlace {
          lat
          lng
          address
        }
      }
    }
  }
`;

type Props = {
  productId: string;
  onChangeAddress: () => void;
};

export const PreviewPickup = ({ productId, onChangeAddress }: Props) => {
  const { data } = useSuspenseQuery<
    PreviewPickupQueryQuery,
    PreviewPickupQueryQueryVariables
  >(PREVIEW_PICKUP_QUERY, {
    variables: { input: { id: productId } },
  });

  const approximateAddress =
    data.product.project?.approximatePlace.address ??
    data.product.approximatePlace?.address;
  const address = data.product.project?.address ?? data.product.address;
  const location = data.product.project
    ? [
        data.product.project.approximatePlace.lat,
        data.product.project.approximatePlace.lng,
      ]
    : data.product.approximatePlace
      ? [data.product.approximatePlace.lat, data.product.approximatePlace.lng]
      : undefined;
  if (!approximateAddress || !address || !location) {
    console.error("No address found");
    return <LoadingSpinner />;
  }

  return (
    <View style={{ gap: 12 }}>
      <View>
        <Title size="medium">Plats för avhämtning</Title>
        {data.product.project && (
          <Body size="medium" style={{ marginTop: 4 }}>
            Annonsen är kopplad till projektet {data.product.project.title},
            vilket innebär att platsen för avhämtning är:
          </Body>
        )}
      </View>
      <View style={{ gap: 12 }}>
        <View>
          <Label size="medium">Adress</Label>
          <Body size="medium" style={{ marginTop: 4 }}>
            {approximateAddress}
          </Body>
        </View>
        <Body size="small">
          Köparen ser inte projektets exakta adress ({address}), bara ett
          ungefärligt område på kartan enligt nedan. Din adress visas först när
          ett köp har genomförts.
        </Body>
      </View>
      <Map
        lat={location[0]}
        lng={location[1]}
        interactive={false}
        radius={1}
        zoom={10}
      />
      <View style={{ gap: 12 }}>
        <Button label="Ändra adress" onPress={onChangeAddress} type="tonal" />
        {data.product.project && (
          <Body size="small" style={{ textAlign: "center" }} color="secondary">
            Ändring av adress tar bort kopplingen till projektet "
            {data.product.project.title}".
          </Body>
        )}
      </View>
    </View>
  );
};
