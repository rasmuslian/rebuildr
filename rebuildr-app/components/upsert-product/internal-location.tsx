import {
  ExactAndApproximatePlaceQuery,
  ExactAndApproximatePlaceQueryVariables,
} from "@/gql/graphql";
import { useLazyQuery } from "@apollo/client";
import { Button } from "@components/buttons/button";
import { Body, Display } from "@components/typography/text";
import { useState } from "react";
import { View } from "react-native";

import { EditPickup } from "./edit-pickup";
import { EXACT_AND_APPROXIMATE_PLACE } from "./queries";
import { ProductFields } from "./types";

type LocationFields = Pick<
  ProductFields,
  "address" | "approximatePlace" | "location"
>;

type Props = {
  product: LocationFields;
  update: (product: Partial<LocationFields>) => void;
  onSaveStart?: () => void;
  error?: string;
};

export const InternalLocation = ({
  product,
  update,
  onSaveStart,
  error,
}: Props) => {
  const [editing, setEditing] = useState(!product.address);
  const [isSavingLocation, setIsSavingLocation] = useState(false);
  const [getPlace, { loading }] = useLazyQuery<
    ExactAndApproximatePlaceQuery,
    ExactAndApproximatePlaceQueryVariables
  >(EXACT_AND_APPROXIMATE_PLACE);

  const onSave = async (lat: number, lng: number) => {
    onSaveStart?.();
    setIsSavingLocation(true);
    try {
      const { data } = await getPlace({ variables: { input: { lat, lng } } });
      const place = data?.exactAndApproximatePlace;
      if (!place) return;
      update({
        location: { lat: place.exact.lat, lng: place.exact.lng },
        address: place.exact.address,
        approximatePlace: place.approximate,
      });
      setEditing(false);
    } finally {
      setIsSavingLocation(false);
    }
  };

  return (
    <View style={{ gap: 12 }}>
      <Display size="small">Plats</Display>
      {!editing && product.address ? (
        <>
          <Body size="medium" color="secondary">
            {product.address}
          </Body>
          <Button
            label="Ändra plats"
            type="outlined"
            onPress={() => setEditing(true)}
            style={{ alignSelf: "flex-start" }}
          />
        </>
      ) : (
        <EditPickup
          address={product.address}
          location={product.location}
          onSave={onSave}
          isLoading={loading}
          title="Plats"
          hideTitle
          addressDescription="Välj var materialet finns så att annonserna kan hittas på Återbankens karta."
          saveLabel="Spara plats"
        />
      )}
      {!!error && !isSavingLocation && <Body color="error">{error}</Body>}
    </View>
  );
};
