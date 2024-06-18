import React, { PropsWithChildren } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { IconType, Icon } from "src/components/icons/icon";
import { Text } from "./text";

interface ButtonProps extends PropsWithChildren {
  onPress: () => void;
  title?: string;
  icon?: IconType;
  disabled?: boolean;
}

export const Button = ({
  onPress,
  title,
  icon,
  disabled,
  children,
}: ButtonProps) => {
  return (
    <Pressable onPress={onPress} disabled={disabled}>
      <View style={style.container}>
        <Text>{title}</Text>
        {icon && <Icon iconType="Person" />}
        {children}
      </View>
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
