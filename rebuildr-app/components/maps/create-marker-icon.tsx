import { DivIcon } from "leaflet";
import ReactDOMServer from "react-dom/server";

type Props = {
  iconSource: string;
  priceLabel?: string;
  likedByMe?: boolean;
};

export function createMarkerIcon({
  iconSource,
  priceLabel,
  likedByMe = false,
}: Props) {
  const icon = (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        height: 44,
        whiteSpace: "nowrap",
        position: "relative",
      }}
    >
      {likedByMe && (
        <img
          src="/icons/like.svg"
          style={{
            width: 22,
            height: 22,
            zIndex: 20,
            position: "absolute",
            top: -11,
            left: 26,
          }}
        />
      )}

      <img
        src={iconSource}
        style={{
          width: 44,
          height: 44,
          zIndex: 10,
        }}
      />

      {priceLabel && (
        <span
          style={{
            borderRadius: "0 8px 8px 0",
            padding: "4px 11px",
            background: "#FFF",
            fontWeight: 500,
            color: "#000",
            fontSize: 12,
            lineHeight: "16px",
            marginLeft: -5,
          }}
        >
          {priceLabel}
        </span>
      )}
    </div>
  );

  const htmlString = ReactDOMServer.renderToString(icon);

  return new DivIcon({
    className: "",
    html: htmlString,
  });
}
