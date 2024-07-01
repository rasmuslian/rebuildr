import React from "react";
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  StyleSheet,
  View,
} from "react-native";
import { IconType, Icon } from "src/components/icons/icon";
import { TextColors } from "src/styles/colors";
import { Body } from "./texts/text";

interface ButtonProps extends PressableProps {
  onPress: () => void;
  title?: string;
  titleColor?: TextColors;
  backgroundColor?: string;
  icon?: IconType;
  disabled?: boolean;
  loading?: boolean;
}

export const Button = ({
  onPress,
  title,
  titleColor,
  icon,
  disabled,
  loading,
  backgroundColor,
  children,
}: ButtonProps) => {
  return (
    <Pressable onPress={onPress} disabled={disabled || loading}>
      <View style={[styles.container, { backgroundColor: backgroundColor }]}>
        {loading ? (
          <ActivityIndicator />
        ) : (
          <>
            {title && <Body color={titleColor}>{title}</Body>}
            {icon && <Icon iconType={icon} />}
            {children}
          </>
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderStyle: "solid",
    borderRadius: 30,
    padding: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
});
