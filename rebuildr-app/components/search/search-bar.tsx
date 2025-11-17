import { View, ViewStyle } from "react-native";
import { useThemeColor } from "@hooks/useThemeColor";
import { Button, ButtonProps } from "@components/buttons/button";
import { ComponentProps } from "react";
import { Search } from "@components/search/search";

type Props = {
  onPressArrow?: () => void;
  ctas?: ButtonProps[];
  style?: ViewStyle;
} & ComponentProps<typeof Search>;

export const SearchBar = ({
  onPressArrow,
  ctas,
  style,
  ...searchProps
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
      <Search {...searchProps} />
      {ctas && (
        <View
          style={{
            flexDirection: "row",
            gap: 6,
            alignItems: "center",
          }}
        >
          {ctas?.map((cta, i) => (
            <Button key={i} type="text" {...cta} />
          ))}
        </View>
      )}
    </View>
  );
};
