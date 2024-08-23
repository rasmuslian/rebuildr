import React from "react";
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  StyleSheet,
  View,
} from "react-native";
import { IconType, Icon } from "src/components/icons/icon";
import Colors, { ButtonColors, TextColors } from "src/styles/colors";
import { Body, ButtonText } from "./texts/text";

interface ButtonProps extends PressableProps {
  onPress: () => void;
  title?: string;
  titleColor?: TextColors;
  backgroundColor?: ButtonColors;
  icon?: IconType;
  disabled?: boolean;
  loading?: boolean;
  shape?: "round" | "rectangle";
}

export const Button = ({
  onPress,
  title,
  titleColor,
  icon,
  disabled,
  loading,
  backgroundColor,
  shape = "round",
  children,
  ...props
}: ButtonProps) => {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={props.style}
    >
      <View
        style={[
          styles.container,
          { backgroundColor: Colors.button[backgroundColor] },
          shape === "round" && styles.roundShape,
          shape === "rectangle" && styles.rectangleShape,
        ]}
      >
        {loading ? (
          <ActivityIndicator />
        ) : (
          <>
            {icon && <Icon iconType={icon} />}
            {title && (
              <ButtonText type="default" color={titleColor}>
                {title}
              </ButtonText>
            )}
            {children}
          </>
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    justifyContent: "center",
  },
  roundShape: {
    borderWidth: 1,
    borderStyle: "solid",
    borderRadius: 30,
  },
  rectangleShape: {
    borderRadius: 8,
    width: 191,
  },
});
