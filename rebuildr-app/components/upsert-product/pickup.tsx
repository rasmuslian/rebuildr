import {
  ExactAndApproximatePlaceQuery,
  ExactAndApproximatePlaceQueryVariables,
} from "@/gql/graphql";
import { useLazyQuery } from "@apollo/client";
import { View } from "react-native";
import { useState } from "react";
import { ToggleCard } from "@components/toggle-card/toggle-card";
import { EditPickup } from "./edit-pickup";
import { PreviewPickup } from "./preview-pickup";
import { EXACT_AND_APPROXIMATE_PLACE } from "./queries";
import { ProductFields } from "./types";

type Props = {
  product: ProductFields;
  canEdit: boolean;
  onEditing: () => void;
  onEditComplete: () => void;
  update: (product: Partial<ProductFields>) => void;
};

export const Pickup = ({
  canEdit,
  onEditing,
  onEditComplete,
  product,
  update,
}: Props) => {
  const [isEditing, setIsEditing] = useState(false);

  const [getPlace, { loading }] = useLazyQuery<
    ExactAndApproximatePlaceQuery,
    ExactAndApproximatePlaceQueryVariables
  >(EXACT_AND_APPROXIMATE_PLACE);

  const onEditProduct = async (lat: number, lng: number) => {
    const { data } = await getPlace({
      variables: {
        input: {
          lat,
          lng,
        },
      },
    });

    const place = data?.exactAndApproximatePlace;
    if (!place) {
      return;
    }
    update({
      noProject: true,
      project: undefined,
      pickupEnabled: true,
      location: {
        lat: place.exact.lat,
        lng: place.exact.lng,
      },
      address: place.exact.address,
      approximatePlace: {
        lat: place.approximate.lat,
        lng: place.approximate.lng,
        address: place.approximate.address,
      },
    });
    setIsEditing(false);
    onEditComplete();
  };

  const onChangeAddress = () => {
    if (canEdit) {
      setIsEditing(true);
      onEditing();
    }
  };

  const onSelectPickup = () => {
    update({
      pickupEnabled: !product.pickupEnabled,
    });
  };

  const address = product.address;
  const location = product.location;

  return (
    <ToggleCard
      title="Avhämtning"
      description="Du bestämmer tid och plats för att köparen ska kunna hämta produkten direkt från dig."
      onPress={onSelectPickup}
      enabled={product.pickupEnabled}
      headerDivider
    >
      <View>
        {(!address || isEditing) && (
          <EditPickup
            address={address ?? undefined}
            location={location ?? undefined}
            onSave={onEditProduct}
            isLoading={loading}
          />
        )}
        {!!address && !isEditing && (
          <PreviewPickup
            product={product}
            onChangeAddress={() => onChangeAddress()}
            canChangeAddress={canEdit}
          />
        )}
      </View>
    </ToggleCard>
  );
};
