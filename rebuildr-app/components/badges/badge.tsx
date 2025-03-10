import { Label } from "@components/typography/text";
import { borderRadius } from "@constants/sizes";
import { useThemeColor } from "@hooks/useThemeColor";
import { View } from "react-native";

type BadgeProps = {
  size?: "large" | "medium" | "small";
  number?: number;
};

export const Badge = ({ size = "medium", number = 0 }: BadgeProps) => {
  const colors = useThemeColor();

  if (size === "small") {
    return (
      <View
        style={{
          backgroundColor: colors.badges[size],
          borderRadius: borderRadius.xSmall,
          height: 6,
          width: 6,
        }}
      />
    );
  }

  const isLarge = size === "large";
  return (
    <View
      style={{
        backgroundColor: colors.badges[size],
        borderRadius: isLarge ? borderRadius.small : borderRadius.xSmall,
        height: isLarge ? 24 : 16,
        width: isLarge ? 24 : 16,
        paddingHorizontal: isLarge ? 8 : 4,
        paddingVertical: isLarge ? 2 : 0,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Label
        size={size === "medium" ? "small" : "large"}
        color={isLarge ? "primaryDark" : "primaryLight"}
      >
        {number}
      </Label>
    </View>
  );
};
