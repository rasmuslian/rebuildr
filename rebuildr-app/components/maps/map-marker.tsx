import React, { useMemo } from "react";
import { Marker } from "react-leaflet";
import { useMapContext } from "@context/map-context";
import { formatPrice } from "@/utils/formattings";
import { MapPinGroupsQuery } from "@/gql/graphql";
import { createMarkerIcon } from "./create-marker-icon";
import { getMarkerSvg } from "@/utils/map-pin/get-marker-svg";
import { ActiveMarkerPopup } from "./active-marker-popup";
import { InternalActiveMarkerPopup } from "./internal-active-marker-popup";

type Props = {
  mapPinGroup: MapPinGroupsQuery["mapPinGroups"]["mapPinGroups"][number];
};

export default function MapMarker({ mapPinGroup }: Props) {
  const { state, setState } = useMapContext();

  const prices = mapPinGroup.prices ?? [];
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

  const productIds = mapPinGroup.productIds;

  const icon = useMemo(() => {
    return createMarkerIcon({
      iconSource: getMarkerSvg(
        mapPinGroup.type,
        state.activePin?.location === mapPinGroup.location,
      ).uri,
      priceLabel: state.showPrice ? priceLabel : undefined,
      total: productIds.length > 1 ? productIds.length : undefined,
    });
  }, [priceLabel, state.showPrice, productIds, state.activePin]);

  return (
    <Marker
      position={mapPinGroup.location}
      icon={icon}
      eventHandlers={{
        click: () => {
          setState({
            activePin: {
              location: mapPinGroup.location,
              popup:
                state.searchScope === "internal" ? (
                  <InternalActiveMarkerPopup mapPinGroup={mapPinGroup} />
                ) : (
                  <ActiveMarkerPopup mapPinGroup={mapPinGroup} />
                ),
            },
          });
        },
      }}
    />
  );
}
