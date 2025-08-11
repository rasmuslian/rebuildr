import {
  Pressable,
  View,
  TouchableOpacity,
  FlatList,
  Linking,
} from "react-native";
import { useThemeColor } from "@hooks/useThemeColor";
import React from "react";
import { Body, Label, Title } from "@components/typography/text";
import { Icon } from "@icons/icon";
import { Logo } from "@components/logo/logo";

// Mock data - Start
type LinkGroup = {
  title: string;
  links: {
    label: string;
    href: string;
  }[];
};

const linkGroups: LinkGroup[] = [
  {
    title: "INSPIRATION",
    links: [
      {
        label: "Byggtips & tricks",
        href: "#",
      },
      {
        label: "Bygginspiration",
        href: "#",
      },
      {
        label: "Byggbloggen",
        href: "#",
      },
      {
        label: "Nyhetsbrev",
        href: "#",
      },
      {
        label: "Välgörenhet",
        href: "#",
      },
    ],
  },
  {
    title: "Sälj med Rebuildr",
    links: [
      {
        label: "Sälj som privatperson",
        href: "#",
      },
      {
        label: "Sälj som företag",
        href: "#",
      },
      {
        label: "Öppna butik",
        href: "#",
      },
      {
        label: "Lager för företag",
        href: "#",
      },
      {
        label: "Priser",
        href: "#",
      },
    ],
  },
  {
    title: "Köpa",
    links: [
      {
        label: "Handla på Rebuildr",
        href: "#",
      },
      {
        label: "Köparskydd",
        href: "#",
      },
      {
        label: "Kategorier",
        href: "#",
      },
      {
        label: "Köp nu – betala senare",
        href: "#",
      },
      {
        label: "Populära varumärken",
        href: "#",
      },
    ],
  },
  {
    title: "Kundservice",
    links: [
      {
        label: "Regler",
        href: "#",
      },
      {
        label: "Säkerhet",
        href: "#",
      },
      {
        label: "FAQ",
        href: "#",
      },
      {
        label: "Kundservice & kontakt",
        href: "#",
      },
      {
        label: "Press",
        href: "#",
      },
      {
        label: "Integritetsinställningar",
        href: "#",
      },
    ],
  },
  {
    title: "Information",
    links: [
      {
        label: "Användaravtal",
        href: "#",
      },
      {
        label: "Integritetspolicy",
        href: "#",
      },
      {
        label: "Cookies",
        href: "#",
      },
      {
        label: "Om Rebuildr",
        href: "#",
      },
      {
        label: "Jobba hos oss",
        href: "#",
      },
    ],
  },
];
// Mock data - End

export default function Footer() {
  const colors = useThemeColor();

  const renderLinkGroup = ({
    item,
    index,
  }: {
    item: LinkGroup;
    index: number;
  }) => {
    const itemsInLastRow = linkGroups.length % 2 || 2;
    const isLastRow = index >= linkGroups.length - itemsInLastRow;

    return (
      <View
        style={{
          flex: 1,
          marginBottom: isLastRow ? 24 : 48,
        }}
      >
        <Title
          size="medium"
          style={{ color: colors.text.primaryLight, marginBottom: 16 }}
        >
          {item.title}
        </Title>

        {item.links.map((link, linkIndex) => {
          const isLastLink = linkIndex === item.links.length - 1;

          return (
            <TouchableOpacity
              key={linkIndex}
              onPress={() => Linking.openURL(link.href)}
            >
              <Label
                size="medium"
                style={{
                  color: colors.text.primaryLight,
                  marginBottom: isLastLink ? 0 : 16,
                }}
              >
                {link.label}
              </Label>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <View
      style={{
        backgroundColor: colors.logo.vector,
        width: "100%",
        paddingHorizontal: 16,
        paddingVertical: 24,
      }}
    >
      <FlatList
        data={linkGroups}
        keyExtractor={(item) => item.title}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        renderItem={renderLinkGroup}
      />

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
            <Body size="small" style={{ color: colors.text.primaryLight }}>
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

        <Body size="small" style={{ color: colors.text.success }}>
          © 2025 Rebuildr. All rights reserved.
        </Body>
      </View>
    </View>
  );
}
