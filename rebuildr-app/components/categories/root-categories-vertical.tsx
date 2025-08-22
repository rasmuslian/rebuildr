import React from "react";
import { View, FlatList, Image, TouchableOpacity } from "react-native";
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
import Placeholder from "@assets/images/placeholder.png";
import { useFilterProduct } from "@hooks/useFilterProduct";

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
        renderItem={({ item: { id, name, image } }) => (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <TouchableOpacity
              onPress={() => {
                setCategories([id]);
                router.navigate({
                  pathname: "/(app)/(tabs)/search/products",
                  params: { selectedCategoryId: id },
                });
              }}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                flex: 1,
              }}
            >
              <Image
                source={image?.url ?? Placeholder.uri}
                style={{
                  height: 60,
                  width: 60,
                  borderRadius: 100,
                }}
              />

              <Headline size="small" ellipsizeMode="tail" numberOfLines={1}>
                {name}
              </Headline>
            </TouchableOpacity>

            <Button
              icon={"chevronRight"}
              type="text"
              onPress={() => {
                router.navigate({
                  pathname: "/categories/[categoryId]",
                  params: { categoryId: id, name: name },
                });
              }}
            />
          </View>
        )}
      />
    </View>
  );
}
