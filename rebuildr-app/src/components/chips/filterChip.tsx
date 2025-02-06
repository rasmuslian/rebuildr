import { borderRadius } from "@constants/sizes";
import { useThemeColor } from "@/src/hooks/useThemeColor";
import { useState } from "react";
import { Pressable, PressableProps, StyleProp, ViewStyle } from "react-native";
import { Label } from "@text/text";
import { Icon } from "../icons/icon";

type FilterChipProps = {
  selected?: boolean;
  label: string;
} & PressableProps;

export const FilterChip = ({
  selected,
  label,
  disabled,
  onPress,
  ...rest
}: FilterChipProps) => {
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);

  const colors = useThemeColor();

  const colorSet = selected
    ? colors.chips.filter.fill.selectedTrue
    : colors.chips.filter.fill.selectedFalse;

  return (
    <Pressable
      {...rest}
      disabled={disabled}
      onPress={onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={() => {
        let buttonState = "enabled";
        if (disabled) {
          buttonState = "disabled";
        } else if (hovered) {
          buttonState = "hovered";
        } else if (focused) {
          buttonState = "focused";
        }

        console.log("buttonState :>> ", buttonState);
        console.log("colorSet[buttonState] :>> ", colorSet[buttonState]);

        return [
          {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
            backgroundColor: colorSet[buttonState],
            paddingHorizontal: 8,
            borderRadius: borderRadius.small,
            minWidth: 40,
            height: 40,
          },
          !selected && {
            borderWidth: 1,
            paddingHorizontal: 7,
            borderColor: colors.chips.filter.stroke[buttonState],
          },
          rest.style as StyleProp<ViewStyle>,
        ];
      }}
    >
      {selected && (
        <Icon
          icon="X"
          color={disabled ? "disabled" : "primaryDark"}
          size={12}
        />
      )}
      <Label
        size="large"
        style={{
          color: disabled ? colors.text.disabled : colors.text.primaryDark,
          marginHorizontal: 4,
        }}
      >
        {label}
      </Label>
    </Pressable>
  );
};
