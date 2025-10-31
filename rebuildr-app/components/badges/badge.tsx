import { Label } from "@components/typography/text";
import { TextTokens } from "@constants/colors";
import { borderRadius } from "@constants/sizes";
import { useThemeColor } from "@hooks/useThemeColor";
import { View } from "react-native";

type BadgeProps = {
  size?: "large" | "medium" | "small";
  disabled?: boolean;
  error?: boolean;
  text?: string;
  theme?: "light" | "dark";
};

export const Badge = ({
  size = "medium",
  text = "0",
  disabled,
  error,
  theme = "light",
}: BadgeProps) => {
  const colors = useThemeColor(theme);
  let statusColor: string | undefined = undefined;
  if (disabled) {
    statusColor = colors.check.false.disabled;
  }
  if (error) {
    statusColor = colors.textField.error;
  }

  if (size === "small") {
    return (
      <View
        style={{
          backgroundColor: statusColor ?? colors.badges[size],
          borderRadius: borderRadius.xSmall,
          height: 6,
          width: 6,
        }}
      />
    );
  }

  const isLarge = size === "large";
  let labelColor: keyof TextTokens = "primaryLight";

  if (disabled) {
    labelColor = "disabled";
  } else if (isLarge) {
    labelColor = "primaryDark";
  } else if (theme === "dark") {
    labelColor = "primaryDark";
  }

  return (
    <View
      style={{
        backgroundColor: statusColor ?? colors.badges[size],
        borderRadius: isLarge ? borderRadius.small : borderRadius.xSmall,
        height: isLarge ? 24 : 16,
        minWidth: isLarge ? 24 : 16,
        paddingHorizontal: isLarge ? 8 : 4,
        paddingVertical: isLarge ? 2 : 0,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Label size={size === "medium" ? "small" : "large"} color={labelColor}>
        {text}
      </Label>
    </View>
  );
};
