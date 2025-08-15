import React from "react";
import { router } from "expo-router";
import { View, ScrollView, Image, TouchableOpacity } from "react-native";
import { gql, useQuery } from "@apollo/client";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { Label } from "@components/typography/text";
import Placeholder from "@assets/images/placeholder.png";
import { useFilterProduct } from "@hooks/useFilterProduct";
import {
  OrderCategoriesEnum,
  RootCategoriesQuery,
  RootCategoriesQueryVariables,
} from "@/gql/graphql";

const ROOT_CATEGORIES = gql`
  query RootCategories($input: RootCategoriesInput!) {
    rootCategories(input: $input) {
      id
      name
      image {
        id
        url
      }
    }
  }
`;

export function RootCategories() {
  const { setCategories } = useFilterProduct();

  const { data, loading } = useQuery<
    RootCategoriesQuery,
    RootCategoriesQueryVariables
  >(ROOT_CATEGORIES, {
    variables: {
      input: {
        orderBy: OrderCategoriesEnum.OrderIndexAsc,
      },
    },
  });

  return (
    <View
      style={{
        paddingBottom: 16,
        marginHorizontal: -16,
      }}
    >
      {loading ? (
        <LoadingSpinner />
      ) : (
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
      )}
    </View>
  );
}
