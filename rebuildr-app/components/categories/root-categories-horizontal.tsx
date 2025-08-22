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
              setCategories([id]);
              router.navigate("/(app)/(tabs)/search/products");
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

            <Label size="small" style={{ textAlign: "center" }}>
              {name}
            </Label>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
