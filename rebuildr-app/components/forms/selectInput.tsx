import { Body } from "@components/typography/text";
import { TextTokens } from "@constants/colors";
import { borderRadius, strokeWidth } from "@constants/sizes";
import { useThemeColor } from "@hooks/useThemeColor";
import { Icon } from "@icons/icon";
import { useState } from "react";
import { Pressable } from "react-native";

export type Props = {
  value: string;
  disabled?: boolean;
  onPress: () => void;
  placeholder?: string;
  error?: boolean;
};

export const SelectInput = ({ ...props }: Props) => {
  const colors = useThemeColor();
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);

  const saved = !focused && !!props.value;

  const getBorderColor = () => {
    if (props.disabled) {
      return colors.textField.disabled;
    }
    if (props.error) {
      return colors.textField.error;
    }
    if (focused) {
      return colors.textField.clicked;
    }
    if (hovered) {
      return colors.textField.hovered;
    }

    //enabled and saved
    return colors.textField.enabled;
  };

  const getTextColor = (): keyof TextTokens => {
    if (props.disabled) {
      return "disabled";
    }
    if (props.error) {
      return "secondary";
    }

    if (hovered || saved || focused) {
      return "primaryDark";
    }
    if (!!props.value) {
      return "primaryDark";
    }

    return "secondary";
  };
  return (
    <Pressable
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        outlineColor: colors.textField.clicked,
        paddingVertical: 16,
        paddingRight: 12,
        paddingLeft: 16,
        borderRadius: borderRadius.small,
        height: 40,
        borderWidth: strokeWidth.regular,
        backgroundColor: colors.background.neutral,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderColor: getBorderColor(),
      }}
      onPress={props.onPress}
    >
      <Body size="medium" color={getTextColor()}>
        {props.value || props.placeholder}
      </Body>
      <Icon icon="chevronDown" size={12} />
    </Pressable>
  );
};
