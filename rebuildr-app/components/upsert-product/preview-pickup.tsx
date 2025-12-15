import {
  ProductBottomSheetPreviewPickupQuery,
  ProductBottomSheetPreviewPickupQueryVariables,
} from "@/gql/graphql";
import { gql, useLazyQuery } from "@apollo/client";
import { Button } from "@components/buttons/button";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { Body, Label, Title } from "@components/typography/text";
import { View } from "react-native";
import { useEffect } from "react";
import { ProductFields } from "./types";
import MapThumbnail from "@components/maps/map-thumbnail";

const PRODUCT_BOTTOM_SHEET_PREVIEW_PICKUP = gql`
  query ProductBottomSheetPreviewPickup($input: GetProjectInput!) {
    getProject(input: $input) {
      id
      title
    }
  }
`;

type Props = {
  product: ProductFields;
  onChangeAddress: () => void;
  canChangeAddress: boolean;
};

export const PreviewPickup = ({
  product,
  onChangeAddress,
  canChangeAddress,
}: Props) => {
  const approximateAddress = product.approximatePlace?.address;

  const [getProject, { data }] = useLazyQuery<
    ProductBottomSheetPreviewPickupQuery,
    ProductBottomSheetPreviewPickupQueryVariables
  >(PRODUCT_BOTTOM_SHEET_PREVIEW_PICKUP);
  useEffect(() => {
    if (product.project) {
      getProject({
        variables: {
          input: {
            id: product.project.id,
          },
        },
      });
    }
  }, [product.project]);
  const address = product.address;
  const location = product.approximatePlace
    ? [product.approximatePlace.lat, product.approximatePlace.lng]
    : undefined;
  if (!approximateAddress || !address || !location) {
    console.error("No address found");
    return <LoadingSpinner />;
  }

  const project = product.project && data?.getProject;

  return (
    <View style={{ gap: 12 }}>
      <View>
        <Title size="medium">Plats för avhämtning</Title>
        {project && (
          <Body size="medium" style={{ marginTop: 4 }}>
            Annonsen är kopplad till projektet {project.title}, vilket innebär
            att platsen för avhämtning är:
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
        <Body size="small" color="secondary">
          Köparen ser inte annonsens exakta adress (
          <Label size="small">{address}</Label>), bara ett ungefärligt område på
          kartan enligt nedan. Din adress visas först när ett köp har
          genomförts.
        </Body>
      </View>
      <MapThumbnail
        coords={[location[0], location[1]]}
        style={{ height: 185 }}
        markerType="product"
      />
      <View style={{ gap: 12 }}>
        <Button
          label="Ändra adress"
          onPress={onChangeAddress}
          type="tonal"
          disabled={!canChangeAddress}
        />
        {project && (
          <Body size="small" style={{ textAlign: "center" }} color="secondary">
            Ändring av adress tar bort kopplingen till projektet "
            {project.title}".
          </Body>
        )}
      </View>
    </View>
  );
};
