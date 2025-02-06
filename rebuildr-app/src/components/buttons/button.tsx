import { useThemeColor } from "@hooks/useThemeColor";
import React, { useState } from "react";

import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  StyleProp,
  View,
  ViewStyle,
} from "react-native";
import { Icon, IconType } from "../icons/icon";
import { Label } from "@text/text";
import { borderRadius } from "@/src/constants/sizes";
import { TextTokens } from "@/src/constants/colors";

export type ButtonProps = {
  type?: "default" | "tonal" | "text" | "outlined";
  icon?: IconType;
  label?: string;
  loading?: boolean;
} & PressableProps;

export const Button = ({
  type = "default",
  onPress,
  label,
  disabled,
  loading,
  icon,
  ...rest
}: ButtonProps) => {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const colors = useThemeColor();
  const typeColors: {
    [key: string]: {
      enabled?: string;
      hovered: string;
      focused: string;
      pressed: string;
      disabled: string;
      text: string;
      icon: keyof TextTokens;
    };
  } = {
    default: {
      enabled: colors.buttons.filled.enabled,
      hovered: colors.buttons.filled.hovered,
      focused: colors.buttons.filled.focused,
      pressed: colors.buttons.filled.pressed,
      disabled: colors.buttons.filled.disabled,
      text: colors.text.primaryLight,
      icon: "primaryLight",
    },
    tonal: {
      enabled: colors.buttons.tonal.enabled,
      hovered: colors.buttons.tonal.hovered,
      focused: colors.buttons.tonal.focused,
      pressed: colors.buttons.tonal.pressed,
      disabled: colors.buttons.tonal.disabled,
      text: colors.text.primaryDark,
      icon: "primaryDark",
    },
    text: {
      hovered: colors.buttons.text.hovered,
      focused: colors.buttons.text.focused,
      pressed: colors.buttons.text.pressed,
      disabled: colors.buttons.text.disabled,
      text: colors.text.primaryDark,
      icon: "primaryDark",
    },
    outlined: {
      enabled: colors.buttons.outlinedFill.enabled,
      hovered: colors.buttons.outlinedFill.hovered,
      focused: colors.buttons.outlinedFill.focused,
      pressed: colors.buttons.outlinedFill.pressed,
      disabled: colors.buttons.outlinedFill.disabled,
      text: colors.text.primaryDark,
      icon: "primaryDark",
    },
  };

  const Content = () => {
    if (loading) {
      return (
        <View
          style={{ justifyContent: "center", alignItems: "center", flex: 1 }}
        >
          <ActivityIndicator />
        </View>
      );
    }

    return (
      <>
        {icon && (
          <Icon
            icon={icon}
            color={disabled ? "disabled" : typeColors[type].icon}
            size={18}
          />
        )}
        {label && (
          <Label
            size="large"
            style={{
              color: disabled ? colors.text.disabled : typeColors[type].text,
            }}
          >
            {label}
          </Label>
        )}
        {!!icon && !!label && <View />}
      </>
    );
  };

  return (
    <Pressable
      {...rest}
      disabled={disabled || loading}
      onPress={onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={({ pressed }) => {
        let buttonState = "enabled";
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
            justifyContent: "center",
            gap: 8,
            backgroundColor: typeColors[type][buttonState],
            paddingHorizontal: 8,
            borderRadius: borderRadius.medium,
            minWidth: 40,
            height: 40,
          },
          type === "outlined" && {
            borderWidth: 1,
            paddingHorizontal: 7,
            borderColor: colors.buttons.outlinedStroke[buttonState],
          },
          rest.style as StyleProp<ViewStyle>,
        ];
      }}
    >
      <Content />
    </Pressable>
  );
};
