import { textStyles } from "@components/typography/typeface";
import { borderRadius, strokeWidth } from "@constants/sizes";
import { useThemeColor } from "@hooks/useThemeColor";
import { Icon, IconType } from "@icons/icon";
import { forwardRef, Ref, useState } from "react";
import {
  Pressable,
  TextInput as RNTextInput,
  TextInputProps,
  View,
  ViewStyle,
} from "react-native";

export type Props = {
  error?: boolean;
  disabled?: boolean;
  hideText?: boolean;
  inputType?: "default" | "numeric";
  trailing?: { icon: IconType; onPress: () => void }[];
  onChange?: (t: string) => void;
  onBlur?: (t: string) => void;
  style?: ViewStyle;
} & Omit<TextInputProps, "onChange" | "onBlur" | "style">;

export const TextInput = forwardRef(function TextInput(
  { onChange, onBlur, ...props }: Props,
  ref: Ref<RNTextInput>,
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

  const onBlurText = () => {
    setFocused(false);
    const text = props.value ?? "";
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
      <View
        style={[
          {
            flexDirection: "row",
            alignItems: "flex-start",
            gap: 8,
            height: 40,

            //border
            borderColor: getBorderColor(),
            borderWidth: strokeWidth.regular,
            borderRadius: borderRadius.medium,

            //padding
            paddingTop: 8,
            paddingLeft: 16,
            paddingRight: 12,
            paddingBottom: 16,
          },
          props.style,
        ]}
      >
        <RNTextInput
          ref={ref}
          onFocus={() => setFocused(true)}
          onBlur={() => onBlurText()}
          secureTextEntry={props.hideText}
          onChangeText={(t) => onChangeText(t)}
          {...props}
          placeholder={focused ? "" : props.placeholder}
          style={[
            {
              flex: 1,
              textAlignVertical: "top",
              textAlign: "left",
              ...textStyles.body["medium"],
              color: getTextColor(),
              outline: "none",
            },
          ]}
        />
        {props.trailing && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}
          >
            {props.trailing.map((icon, i) => (
              <Pressable onPress={icon.onPress} key={i}>
                <Icon icon={icon.icon} />
              </Pressable>
            ))}
          </View>
        )}
      </View>
    </Pressable>
  );
});
