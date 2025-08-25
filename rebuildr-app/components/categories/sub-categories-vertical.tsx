import { FlatList, TouchableOpacity, View } from "react-native";
import React from "react";
import { router } from "expo-router";
import { SubCategoriesQuery, SubCategoriesQueryVariables } from "@/gql/graphql";
import { SUB_CATEGORIES } from "@/queries";
import { useQuery } from "@apollo/client";
import { Headline } from "@components/typography/text";
import { useFilterProduct } from "@hooks/useFilterProduct";
import { Button } from "@components/buttons/button";
import { Avatar } from "@components/avatar/avatar";

type Props = {
  id: string;
};

export function SubCategoriesVertical({ id }: Props) {
  const { setCategories } = useFilterProduct();
  const { data } = useQuery<SubCategoriesQuery, SubCategoriesQueryVariables>(
    SUB_CATEGORIES,
    {
      variables: {
        input: { id },
      },
    },
  );

  const category = data?.category;
  const categories = data?.category.children ?? [];

  return (
    <View>
      <Button
        label="Visa alla annonser"
        onPress={() => {
          const categoryIds = categories.map((category) => category.id);
          setCategories(categoryIds, category?.id);
          router.navigate("/(app)/(tabs)/search/products");
        }}
        style={{ marginBottom: 24 }}
      />

      <FlatList
        showsHorizontalScrollIndicator={false}
        data={categories}
        contentContainerStyle={{ gap: 16 }}
        renderItem={({ item: { id, image, name } }) => (
          <TouchableOpacity
            onPress={() => {
              setCategories([id], id);
              router.navigate("/(app)/(tabs)/search/products");
            }}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              flex: 1,
            }}
          >
            <Avatar imageUrl={image?.url} size={60} placeholder="CATEGORY" />
            <Headline size="small" ellipsizeMode="tail" numberOfLines={1}>
              {name}
            </Headline>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
