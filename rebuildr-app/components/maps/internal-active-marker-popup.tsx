import {
  InternalAdMapPinGroupsQuery,
  InternalAdMapPopupQuery,
  InternalAdMapPopupQueryVariables,
} from "@/gql/graphql";
import { INTERNAL_AD_MAP_POPUP } from "@/queries/internal-ads";
import { useQuery } from "@apollo/client";
import { AdGrid } from "@components/ad/ad-grid";
import { Button } from "@components/buttons/button";
import { Body } from "@components/typography/text";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";

export const InternalActiveMarkerPopup = ({
  mapPinGroup,
}: {
  mapPinGroup: InternalAdMapPinGroupsQuery["internalAdMapPinGroups"]["mapPinGroups"][number];
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const productIds = mapPinGroup.productIds;
  const productId = productIds[currentIndex];
  const { data } = useQuery<
    InternalAdMapPopupQuery,
    InternalAdMapPopupQueryVariables
  >(INTERNAL_AD_MAP_POPUP, {
    variables: productId ? { productId } : undefined,
    skip: !productId,
  });

  useEffect(() => setCurrentIndex(0), [mapPinGroup]);

  const product = data?.internalAd;
  if (!product) return null;

  return (
    <View style={{ gap: 10 }}>
      {productIds.length > 1 && (
        <View
          style={{
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <Button
            icon="chevronLeft"
            type="text"
            disabled={currentIndex === 0}
            onPress={() => setCurrentIndex((index) => Math.max(0, index - 1))}
          />
          <Body size="small" color="secondary">
            {currentIndex + 1} av {productIds.length}
          </Body>
          <Button
            icon="chevronRight"
            type="text"
            disabled={currentIndex === productIds.length - 1}
            onPress={() =>
              setCurrentIndex((index) =>
                Math.min(productIds.length - 1, index + 1),
              )
            }
          />
        </View>
      )}
      <AdGrid
        id={product.id}
        title={product.title}
        price={product.price}
        condition={product.condition}
        imageUri={product.primaryImage?.url}
        soldByQuantity={product.soldByQuantity}
        status={product.status}
        onPress={() =>
          router.navigate({
            pathname: "/internal/[productId]",
            params: { productId: product.id },
          })
        }
      />
    </View>
  );
};
