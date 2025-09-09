import React from "react";
import { View, FlatList, TouchableOpacity } from "react-native";
import { useQuery } from "@apollo/client";
import { Button } from "@components/buttons/button";
import { Headline } from "@components/typography/text";
import { router } from "expo-router";
import {
  OrderCategoriesEnum,
  RootCategoriesQuery,
  RootCategoriesQueryVariables,
} from "@/gql/graphql";
import { ROOT_CATEGORIES } from "@/queries";
import { useFilterProduct } from "@hooks/useFilterProduct";
import { Avatar } from "@components/avatar/avatar";

export function RootCategoriesVertical() {
  const { setCategories } = useFilterProduct();
  const { data } = useQuery<RootCategoriesQuery, RootCategoriesQueryVariables>(
    ROOT_CATEGORIES,
    {
      variables: {
        input: {
          orderBy: OrderCategoriesEnum.OrderIndexAsc,
        },
      },
    },
  );

  const categories = data?.rootCategories ?? [];

  return (
    <View>
      <FlatList
        showsHorizontalScrollIndicator={false}
        data={categories}
        contentContainerStyle={{ gap: 16 }}
        renderItem={({ item: category }) => (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <TouchableOpacity
              onPress={() => {
                setCategories({
                  categories: [category],
                  selectedCategoryId: category.id,
                });
                router.navigate("/(app)/(tabs)/search/products");
              }}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                flex: 1,
              }}
            >
              <Avatar
                imageUrl={category.image?.url}
                size={60}
                placeholder="CATEGORY"
              />
              <Headline size="small" ellipsizeMode="tail" numberOfLines={1}>
                {category.name}
              </Headline>
            </TouchableOpacity>

            <Button
              icon="chevronRight"
              type="text"
              onPress={() => {
                router.navigate({
                  pathname: "/categories/[categoryId]",
                  params: { categoryId: category.id, name: category.name },
                });
              }}
            />
          </View>
        )}
      />
    </View>
  );
}
