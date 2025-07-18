import { Badge } from "@components/badges/badge";
import { Button } from "@components/buttons/button";
import { dividerStyles } from "@components/dividers/divider";
import { Title } from "@components/typography/text";
import { useThemeColor } from "@hooks/useThemeColor";
import { IconType } from "@icons/icon";
import { router } from "expo-router";
import { ComponentProps, PropsWithChildren, ReactElement } from "react";
import { View } from "react-native";

type Props = {
  title?: string | null;
  ctas?: { icon: IconType; onPress: () => void }[];
  badge?: ComponentProps<typeof Badge> | null;
  showBackButton?: boolean;
  onBack?: () => void;
  middle?: ReactElement;
  showDivider?: boolean;
} & PropsWithChildren;

export const Header = ({
  title,
  ctas,
  badge,
  showBackButton = true,
  onBack,
  middle,
  showDivider = true,
}: Props) => {
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
        showDivider && dividerStyles(colors).bottomDivider,
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
        {showBackButton && (
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
            style={{ marginLeft: -12 }}
          />
        )}
        {title && (
          <Title size="medium" style={{ marginVertical: 8 }}>
            {title}
          </Title>
        )}
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
        {ctas?.map((cta, i) => (
          <Button key={i} icon={cta.icon} onPress={cta.onPress} type="text" />
        ))}
      </View>
      {badge && <Badge {...badge} />}
    </View>
  );
};
