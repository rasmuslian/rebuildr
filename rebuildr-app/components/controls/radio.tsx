import { borderRadius } from "@constants/sizes";
import { useThemeColor } from "@hooks/useThemeColor";
import { Icon, IconType } from "@icons/icon";
import React, { useState } from "react";

import {
  Pressable,
  PressableProps,
  StyleProp,
  View,
  ViewStyle,
} from "react-native";

export type RadioProps = {
  selected?: boolean;
  customColor?: string;
  icon?: IconType;
} & PressableProps;

export const Radio = ({
  onPress,
  disabled,
  selected,
  customColor,
  icon,
  ...rest
}: RadioProps) => {
  const [hovered, setHovered] = useState(false);
  const colors = useThemeColor();
  const colorSet = selected ? colors.radio.true : colors.radio.false;

  return (
    <Pressable
      {...rest}
      disabled={disabled}
      onPress={onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={() => {
        let radioState: keyof typeof colorSet = "enabled";
        if (disabled) {
          radioState = "disabled";
        } else if (hovered) {
          radioState = "hovered";
        }

        return [
          {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            backgroundColor: customColor ?? colorSet[radioState],
            paddingHorizontal: 8,
            borderRadius: borderRadius.medium,
            width: 24,
            height: 24,
          },
          rest.style as StyleProp<ViewStyle>,
        ];
      }}
    >
      {selected && !icon && (
        <View
          style={{
            width: 8,
            height: 8,
            borderRadius: borderRadius.medium,
            backgroundColor: colorSet.handle,
          }}
        />
      )}
      {selected && !!icon && <Icon icon={icon} customColor={colorSet.handle} />}
      {!selected && (
        <View
          style={{
            width: 20,
            height: 20,
            borderRadius: borderRadius.medium,
            backgroundColor: colorSet.handle,
          }}
        />
      )}
    </Pressable>
  );
};
