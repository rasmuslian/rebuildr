import React from "react";
import { router } from "expo-router";
import { View, ScrollView, TouchableOpacity } from "react-native";
import { useQuery } from "@apollo/client";
import { Label } from "@components/typography/text";
import { useFilterProduct } from "@hooks/useFilterProduct";
import { ROOT_CATEGORIES } from "@/queries";
import { Avatar } from "@components/avatar/avatar";
import {
  OrderCategoriesEnum,
  RootCategoriesQuery,
  RootCategoriesQueryVariables,
} from "@/gql/graphql";

export function RootCategoriesHorizontal() {
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
    <View
      style={{
        paddingBottom: 16,
        marginHorizontal: -16,
      }}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          gap: 8,
        }}
      >
        {categories.map(({ id, name, image }) => (
          <TouchableOpacity
            key={id}
            style={{
              width: 80,
              alignItems: "center",
              gap: 16,
            }}
            onPress={() => {
              setCategories([id], id);
              router.navigate("/(app)/(tabs)/search/products");
            }}
          >
            <Avatar imageUrl={image?.url} size={60} placeholder="CATEGORY" />
            <Label size="small" style={{ textAlign: "center" }}>
              {name}
            </Label>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
