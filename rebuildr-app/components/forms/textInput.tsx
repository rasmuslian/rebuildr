import { textStyles } from "@components/typography/typeface";
import { borderRadius, strokeWidth } from "@constants/sizes";
import { useThemeColor } from "@hooks/useThemeColor";
import { Icon } from "@icons/icon";
import { useState } from "react";
import {
  Pressable,
  TextInput as RNTextInput,
  TextInputProps,
  View,
} from "react-native";

export type Props = {
  error?: boolean;
  disabled?: boolean;
  masked?: boolean;
} & TextInputProps;

export const TextInput = ({ ...props }: Props) => {
  const colors = useThemeColor();
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [hideText, setHideText] = useState(props.masked);

  const saved = !focused && !!props.value;

  const getBorderColor = () => {
    if (props.disabled) {
      return colors.textField.disabled;
    }
    if (props.error) {
      return colors.textField.error;
    }
    if (focused) {
      return colors.textField.clicked;
    }
    if (hovered) {
      return colors.textField.hovered;
    }

    //enabled and saved
    return colors.textField.enabled;
  };

  const getTextColor = () => {
    if (props.disabled) {
      return colors.text.disabled;
    }
    if (props.error) {
      return colors.text.secondary;
    }
    if (hovered || saved || focused) {
      return colors.text.primaryDark;
    }

    return colors.text.secondary;
  };

  return (
    <Pressable
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
    >
      <RNTextInput
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        secureTextEntry={hideText}
        {...props}
        style={[
          {
            borderWidth: strokeWidth.regular,
            borderColor: getBorderColor(),
            padding: 16,
            paddingRight: 12,
            backgroundColor: colors.background.neutral,
            borderRadius: borderRadius.small,
            height: 40,
            ...textStyles.body["medium"],
            color: getTextColor(),
            outlineColor: colors.textField.clicked,
          },
          props.style,
        ]}
      />
      {props.masked && (
        <View style={{ position: "absolute", right: 8, top: 8 }}>
          <Pressable onPress={() => setHideText(!hideText)}>
            <Icon icon={hideText ? "eye" : "eyeOff"} />
          </Pressable>
        </View>
      )}
    </Pressable>
  );
};
