import { Animated, Pressable, PressableProps } from "react-native";
import { useEffect, useState } from "react";
import { useThemeColor } from "@hooks/useThemeColor";
import { Icon } from "@icons/icon";
import { borderRadius } from "@constants/sizes";

export type ToggleProps = {
  value?: boolean;
  onPress: () => void;
} & PressableProps;

export const Toggle = ({ value, onPress, disabled, ...rest }: ToggleProps) => {
  const [hovered, setHovered] = useState(false);

  const colors = useThemeColor();
  const colorSet = value ? colors.switch.true : colors.switch.false;

  const size = 48;
  const onPosition = size / 3;
  const translateX = new Animated.Value(value ? onPosition : 0);

  useEffect(() => {
    Animated.timing(translateX, {
      toValue: value ? onPosition : 0,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [value]);

  const toggleSwitch = () => {
    onPress();
  };

  return (
    <Pressable
      {...rest}
      disabled={disabled}
      onPress={toggleSwitch}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={() => {
        let toggleState: keyof typeof colorSet = "enabled";
        if (disabled) {
          toggleState = "disabled";
        } else if (hovered) {
          toggleState = "hovered";
        }
        return {
          width: size,
          height: 32,
          borderRadius: borderRadius.medium,
          backgroundColor: colorSet[toggleState],
          justifyContent: "center",
          padding: 4,
        };
      }}
    >
      <Animated.View
        style={{
          width: 24,
          height: 24,
          borderRadius: borderRadius.small,
          backgroundColor: colorSet.handle,
          transform: [{ translateX }],
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {value && (
          <Icon
            icon="check"
            size={14}
            color={disabled ? "disabled" : "primaryDark"}
          />
        )}
      </Animated.View>
    </Pressable>
  );
};
