import { Button } from "@components/buttons/button";
import { dividerStyles } from "@components/dividers/divider";
import { Title } from "@components/typography/text";
import { useThemeColor } from "@hooks/useThemeColor";
import { IconType } from "@icons/icon";
import { router } from "expo-router";
import { PropsWithChildren, ReactElement } from "react";
import { View } from "react-native";

type Props = {
  title?: string;
  CTA?: { icon: IconType; onPress: () => void }[];
  onBack?: () => void;
  middle?: ReactElement;
} & PropsWithChildren;

export const Header = ({ title, CTA, onBack, middle }: Props) => {
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
            marginLeft: -12,
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
        {!title && middle}
      </View>
      <View
        style={[
          {
            flexDirection: "row",
            gap: 6,
            alignItems: "center",
            marginRight: -12,
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
