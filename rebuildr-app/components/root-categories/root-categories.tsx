import React from "react";
import { router } from "expo-router";
import { View, ScrollView, Image, TouchableOpacity } from "react-native";
import { useQuery } from "@apollo/client";
import { Label } from "@components/typography/text";
import Placeholder from "@assets/images/placeholder.png";
import { useFilterProduct } from "@hooks/useFilterProduct";
import { ROOT_CATEGORIES } from "@/queries";
import {
  OrderCategoriesEnum,
  RootCategoriesQuery,
  RootCategoriesQueryVariables,
} from "@/gql/graphql";

export function RootCategories() {
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
        {data?.rootCategories.map((category) => {
          return (
            <TouchableOpacity
              key={category.id}
              style={{
                width: 80,
                alignItems: "center",
                gap: 16,
              }}
              onPress={() => {
                setCategories([category.id]);
                router.navigate("/(app)/(tabs)/search/products");
              }}
            >
              <Image
                source={category.image ? category.image.url : Placeholder.uri}
                style={{
                  height: 60,
                  width: 60,
                  borderRadius: 100,
                }}
              />

              <Label size="small" style={{ textAlign: "center" }}>
                {category.name}
              </Label>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
