import { textStyles } from "@components/typography/typeface";
import { borderRadius, strokeWidth } from "@constants/sizes";
import { useThemeColor } from "@hooks/useThemeColor";
import { Icon, IconType } from "@icons/icon";
import { forwardRef, LegacyRef, useState } from "react";
import {
  NativeSyntheticEvent,
  Pressable,
  TextInput as RNTextInput,
  TextInputFocusEventData,
  TextInputProps,
  View,
} from "react-native";

export type Props = {
  error?: boolean;
  disabled?: boolean;
  hideText?: boolean;
  inputType?: "default" | "numeric";
  trailing?: { icon: IconType; onPress: () => void };
  onChange?: (t: string) => void;
  onBlur?: (t: string) => void;
} & Omit<TextInputProps, "onChange" | "onBlur">;

export const TextInput = forwardRef(function TextInput(
  { onChange, onBlur, ...props }: Props,
  ref: LegacyRef<RNTextInput>,
) {
  const colors = useThemeColor();
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

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

  const onChangeText = (t: string) => {
    if (!onChange) {
      return;
    }
    if (props.inputType === "numeric") {
      //remove all non-digits
      let numericString = t.replace(/\D/g, "");

      //remove leading 0 if it exists
      if (numericString.startsWith("0") && numericString.length > 1) {
        numericString = numericString.slice(1);
      }
      if (!numericString) {
        //if price becomes an empty string, set it to "0" instead
        numericString = "0";
      }

      onChange(numericString);
    } else {
      onChange(t);
    }
  };

  const onBlurText = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    setFocused(false);
    const text = e.nativeEvent.text;
    if (props.inputType === "numeric") {
      const priceNumber = text.replace(/\D/g, "");
      onBlur?.(priceNumber);
    } else {
      onBlur?.(text);
    }
  };

  return (
    <Pressable
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
    >
      <RNTextInput
        ref={ref}
        onFocus={() => setFocused(true)}
        onBlur={onBlurText}
        secureTextEntry={props.hideText}
        onChangeText={(t) => onChangeText(t)}
        {...props}
        style={[
          {
            borderWidth: strokeWidth.regular,
            borderColor: getBorderColor(),
            padding: 16,
            paddingRight: 12,
            backgroundColor: colors.background.neutral,
            borderRadius: borderRadius.medium,
            height: 40,
            ...textStyles.body["medium"],
            color: getTextColor(),
            outlineColor: colors.textField.clicked,
          },
          props.style,
        ]}
      />
      {props.trailing && (
        <View style={{ position: "absolute", right: 8, top: 8 }}>
          <Pressable onPress={props.trailing.onPress}>
            <Icon icon={props.trailing.icon} />
          </Pressable>
        </View>
      )}
    </Pressable>
  );
});
