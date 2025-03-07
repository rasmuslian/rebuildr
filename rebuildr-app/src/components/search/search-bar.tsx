import { useThemeColor } from "@/src/hooks/useThemeColor";
import { Pressable, TextInput, TextInputProps, View } from "react-native";
import { Icon } from "../icons/icon";
import { textStyles } from "../typography/typeface";

type Props = {
  placeholder: string;
  onChange?: (value: string) => void;
  value?: string;
  disabled?: boolean;
} & Omit<TextInputProps, "onChange">;

export const SearchBar = ({
  placeholder,
  onChange,
  onFocus,
  onBlur,
  value,
  disabled,
  defaultValue,
  ...rest
}: Props) => {
  const colors = useThemeColor();
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        borderBottomWidth: 1,
        borderColor: colors.dividers.neutral,
        paddingVertical: 8,
      }}
    >
      <Icon icon="arrowLeft" />
      <View
        style={[
          {
            flex: 1,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingVertical: 10,
            paddingHorizontal: 10,
            backgroundColor: !value ? colors.background.secondary : "none",
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
          value={value}
          editable={!disabled}
          defaultValue={defaultValue}
          style={[
            {
              outlineStyle: "none",
              overflow: "visible",
              flexGrow: 1,
              ...(!value ? textStyles.label.large : textStyles.title.medium),
              lineHeight: undefined,
            },
            rest.style,
          ]}
        />
      </View>
      {!!value && (
        <Pressable onPress={() => onChange("")}>
          <View style={{ marginLeft: 8 }}>
            <Icon icon="X" />
          </View>
        </Pressable>
      )}
    </View>
  );
};
