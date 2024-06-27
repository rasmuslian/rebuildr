import React, { PropsWithChildren } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import { IconType, Icon } from "src/components/icons/icon";
import { Body } from "./texts/text";

interface ButtonProps extends PropsWithChildren {
  onPress: () => void;
  title?: string;
  icon?: IconType;
  disabled?: boolean;
  loading?: boolean;
}

export const Button = ({
  onPress,
  title,
  icon,
  disabled,
  loading,
  children,
}: ButtonProps) => {
  return (
    <Pressable onPress={onPress} disabled={disabled || loading}>
      {loading && <ActivityIndicator />}
      {!loading && (
        <View style={style.container}>
          {title && <Body>{title}</Body>}
          {icon && <Icon iconType={icon} />}
          {children}
        </View>
      )}
    </Pressable>
  );
};

const style = StyleSheet.create({
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
