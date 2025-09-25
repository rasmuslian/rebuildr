import { Pressable, View, FlatList } from "react-native";
import React from "react";
import { Body, Label, Title } from "@components/typography/text";
import { Icon } from "@icons/icon";
import { Logo } from "@components/logo/logo";
import { primitives } from "@constants/colors";
import { gql, useQuery } from "@apollo/client";
import { Link } from "expo-router";
import {
  ListFooterSectionQuery,
  ListFooterSectionQueryVariables,
} from "@/gql/graphql";

const LIST_FOOTER_SECTION = gql`
  query ListFooterSection {
    listFooterSection {
      id
      title
      orderIndex
      articleFooterSections {
        articleId
        footerSectionId
        orderIndex
        article {
          id
          title
        }
      }
    }
  }
`;

export default function Footer() {
  const { data } = useQuery<
    ListFooterSectionQuery,
    ListFooterSectionQueryVariables
  >(LIST_FOOTER_SECTION);

  const footerSections = data?.listFooterSection ?? [];

  return (
    <View
      style={{
        backgroundColor: primitives.primary900,
        width: "100%",
        paddingHorizontal: 16,
        paddingVertical: 24,
      }}
    >
      <FlatList
        data={footerSections}
        keyExtractor={(item) => item.title}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        renderItem={({ index, item: { articleFooterSections, title } }) => {
          const itemsInLastRow = footerSections.length % 2 || 2;
          const isLastSection = index >= footerSections.length - itemsInLastRow;

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

              {articleFooterSections.map(({ article }, position, array) => {
                const isLastRow = position === array.length - 1;

                return (
                  <Link
                    key={article.id}
                    style={{ marginBottom: isLastRow ? 0 : 16 }}
                    href={{
                      pathname: "/(app)/article/[articleId]",
                      params: { articleId: article.id, title: article.title },
                    }}
                  >
                    <Label size="medium" color="primaryLight">
                      {article.title}
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
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            borderBottomWidth: 1,
            borderTopWidth: 1,
            borderColor: primitives.primary700,
            paddingVertical: 24,
          }}
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
              <Pressable onPress={() => console.log("Instagram icon pressed")}>
                <Icon icon="instagram" color="primaryLight" />
              </Pressable>

              <Pressable onPress={() => console.log("Linkedin icon pressed")}>
                <Icon icon="linkedin" color="primaryLight" />
              </Pressable>
            </View>
          </View>
          <Logo width={148} height={26} />
        </View>

        <Body size="small" color="success">
          © 2025 Rebuildr. All rights reserved.
        </Body>
      </View>
    </View>
  );
}
