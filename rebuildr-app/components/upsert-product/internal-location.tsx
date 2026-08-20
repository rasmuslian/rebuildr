import {
  ExactAndApproximatePlaceQuery,
  ExactAndApproximatePlaceQueryVariables,
} from "@/gql/graphql";
import { useLazyQuery } from "@apollo/client";
import { Button } from "@components/buttons/button";
import { Body } from "@components/typography/text";
import { useState } from "react";
import { View } from "react-native";

import { EditPickup } from "./edit-pickup";
import { EXACT_AND_APPROXIMATE_PLACE } from "./queries";
import { ProductFields } from "./types";

type Props = {
  product: ProductFields;
  update: (product: Partial<ProductFields>) => void;
  error?: string;
};

export const InternalLocation = ({ product, update, error }: Props) => {
  const [editing, setEditing] = useState(!product.address);
  const [getPlace, { loading }] = useLazyQuery<
    ExactAndApproximatePlaceQuery,
    ExactAndApproximatePlaceQueryVariables
  >(EXACT_AND_APPROXIMATE_PLACE);

  const onSave = async (lat: number, lng: number) => {
    const { data } = await getPlace({ variables: { input: { lat, lng } } });
    const place = data?.exactAndApproximatePlace;
    if (!place) return;
    update({
      location: { lat: place.exact.lat, lng: place.exact.lng },
      address: place.exact.address,
      approximatePlace: place.approximate,
    });
    setEditing(false);
  };

  return (
    <View style={{ gap: 12 }}>
      {!editing && product.address ? (
        <>
          <View style={{ gap: 4 }}>
            <Body size="medium">Plats</Body>
            <Body size="medium" color="secondary">
              {product.address}
            </Body>
          </View>
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
          addressDescription="Välj var materialet finns så att annonserna kan hittas på Återbankens karta."
          saveLabel="Spara plats"
        />
      )}
      {!!error && <Body color="error">{error}</Body>}
    </View>
  );
};
