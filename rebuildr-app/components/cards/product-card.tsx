import { AdList } from "@components/ad/ad-list";
import { Avatar } from "@components/avatar/avatar";
import { Badge } from "@components/badges/badge";
import { Divider } from "@components/dividers/divider";
import { Label, Body } from "@components/typography/text";
import { borderRadius } from "@constants/sizes";
import { useThemeColor } from "@hooks/useThemeColor";
import { ComponentProps } from "react";
import { Pressable, View } from "react-native";

type Props = {
  active?: boolean;
  onPress: () => void;
  adListProps: ComponentProps<typeof AdList>;
  avatars: ComponentProps<typeof Avatar>[];
  primaryText: string;
  secondaryText: string;
  badgeProps?: ComponentProps<typeof Badge> | null;
};

export const ProductCard = ({
  active,
  onPress,
  adListProps,
  avatars,
  primaryText,
  secondaryText,
  badgeProps,
}: Props) => {
  const colors = useThemeColor();

  return (
    <Pressable
      onPress={onPress}
      style={[
        {
          borderRadius: borderRadius.medium,
          gap: 12,
        },
        active
          ? {
              borderWidth: 1,
              borderColor: colors.text.link,
              paddingTop: 16,
              paddingBottom: 12,
              paddingHorizontal: 16,
            }
          : {
              paddingTop: 17,
              paddingBottom: 13,
              paddingHorizontal: 17,
              backgroundColor: colors.buttons.tonal.enabled,
            },
      ]}
    >
      <AdList {...adListProps} />
      <Divider />
      <View
        style={{
          flexDirection: "row",
          gap: 8,
          alignItems: "center",
        }}
      >
        <View style={{ minWidth: 52 }}>
          <Avatar
            size={32}
            style={{
              borderWidth: 2,
              borderColor: colors.text.primaryLight,
              borderRadius: 38,
            }}
            {...avatars[0]}
          />
          {avatars[1] && (
            <View
              style={{
                position: "absolute",
                left: 20,
                top: 0,
              }}
            >
              <Avatar
                size={32}
                style={{
                  borderWidth: 2,
                  borderColor: colors.text.primaryLight,
                  borderRadius: 38,
                }}
                {...avatars[1]}
              />
            </View>
          )}
        </View>
        <View style={{ flex: 1, alignItems: "center" }}>
          <View style={{ width: "100%" }}>
            <Label size="medium" numberOfLines={1}>
              {primaryText}
            </Label>
            <Body size="small" color="secondary">
              {secondaryText}
            </Body>
          </View>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          {badgeProps ? <Badge {...badgeProps} /> : <View />}
        </View>
      </View>
    </Pressable>
  );
};
