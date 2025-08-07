import { Pressable, View } from "react-native";
import { useThemeColor } from "@hooks/useThemeColor";
import React from "react";
import { Body } from "@components/typography/text";
import { Icon } from "@icons/icon";
import { Logo } from "@components/logo/logo";

export default function Footer() {
  const colors = useThemeColor();

  return (
    <View
      style={{
        backgroundColor: colors.logo.vector,
        width: "100%",
        paddingHorizontal: 16,
        paddingVertical: 24,
      }}
    >
      <View>
        <Body style={{ color: colors.text.primaryLight }}>Links</Body>
      </View>

      <View style={{ flexDirection: "column", gap: 16 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            borderBottomWidth: 1,
            borderTopWidth: 1,
            borderColor: colors.dividers.neutral,
            paddingVertical: 24,
            borderBottomColor: colors.dividers.primary,
            borderTopColor: colors.dividers.primary,
          }}
        >
          <View style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Body style={{ color: colors.text.primaryLight }}>
              Följ oss på:
            </Body>
            <View
              style={{
                flexDirection: "row",
                gap: 24,
              }}
            >
              <Pressable onPress={() => console.log("Instagram icon pressed")}>
                <Icon icon="instagram" customColor={colors.text.primaryLight} />
              </Pressable>

              <Pressable onPress={() => console.log("Linkedin icon pressed")}>
                <Icon icon="linkedin" customColor={colors.text.primaryLight} />
              </Pressable>
            </View>
          </View>
          <Logo width={148} height={26} />
        </View>

        <Body style={{ color: colors.text.success }}>
          © 2025 Rebuildr. All rights reserved.
        </Body>
      </View>
    </View>
  );
}
