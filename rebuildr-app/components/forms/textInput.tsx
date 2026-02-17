import { textStyles } from "@components/typography/typeface";
import { borderRadius, strokeWidth } from "@constants/sizes";
import { useThemeColor } from "@hooks/useThemeColor";
import { Icon, IconType } from "@icons/icon";
import { Ref, useState } from "react";
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
  inputType?: "default" | "numeric" | "decimal";
  trailing?: { icon: IconType; onPress: () => void }[];
  onChange?: (t: string) => void;
  onBlur?: (t: string) => void;
  style?: ViewStyle;
  textColor?: string;
  ref?: Ref<RNTextInput>;
} & Omit<TextInputProps, "onChange" | "onBlur" | "style">;

export const TextInput = ({ onChange, onBlur, ...props }: Props) => {
  const colors = useThemeColor();
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  const sanitizeDecimalInput = (value: string) => {
    const normalized = value.replace(/\./g, ",");
    let result = "";
    let hasComma = false;

    for (const char of normalized) {
      if (char >= "0" && char <= "9") {
        result += char;
        continue;
      }
      if (char === "," && !hasComma) {
        result += char;
        hasComma = true;
      }
    }

    if (result.startsWith(",")) {
      result = `0${result}`;
    }

    if (result.includes(",")) {
      const [integerPart, fractionalPart] = result.split(",");
      const trimmedInteger = integerPart.replace(/^0+(?=\d)/, "");
      result = `${trimmedInteger || "0"},${fractionalPart ?? ""}`;
    } else {
      result = result.replace(/^0+(?=\d)/, "");
      if (!result) {
        result = "0";
      }
    }

    return result;
  };

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
    if (props.textColor) {
      return props.textColor;
    }
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
    } else if (props.inputType === "decimal") {
      onChange(sanitizeDecimalInput(t));
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
    } else if (props.inputType === "decimal") {
      let decimalValue = sanitizeDecimalInput(text);
      if (decimalValue.endsWith(",")) {
        decimalValue = decimalValue.slice(0, -1);
      }
      onBlur?.(decimalValue);
    } else {
      onBlur?.(text);
    }
  };

  //Inner height of textInput calculated by taking the height of the container minus vertical paddings
  const innerHeight = props.style?.height
    ? (props.style.height as number) - 8 - 16
    : undefined;

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
          ref={props.ref}
          onFocus={() => setFocused(true)}
          onBlur={() => onBlurText()}
          secureTextEntry={props.hideText}
          onChangeText={(t) => onChangeText(t)}
          {...props}
          placeholder={focused ? "" : props.placeholder}
          style={[
            {
              height: innerHeight,
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
};
