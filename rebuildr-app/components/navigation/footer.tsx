import { Linking, Pressable, View, FlatList } from "react-native";
import React from "react";
import { Body, Label, Title } from "@components/typography/text";
import { Icon } from "@icons/icon";
import { Logo } from "@components/logo/logo";
import { primitives } from "@constants/colors";
import { gql, useQuery } from "@apollo/client";
import { Href, Link } from "expo-router";
import {
  ListFooterSectionQuery,
  ListFooterSectionQueryVariables,
} from "@/gql/graphql";
import { useScreenType } from "@hooks/useScreenType";
import { horizontalPadding } from "@constants/sizes";
import { MAX_CONTENT_WIDTH } from "@constants/layout";
import { resolveCmsHref } from "@/utils/resolve-cms-href";

const LIST_FOOTER_SECTION = gql`
  query ListFooterSection {
    listFooterSection {
      id
      title
      orderIndex
      entries {
        id
        articleId
        footerSectionId
        orderIndex
        type
        url
        label
        article {
          id
          title
          slug
        }
      }
    }
  }
`;

export default function Footer() {
  const { isDesktop } = useScreenType();
  const { data } = useQuery<
    ListFooterSectionQuery,
    ListFooterSectionQueryVariables
  >(LIST_FOOTER_SECTION);

  const footerSections = data?.listFooterSection ?? [];

  return (
    <View style={{ width: "100%" }}>
      <View
        style={[
          {
            backgroundColor: primitives.primary900,
            width: "100%",
            paddingHorizontal: isDesktop
              ? horizontalPadding.desktop
              : horizontalPadding.mobile,
            paddingBottom: 24,
            paddingTop: isDesktop ? 48 : 24,
          },
          isDesktop && { maxWidth: MAX_CONTENT_WIDTH, alignSelf: "center" },
        ]}
      >
        <FlatList
          key={isDesktop ? "desktop" : "mobile"}
          data={footerSections}
          keyExtractor={(item) => item.title}
          numColumns={isDesktop ? 5 : 2}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          renderItem={({ index, item: { entries, title } }) => {
            const itemsInLastRow = footerSections.length % 2 || 2;
            const isLastSection =
              index >= footerSections.length - itemsInLastRow;

            return (
              <View
                style={{
                  flex: 1,
                  marginBottom: isLastSection ? 24 : 48,
                }}
              >
                <Title
                  size="medium"
                  color="primaryLight"
                  style={{ marginBottom: 16 }}
                >
                  {title}
                </Title>

                {entries.map((entry, position, array) => {
                  const isLastRow = position === array.length - 1;

                  const article = entry.article;
                  const title = article ? article.title : entry.label;
                  const href: Href = article
                    ? {
                        pathname: "/(app)/article/[slug]",
                        params: { slug: article.slug },
                      }
                    : resolveCmsHref(entry.url);
                  return (
                    <Link
                      key={entry.id}
                      style={{ marginBottom: isLastRow ? 0 : 16 }}
                      href={href}
                    >
                      <Label size="medium" color="primaryLight">
                        {title}
                      </Label>
                    </Link>
                  );
                })}
              </View>
            );
          }}
        />

        <View style={{ flexDirection: "column", gap: 16 }}>
          <View
            style={[
              {
                flexDirection: "row",
                justifyContent: "space-between",
                borderBottomWidth: 1,
                borderTopWidth: 1,
                borderColor: primitives.primary700,
                paddingVertical: 24,
              },
              isDesktop ? { alignItems: "center", borderBottomWidth: 0 } : {},
            ]}
          >
            <View style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <Body size="small" color="primaryLight">
                Följ oss på:
              </Body>
              <View
                style={{
                  flexDirection: "row",
                  gap: 24,
                }}
              >
                <Pressable
                  onPress={() =>
                    Linking.openURL("https://www.instagram.com/rebuildr.se")
                  }
                >
                  <Icon icon="instagram" color="primaryLight" />
                </Pressable>

                <Pressable
                  onPress={() =>
                    Linking.openURL(
                      "https://www.linkedin.com/company/rebuildrnordics",
                    )
                  }
                >
                  <Icon icon="linkedin" color="primaryLight" />
                </Pressable>

                <Pressable
                  onPress={() =>
                    Linking.openURL("https://rebuildr.substack.com/archive")
                  }
                >
                  <Icon icon="substack" color="primaryLight" />
                </Pressable>
              </View>
            </View>
            <Logo width={148} height={26} />
          </View>

          <Body size="small" color="success">
            © 2026 Rebuildr. All rights reserved.
          </Body>
        </View>
      </View>
    </View>
  );
}
