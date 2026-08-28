import { SearchInput } from "@components/forms/searchInput";
import { Body, Label } from "@components/typography/text";
import type { LabelSize } from "@components/typography/typeface";
import { TextTokens } from "@constants/colors";
import { borderRadius, strokeWidth } from "@constants/sizes";
import { useOutsidePress } from "@hooks/useOutsidePress";
import { useThemeColor } from "@hooks/useThemeColor";
import { Icon } from "@icons/icon";
import { ReactElement, useRef, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";

export type Props<T> = {
  value?: T;
  disabled?: boolean;
  onPress?: () => void;
  placeholder?: string;
  error?: boolean;
  backgroundColor?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  dropdown?: (collapseDropdown: () => void) => ReactElement;
  options: { value: T; label: string; disabled?: boolean }[];
  onSelect: (value: T) => void;
  valueLabelSize?: LabelSize;
};

export const SelectInput = <T,>({ ...props }: Props<T>) => {
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [optionHover, setOptionHover] = useState<number | undefined>();
  const [search, setSearch] = useState("");
  const ref = useRef<View | null>(null);
  const closeOptions = () => {
    setShowOptions(false);
    setSearch("");
    setOptionHover(undefined);
  };
  useOutsidePress(ref, closeOptions);
  const colors = useThemeColor();

  const value = props.options.find((o) => o.value === props.value)?.label;
  const saved = !focused && !!props.value;
  const visibleOptions = search
    ? props.options.filter((option) =>
        option.label.toLocaleLowerCase().includes(search.toLocaleLowerCase()),
      )
    : props.options;

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

  const onPressOption = (option: Props<T>["options"][number]) => {
    closeOptions();
    props.onSelect(option.value);
  };

  return (
    <View
      style={{
        position: "relative",
        zIndex: showOptions ? 1000 : 1,
        elevation: showOptions ? 20 : 0,
      }}
      ref={ref}
    >
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
        onPress={() => {
          if (props.disabled) return;
          if (showOptions) closeOptions();
          else setShowOptions(true);
        }}
      >
        {props.valueLabelSize ? (
          <Label size={props.valueLabelSize} color={getTextColor()}>
            {value || props.placeholder}
          </Label>
        ) : (
          <Body size="medium" color={getTextColor()}>
            {value || props.placeholder}
          </Body>
        )}
        <Icon icon="chevronDown" size={12} />
      </Pressable>
      {showOptions && (
        <View
          style={{
            backgroundColor: props.backgroundColor ?? colors.background.neutral,
            width: "100%",
            padding: 8,
            borderRadius: borderRadius.medium,
            borderWidth: strokeWidth.regular,
            borderColor: colors.textField.enabled,
            position: "absolute",
            top: 48,
            left: 0,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.2,
            shadowRadius: 24,
            elevation: 20,
          }}
        >
          {props.searchable && (
            <View style={{ marginBottom: 8 }}>
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder={props.searchPlaceholder ?? "Sök"}
              />
            </View>
          )}
          <ScrollView
            style={{ maxHeight: 240 }}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
          >
            {visibleOptions.length ? (
              visibleOptions.map((option, i) => (
                <Pressable
                  onHoverIn={() => setOptionHover(i)}
                  onHoverOut={() => setOptionHover(undefined)}
                  onPress={() =>
                    !option.disabled ? onPressOption(option) : null
                  }
                  key={`${String(option.value)}-${i}`}
                >
                  <View
                    style={[
                      {
                        paddingHorizontal: 8,
                        paddingVertical: 12,
                        borderBottomWidth: 1,
                        borderColor: colors.dividers.primary,
                        borderStyle: "solid",
                      },
                      i === visibleOptions.length - 1 && {
                        borderBottomWidth: 0,
                      },
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
              ))
            ) : (
              <View style={{ paddingHorizontal: 8, paddingVertical: 12 }}>
                <Body color="secondary">Inga träffar</Body>
              </View>
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
};
