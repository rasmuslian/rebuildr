import React, { useMemo } from "react";
import { Marker } from "react-leaflet";
import { useMapContext } from "@context/map-context";
import { formatPrice } from "@/utils/formattings";
import { MapPinGroupsQuery } from "@/gql/graphql";
import { createMarkerIcon } from "./create-marker-icon";
import { getMarkerSvg } from "@/utils/map-pin/get-marker-svg";
import { ActiveMarkerPopup } from "./active-marker-popup";

type Props = {
  pin: MapPinGroupsQuery["mapPinGroups"]["mapPinGroups"][number];
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

  const productIds = pin.productIds;

  const icon = useMemo(() => {
    return createMarkerIcon({
      iconSource: getMarkerSvg(
        pin.type,
        state.activePin?.location === pin.location,
      ).uri,
      priceLabel: state.showPrice ? priceLabel : undefined,
      total: productIds.length > 1 ? productIds.length : undefined,
    });
  }, [priceLabel, state.showPrice, productIds, state.activePin]);

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
