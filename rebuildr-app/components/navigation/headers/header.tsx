import { Button } from "@components/buttons/button";
import { dividerStyles } from "@components/dividers/divider";
import { Title } from "@components/typography/text";
import { useThemeColor } from "@hooks/useThemeColor";
import { IconType } from "@icons/icon";
import { router } from "expo-router";
import { View } from "react-native";

type Props = {
  title?: string;
  CTA?: { icon: IconType; onPress: () => void }[];
  onBack?: () => void;
};

export const Header = ({ title, CTA, onBack }: Props) => {
  const colors = useThemeColor();

  return (
    <View
      style={[
        {
          flexDirection: "row",
          paddingVertical: 8,
          alignItems: "center",
          justifyContent: "space-between",
        },
        dividerStyles(colors).bottomDivider,
      ]}
    >
      <View
        style={[
          {
            flexDirection: "row",
            gap: 6,
            alignItems: "center",
          },
        ]}
      >
        <Button
          icon="arrowLeft"
          onPress={() =>
            onBack
              ? onBack()
              : router.canGoBack()
                ? router.back()
                : router.navigate("/")
          }
          type="text"
        />
        {title && <Title size="medium">{title}</Title>}
      </View>
      <View
        style={[
          {
            flexDirection: "row",
            gap: 6,
            alignItems: "center",
          },
        ]}
      >
        {CTA?.map((cta, i) => (
          <Button key={i} icon={cta.icon} onPress={cta.onPress} type="text" />
        ))}
      </View>
    </View>
  );
};
