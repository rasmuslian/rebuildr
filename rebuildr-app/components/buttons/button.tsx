import { useThemeColor } from "@hooks/useThemeColor";
import React, { ComponentProps } from "react";

import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  StyleProp,
  View,
  ViewStyle,
} from "react-native";
import { Icon, IconType } from "@icons/icon";
import { Label } from "@text/text";
import { TextTokens } from "@constants/colors";
import { borderRadius } from "@constants/sizes";

export type ButtonProps = {
  type?: "filled" | "danger" | "tonal" | "text" | "outlined" | "outlinedStroke";
  iconPosition?: "left" | "right";
  icon?: IconType | ComponentProps<typeof Icon> | React.ReactNode;
  label?: string;
  loading?: boolean;
  theme?: "light" | "dark";
  showShadow?: boolean;
} & PressableProps;

export const Button = ({
  type = "filled",
  iconPosition = "left",
  onPress,
  label,
  disabled,
  loading,
  icon,
  theme = "light",
  showShadow = false,
  ...rest
}: ButtonProps) => {
  const colors = useThemeColor(theme);
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
    filled: {
      enabled: colors.buttons.filled.enabled,
      hovered: colors.buttons.filled.hovered,
      focused: colors.buttons.filled.focused,
      pressed: colors.buttons.filled.pressed,
      disabled: colors.buttons.filled.disabled,
      text: colors.text.primaryLight,
      icon: theme === "dark" ? "primaryDark" : "primaryLight",
    },
    danger: {
      enabled: colors.buttons.danger.enabled,
      hovered: colors.buttons.danger.hovered,
      focused: colors.buttons.danger.focused,
      pressed: colors.buttons.danger.pressed,
      disabled: colors.buttons.danger.disabled,
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
    outlinedStroke: {
      enabled: colors.buttons.outlinedStroke.enabled,
      hovered: colors.buttons.outlinedStroke.hovered,
      focused: colors.buttons.outlinedStroke.focused,
      pressed: colors.buttons.outlinedStroke.pressed,
      disabled: colors.buttons.outlinedStroke.disabled,
      text: colors.text.primaryDark,
      icon: "primaryLight",
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

    const renderIcon = () => {
      if (!icon) return null;
      if (React.isValidElement(icon)) return icon;

      if (typeof icon === "string") {
        return (
          <Icon
            icon={icon as IconType}
            color={disabled ? "disabled" : typeColors[type].icon}
            size={18}
          />
        );
      }

      return <Icon {...(icon as ComponentProps<typeof Icon>)} />;
    };

    return (
      <>
        {icon && iconPosition === "left" && renderIcon()}
        {label && (
          <Label
            size="large"
            style={{
              color: disabled ? colors.text.disabled : typeColors[type].text,
              paddingHorizontal: 8,
            }}
          >
            {label}
          </Label>
        )}
        {icon && iconPosition === "right" && renderIcon()}
      </>
    );
  };

  return (
    <Pressable
      {...rest}
      disabled={disabled || loading}
      onPress={onPress}
      style={(props) => {
        const { hovered, pressed, focused } = props as {
          hovered: boolean;
          pressed: boolean;
          focused: boolean;
        };
        let buttonState: keyof (typeof typeColors)[string] = "enabled";
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
          showShadow && {
            boxShadow: "0px 4px 16px 0px rgba(0, 0, 0, 0.15)",
          },
          rest.style as StyleProp<ViewStyle>,
        ];
      }}
    >
      <Content />
    </Pressable>
  );
};
