import {
  Image,
  ImageSourcePropType,
  Pressable,
  PressableProps,
  StyleProp,
  View,
  ViewStyle,
} from "react-native";
import { Body } from "@text/text";
import { useState } from "react";
import { useThemeColor } from "@hooks/useThemeColor";
import { borderRadius, strokeWidth } from "@constants/sizes";

export type ImageQuickLinkProps = {
  source: ImageSourcePropType;
  label: string;
  size?: number;
} & PressableProps;

export const ImageQuickLink = ({
  source,
  label,
  disabled,
  size = 40,
  ...rest
}: ImageQuickLinkProps) => {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const colors = useThemeColor();
  return (
    <Pressable
      {...rest}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={({ pressed }) => {
        let buttonState: keyof typeof colors.buttons.imageQuickLinkStroke =
          "enabled";
        if (disabled) {
          buttonState = "disabled";
        } else if (pressed) {
          buttonState = "pressed";
        } else if (hovered) {
          buttonState = "hovered";
        } else if (focused) {
          buttonState = "focused";
        }
        return [
          {
            flexDirection: "row",
            alignItems: "center",
            gap: 16,
            paddingRight: 16,
            borderRadius: borderRadius.small,
            borderWidth: strokeWidth.regular,
            borderColor: colors.buttons.imageQuickLinkStroke[buttonState],
            height: size,
          },
          rest.style as StyleProp<ViewStyle>,
        ];
      }}
    >
      <Image
        source={source}
        style={{
          height: "100%",
          width: size,
          borderTopLeftRadius: borderRadius.small,
          borderBottomLeftRadius: borderRadius.small,
          opacity: disabled ? 0.5 : 1,
        }}
      />
      <View>
        <Body
          size="large"
          style={{
            color: disabled ? colors.text.disabled : colors.text.primaryDark,
          }}
        >
          {label}
        </Body>
      </View>
    </Pressable>
  );
};
