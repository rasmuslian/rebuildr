import React from "react";
import { SubCategoriesQuery } from "@/gql/graphql";
import { useScreenType } from "@hooks/useScreenType";
import {
  View,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { Display, Body, Label } from "@components/typography/text";
import { Divider } from "@components/dividers/divider";
import { router } from "expo-router";
import { Avatar } from "@components/avatar/avatar";
import { Breadcrumbs } from "@components/preview-product/breadcrumbs";

type Props = {
  category: SubCategoriesQuery["category"];
};

export function SubCategoriesList({ category }: Props) {
  const subCategories = category.children ?? [];
  const { isDesktop } = useScreenType();
  const { width: screenWidth } = useWindowDimensions();
  const width = (screenWidth - 56) / 3;

  if (isDesktop) {
    return (
      <View style={{ marginBottom: 24, gap: 24 }}>
        <View style={{ gap: 16 }}>
          <Breadcrumbs parentCategory={category.parent} category={category} />
          <Display size="small">{category?.name}</Display>
          <Body size="large">{category?.description}</Body>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
            gap: 16,
          }}
        >
          {subCategories.map((c) => (
            <TouchableOpacity
              key={c.id}
              style={{
                width: 100,
                alignItems: "center",
                gap: 14,
              }}
              onPress={() => {
                router.navigate({
                  pathname: "/search/products/[categoryId]/[subCategoryId]",
                  params: {
                    categoryId: category.id,
                    subCategoryId: c.id,
                  },
                });
              }}
            >
              <Avatar
                imageUrl={c.image?.url}
                size={88}
                placeholder="CATEGORY"
              />
              <Label size="medium" style={{ textAlign: "center" }}>
                {c.name}
              </Label>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Divider />
      </View>
    );
  }

  return (
    <View style={{ marginBottom: 24, gap: 24 }}>
      <View style={{ gap: 16 }}>
        <Breadcrumbs parentCategory={category.parent} category={category} />
        <Display size="small">{category?.name}</Display>
        <Body size="large">{category?.description}</Body>
      </View>

      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          rowGap: 24,
          columnGap: 8,
          display: subCategories.length > 1 ? "flex" : "none",
        }}
      >
        {subCategories.map((c) => (
          <TouchableOpacity
            key={c.id}
            style={{
              width,
              alignItems: "center",
              gap: 8,
            }}
            onPress={() => {
              router.navigate({
                pathname: "/search/products/[categoryId]/[subCategoryId]",
                params: {
                  categoryId: category.id,
                  subCategoryId: c.id,
                },
              });
            }}
          >
            <Avatar imageUrl={c.image?.url} size={80} placeholder="CATEGORY" />
            <Label size="small" style={{ textAlign: "center" }}>
              {c.name}
            </Label>
          </TouchableOpacity>
        ))}
      </View>

      <Divider />
    </View>
  );
}
