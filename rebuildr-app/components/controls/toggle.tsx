import { Animated, Pressable, PressableProps } from "react-native";
import { useEffect, useState } from "react";
import { useThemeColor } from "@hooks/useThemeColor";
import { Icon } from "@icons/icon";

export type ToggleProps = {
  selected?: boolean;
  onPress: () => void;
} & PressableProps;

export const Toggle = ({
  selected,
  onPress,
  disabled,
  ...rest
}: ToggleProps) => {
  const [hovered, setHovered] = useState(false);
  const [isOn, setIsOn] = useState(selected);

  const colors = useThemeColor();
  const colorSet = selected ? colors.switch.true : colors.switch.false;

  const size = 48;
  const translateX = new Animated.Value(isOn ? size / 4 : 0);

  useEffect(() => {
    Animated.timing(translateX, {
      toValue: isOn ? size / 4 : 0,
      duration: 1000,
      useNativeDriver: false,
    }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOn]);

  const toggleSwitch = () => {
    setIsOn(!isOn);
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
        let toggleState = "enabled";
        if (disabled) {
          toggleState = "disabled";
        } else if (hovered) {
          toggleState = "hovered";
        }
        return {
          width: size,
          height: 32,
          borderRadius: size,
          backgroundColor: colorSet[toggleState],
          justifyContent: "center",
          padding: 4,
        };
      }}
    >
      <Animated.View
        style={{
          width: 28,
          height: 28,
          borderRadius: size * 0.4,
          backgroundColor: colorSet.handle,
          transform: [{ translateX }],
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {selected && (
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
