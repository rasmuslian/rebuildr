import { View, TouchableOpacity, ScrollView } from "react-native";
import React from "react";
import { SubCategoriesQuery } from "@/gql/graphql";
import { Display, Body, Label } from "@components/typography/text";
import { Divider } from "@components/dividers/divider";
import { useFilterProduct } from "@hooks/useFilterProduct";
import { router } from "expo-router";
import { Avatar } from "@components/avatar/avatar";
import { Breadcrums } from "@components/preview-product/breadcrums";

type Props = {
  category: SubCategoriesQuery["category"];
};

export function SubCategoriesListDesktop({ category }: Props) {
  const { setCategories } = useFilterProduct();

  const subCategories = category.children ?? [];

  return (
    <View style={{ marginBottom: 24, gap: 24 }}>
      <View style={{ gap: 16 }}>
        <Breadcrums parentCategory={category.parent} category={category} />
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
              setCategories({
                categories: [c],
                selectedCategoryId: c.id,
              });
              router.navigate("/(app)/(tabs)/search/products");
            }}
          >
            <Avatar imageUrl={c.image?.url} size={88} placeholder="CATEGORY" />
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
