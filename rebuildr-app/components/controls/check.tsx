import { useThemeColor } from "@hooks/useThemeColor";
import React, { useState } from "react";

import { Icon } from "@icons/icon";
import {
  Pressable,
  PressableProps,
  StyleProp,
  View,
  ViewStyle,
} from "react-native";
import { borderRadius } from "@constants/sizes";
import { TextTokens } from "@constants/colors";

export type CheckProps = {
  selected?: boolean;
  color?: string;
  checkColor?: keyof TextTokens;
} & PressableProps;

export const Check = ({
  onPress,
  disabled,
  selected,
  color,
  checkColor = "primaryLight",
  ...rest
}: CheckProps) => {
  const [hovered, setHovered] = useState(false);
  const colors = useThemeColor();
  const colorSet = selected ? colors.check.true : colors.check.false;

  return (
    <Pressable
      {...rest}
      disabled={disabled}
      onPress={onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={() => {
        let checkState: keyof typeof colorSet = "enabled";
        if (disabled) {
          checkState = "disabled";
        } else if (hovered) {
          checkState = "hovered";
        }

        return [
          {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            backgroundColor: color ?? colorSet[checkState],
            borderRadius: borderRadius.small,
            width: 24,
            height: 24,
          },
          rest.style as StyleProp<ViewStyle>,
        ];
      }}
    >
      {selected ? (
        <Icon
          icon="check"
          color={disabled ? "disabled" : checkColor}
          size={10}
        />
      ) : (
        <View
          style={{
            height: 20,
            width: 20,
            borderRadius: borderRadius.xSmall,
            backgroundColor: colorSet.handle,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {hovered && <Icon icon="check" color="secondary" size={10} />}
        </View>
      )}
    </Pressable>
  );
};
