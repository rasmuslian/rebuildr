import React, { useMemo, useState, useEffect } from "react";
import { Marker } from "react-leaflet";
import { useMapContext } from "@context/map-context";
import { formatPrice } from "@/utils/formattings";
import { View } from "react-native";
import { Button } from "@components/buttons/button";
import {
  MapPinsQuery,
  MapProductQuery,
  MapProductQueryVariables,
} from "@/gql/graphql";
import { AdGrid } from "@components/ad/ad-grid";
import { Divider } from "@components/dividers/divider";
import { Body, Label } from "@components/typography/text";
import { useUser } from "@hooks/useUser";
import { useLikeProduct } from "@hooks/useLikeProduct";
import { useQuery, useApolloClient } from "@apollo/client";
import { MAP_PRODUCT_QUERY } from "@/queries";
import { createMarkerIcon } from "./create-marker-icon";
import { Link } from "expo-router";

type Props = {
  pin: MapPinsQuery["productMapPinsInBoundingBox"]["pins"][number];
};

export default function MapMarker({ pin }: Props) {
  const { state, setState } = useMapContext();

  const prices = pin.prices ?? [];
  const minPrice = prices[0];
  const maxPrice = prices.length ? prices[prices.length - 1] : undefined;
  let priceLabel: string;

  if (minPrice === undefined) {
    priceLabel = formatPrice(0);
  } else if (maxPrice && minPrice !== maxPrice) {
    priceLabel = `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`;
  } else {
    priceLabel = formatPrice(minPrice);
  }

  const productIds = pin.productIds ?? [];

  const iconSource =
    state.activePin?.location === pin.location
      ? `/icons/${pin.type.toLowerCase()}-marker-dark.svg`
      : `/icons/${pin.type.toLowerCase()}-marker-light.svg`;

  const icon = useMemo(() => {
    return createMarkerIcon({
      iconSource,
      priceLabel: state.showPrice ? priceLabel : undefined,
      total: productIds.length > 1 ? productIds.length : undefined,
    });
  }, [iconSource, priceLabel, state.showPrice, productIds]);

  return (
    <Marker
      position={pin.location}
      icon={icon}
      eventHandlers={{
        click: () => {
          setState({
            activePin: {
              location: pin.location,
              popup: <ActiveMarkerPopup pin={pin} />,
            },
          });
        },
      }}
    />
  );
}

const ActiveMarkerPopup = ({ pin }: Props) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { onToggleProductHeart } = useLikeProduct();
  const { state } = useMapContext();

  const client = useApolloClient();
  const { me } = useUser();

  const productIds = pin.productIds ?? [];
  const numberOfProducts = productIds.length;
  const hasMultipleProducts = numberOfProducts > 1;

  useEffect(() => {
    setCurrentIndex(0);
  }, [state.activePin]);

  const MIN = 0;
  const MAX = numberOfProducts - 1;

  const hasPreviousProduct = currentIndex > MIN;
  const hasNextProduct = currentIndex < MAX;

  const productId = productIds.at(currentIndex);
  const nextProductId = productIds.at(currentIndex + 1);

  const showPreviousProduct = () =>
    setCurrentIndex((prev) => Math.max(MIN, prev - 1));

  const showNextProduct = () =>
    setCurrentIndex((prev) => Math.min(MAX, prev + 1));

  const { data } = useQuery<MapProductQuery, MapProductQueryVariables>(
    MAP_PRODUCT_QUERY,
    {
      variables: productId ? { input: { id: productId } } : undefined,
      skip: !productId,
    },
  );

  useEffect(() => {
    if (!nextProductId) return;

    const cached = client.readQuery<MapProductQuery, MapProductQueryVariables>({
      query: MAP_PRODUCT_QUERY,
      variables: { input: { id: nextProductId } },
    });

    if (!cached) {
      client.query<MapProductQuery, MapProductQueryVariables>({
        query: MAP_PRODUCT_QUERY,
        variables: { input: { id: nextProductId } },
      });
    }
  }, [nextProductId]);

  const product = data?.product;
  const project = product?.project;

  return (
    <View style={{ gap: 10 }}>
      {project && (
        <Label
          style={{ textAlign: "center" }}
          size="small"
          lineBreakMode="tail"
          numberOfLines={1}
        >
          {project.title}
        </Label>
      )}

      {project && (
        <Link
          style={{ textAlign: "center" }}
          href={{
            pathname: "/project/[projectId]",
            params: { projectId: project.id },
          }}
        >
          <Body size="small" isLink>
            Projektvy
          </Body>
        </Link>
      )}

      {hasMultipleProducts && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <View style={{ flex: 1, alignItems: "flex-start" }}>
            {hasPreviousProduct && (
              <Button
                onPress={showPreviousProduct}
                type="text"
                icon="chevronLeft"
              />
            )}
          </View>

          <View style={{ flex: 1, alignItems: "center" }}>
            <Body size="small" color="secondary">
              {currentIndex + 1} av {numberOfProducts}
            </Body>
          </View>

          <View style={{ flex: 1, alignItems: "flex-end" }}>
            {hasNextProduct && (
              <Button
                onPress={showNextProduct}
                type="text"
                icon="chevronRight"
              />
            )}
          </View>
        </View>
      )}

      {hasMultipleProducts && <Divider />}

      {product && (
        <AdGrid
          id={product.id}
          price={product.price}
          condition={product.condition}
          imageUri={product.primaryImage?.url}
          title={product.title}
          heart={product.sellerId !== me?.id}
          liked={!!product.likedByMe}
          onHeartPress={() => {
            onToggleProductHeart({
              productId: product.id,
              likedByMe: !!product.likedByMe,
            });
          }}
        />
      )}
    </View>
  );
};
