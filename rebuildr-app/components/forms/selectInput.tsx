import { Body } from "@components/typography/text";
import { TextTokens } from "@constants/colors";
import { borderRadius, strokeWidth } from "@constants/sizes";
import { useOutsidePress } from "@hooks/useOutsidePress";
import { useThemeColor } from "@hooks/useThemeColor";
import { Icon } from "@icons/icon";
import { ReactElement, useRef, useState } from "react";
import { Pressable, View } from "react-native";

export type Props<T> = {
  value?: T;
  disabled?: boolean;
  onPress?: () => void;
  placeholder?: string;
  error?: boolean;
  backgroundColor?: string;
  dropdown?: (collapseDropdown: () => void) => ReactElement;
  options: { value: T; label: string; disabled?: boolean }[];
  onSelect: (value: T) => void;
};

export const SelectInput = <T,>({ ...props }: Props<T>) => {
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [optionHover, setOptionHover] = useState<number | undefined>();
  const ref = useRef<View | null>(null);
  useOutsidePress(ref, () => {
    setShowOptions(false);
  });
  const colors = useThemeColor();

  const value = props.options.find((o) => o.value === props.value)?.label;
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

  const getTextColor = (): keyof TextTokens => {
    if (props.disabled) {
      return "disabled";
    }
    if (props.error) {
      return "secondary";
    }

    if (hovered || saved || focused) {
      return "primaryDark";
    }
    if (props.value) {
      return "primaryDark";
    }

    return "secondary";
  };

  const onPressOption = (optionIndex: number) => {
    setShowOptions(false);
    props.onSelect(props.options[optionIndex].value);
  };

  return (
    <View style={{ zIndex: 10 }} ref={ref}>
      <Pressable
        onHoverIn={() => setHovered(true)}
        onHoverOut={() => setHovered(false)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          outlineColor: colors.textField.clicked,
          paddingVertical: 16,
          paddingRight: 12,
          paddingLeft: 16,
          borderRadius: borderRadius.medium,
          height: 40,
          borderWidth: strokeWidth.regular,
          backgroundColor: props.backgroundColor ?? colors.background.neutral,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          borderColor: getBorderColor(),
        }}
        onPress={() => setShowOptions(!showOptions)}
      >
        <Body size="medium" color={getTextColor()}>
          {value || props.placeholder}
        </Body>
        <Icon icon="chevronDown" size={12} />
      </Pressable>
      {showOptions && (
        <View style={{ position: "relative", zIndex: 10 }}>
          <View
            style={{
              backgroundColor:
                props.backgroundColor ?? colors.background.neutral,
              alignSelf: "flex-end",
              width: "100%",
              paddingHorizontal: 16,
              borderBottomLeftRadius: 8,
              borderBottomRightRadius: 8,
              position: "absolute",
              top: 4,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.4,
              shadowRadius: 60,
            }}
          >
            {props.options.map((option, i) => (
              <Pressable
                onHoverIn={() => setOptionHover(i)}
                onPress={() => (!option.disabled ? onPressOption(i) : null)}
                key={i}
              >
                <View
                  style={[
                    {
                      paddingVertical: 13,
                      borderBottomWidth: 1,
                      borderColor: colors.dividers.primary,
                      borderStyle: "solid",
                    },
                    i === props.options.length - 1 && { borderBottomWidth: 0 },
                  ]}
                >
                  <Body
                    color={
                      option.disabled
                        ? "disabled"
                        : i === optionHover
                          ? "primaryDark"
                          : "secondary"
                    }
                  >
                    {option.label}
                  </Body>
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};
