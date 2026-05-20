import { Platform, View } from "react-native";
import { ProductLabelSheet } from "./product-label-sheet";

type Props = {
  productId: string;
  onReady: () => void;
};

export const PrintProductLabelPortal = ({ productId, onReady }: Props) => {
  if (Platform.OS !== "web") return null;

  return (
    <View
      style={{
        position: "fixed" as "absolute",
        left: -10000,
        top: 0,
        pointerEvents: "none",
      }}
    >
      <ProductLabelSheet productId={productId} onReady={onReady} />
    </View>
  );
};
