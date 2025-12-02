import { View, TouchableOpacity, useWindowDimensions } from "react-native";
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

export function SubCategoriesListMobile({ category }: Props) {
  const { setCategories } = useFilterProduct();
  const { width: screenWidth } = useWindowDimensions();
  const width = (screenWidth - 56) / 3;

  const subCategories = category.children ?? [];

  return (
    <View style={{ marginBottom: 24, gap: 24 }}>
      <View style={{ gap: 16 }}>
        <Breadcrums parentCategory={category.parent} category={category} />
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
        {[...subCategories, ...subCategories].map((c) => (
          <TouchableOpacity
            key={c.id}
            style={{
              width,
              alignItems: "center",
              gap: 8,
            }}
            onPress={() => {
              setCategories({
                categories: [c],
                selectedCategoryId: c.id,
              });
              router.navigate("/(app)/(tabs)/search/products");
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
