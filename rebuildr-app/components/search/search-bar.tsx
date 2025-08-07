import { TextInput, TextInputProps, View, ViewStyle } from "react-native";
import { borderRadius } from "@constants/sizes";
import { useThemeColor } from "@hooks/useThemeColor";
import { Icon } from "@icons/icon";
import { textStyles } from "@components/typography/typeface";
import { Pressable } from "react-native-gesture-handler";
import { Button } from "@components/buttons/button";

type Props = {
  placeholder?: string;
  onChange?: (value: string) => void;
  onPressArrow?: () => void;
  value?: string;
  disabled?: boolean;
  style?: ViewStyle;
} & Omit<TextInputProps, "onChange" | "style">;

export const SearchBar = ({
  placeholder,
  onChange,
  onPressArrow,
  onFocus,
  onBlur,
  value,
  disabled,
  defaultValue,
  style,
  ...rest
}: Props) => {
  const colors = useThemeColor();
  return (
    <View
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          borderBottomWidth: 1,
          borderColor: colors.dividers.neutral,
          paddingVertical: 8,
          gap: 6,
        },
        style,
      ]}
    >
      {onPressArrow && (
        <Button
          icon="arrowLeft"
          onPress={() => onPressArrow?.()}
          type="text"
          style={{ marginLeft: -12 }}
        />
      )}
      <View
        style={[
          {
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            paddingVertical: 10,
            paddingHorizontal: 10,
            backgroundColor: !value ? colors.background.secondary : "none",
            borderRadius: borderRadius.medium,
          },
        ]}
      >
        {!value && (
          <View style={{ marginRight: 8 }}>
            <Icon icon="search" size={18} />
          </View>
        )}
        <TextInput
          {...rest}
          onChangeText={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={placeholder}
          placeholderTextColor={colors.text.secondary}
          value={value}
          editable={!disabled}
          defaultValue={defaultValue}
          style={{
            outlineStyle: undefined,
            outlineWidth: 0,
            overflow: "visible",
            flexGrow: 1,
            ...(!value ? textStyles.label.large : textStyles.title.medium),
            color: colors.text.primaryDark,
            lineHeight: undefined,
          }}
        />
      </View>
      {!!value && (
        <Pressable onPress={() => onChange?.("")}>
          <View style={{ marginLeft: 8 }}>
            <Icon icon="X" />
          </View>
        </Pressable>
      )}
    </View>
  );
};
