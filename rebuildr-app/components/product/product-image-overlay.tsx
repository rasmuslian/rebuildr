import { Label } from "@components/typography/text";
import { borderRadius } from "@constants/sizes";
import { View, ViewStyle, StyleSheet } from "react-native";

type Props = {
  text: string;
  style?: ViewStyle;
};
export const ProductImageOverlay = ({ text, style }: Props) => {
  return (
    <View
      style={[
        {
          ...StyleSheet.absoluteFillObject,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#00000080",
        },
        style ? style : { borderRadius: borderRadius.medium },
      ]}
    >
      <Label size="large" style={{ color: "white" }}>
        {text}
      </Label>
    </View>
  );
};
