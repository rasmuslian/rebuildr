import React from "react";
import { LatLngExpression, Icon } from "leaflet";
import { Marker, Popup } from "react-leaflet";

type Props = {
  position: LatLngExpression;
};

const icon = new Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function UserLocationMarker({ position }: Props) {
  return (
    <Marker position={position} icon={icon}>
      <Popup>Din plats</Popup>
    </Marker>
  );
}
