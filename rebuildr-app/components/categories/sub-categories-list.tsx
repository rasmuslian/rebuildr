import { View, TouchableOpacity, useWindowDimensions } from "react-native";
import { useQuery } from "@apollo/client";
import React from "react";
import { SubCategoriesQuery, SubCategoriesQueryVariables } from "@/gql/graphql";
import { SUB_CATEGORIES } from "@/queries";
import { Display, Body, Label } from "@components/typography/text";
import { Divider } from "@components/dividers/divider";
import { useFilterProduct } from "@hooks/useFilterProduct";
import { router } from "expo-router";
import { Avatar } from "@components/avatar/avatar";

type Props = {
  id: string;
};

export function SubCategoriesList({ id }: Props) {
  const { setCategories } = useFilterProduct();
  const { width: screenWidth } = useWindowDimensions();
  const width = (screenWidth - 56) / 3;

  const { data } = useQuery<SubCategoriesQuery, SubCategoriesQueryVariables>(
    SUB_CATEGORIES,
    {
      variables: {
        input: { id },
      },
    },
  );

  const category = data?.category;
  const subCategories = data?.category.children ?? [];

  return (
    <View style={{ marginBottom: 24, gap: 24 }}>
      <View style={{ gap: 16 }}>
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
        {subCategories.map(({ id: categoryId, name, image }) => (
          <TouchableOpacity
            key={categoryId}
            style={{
              width,
              alignItems: "center",
              gap: 8,
            }}
            onPress={() => {
              setCategories({
                categoryIds: [categoryId],
                rootCategoryIds: [id],
                selectedCategoryId: id,
              });
              router.navigate("/(app)/(tabs)/search/products");
            }}
          >
            <Avatar imageUrl={image?.url} size={80} placeholder="CATEGORY" />
            <Label size="small" style={{ textAlign: "center" }}>
              {name}
            </Label>
          </TouchableOpacity>
        ))}
      </View>

      <Divider />
    </View>
  );
}
