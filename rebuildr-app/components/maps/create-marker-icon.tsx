import { DivIcon } from "leaflet";
import ReactDOMServer from "react-dom/server";

type Props = {
  iconSource: string;
  priceLabel?: string;
  total?: number;
};

export function createMarkerIcon({ iconSource, priceLabel, total }: Props) {
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
      {total && (
        <div
          style={{
            background: "#000",
            borderRadius: 12,
            width: 24,
            height: 24,
            zIndex: 20,
            position: "absolute",
            top: -11,
            left: 26,
            textAlign: "center",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <span style={{ color: "#FFF" }}>{total}</span>
        </div>
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
