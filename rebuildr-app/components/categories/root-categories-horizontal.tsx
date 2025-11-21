import React from "react";
import { router } from "expo-router";
import { View, ScrollView, TouchableOpacity } from "react-native";
import { useQuery } from "@apollo/client";
import { Headline, Label } from "@components/typography/text";
import { useFilterProduct } from "@hooks/useFilterProduct";
import { ROOT_CATEGORIES } from "@/queries";
import { Avatar } from "@components/avatar/avatar";
import {
  OrderCategoriesEnum,
  RootCategoriesQuery,
  RootCategoriesQueryVariables,
} from "@/gql/graphql";
import { useScreenType } from "@hooks/useScreenType";
import { Divider } from "@components/dividers/divider";

export function RootCategoriesHorizontal() {
  const { setCategories } = useFilterProduct();
  const { isDesktop } = useScreenType();

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
        marginHorizontal: -16,
      }}
    >
      {isDesktop && (
        <View style={{ paddingHorizontal: 16 }}>
          <Headline size="small" style={{ marginBottom: 20 }}>
            Populära Kategorier
          </Headline>
        </View>
      )}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          gap: isDesktop ? 16 : 8,
        }}
      >
        {categories.map((c) => (
          <TouchableOpacity
            key={c.id}
            style={{
              width: isDesktop ? 100 : 72,
              alignItems: "center",
              gap: isDesktop ? 14 : 12,
            }}
            onPress={() => {
              setCategories({
                categories: [c],
                selectedCategoryId: c.id,
              });
              router.navigate("/(app)/(tabs)/search/products");
            }}
          >
            <Avatar
              imageUrl={c.image?.url}
              size={isDesktop ? 88 : 60}
              placeholder="CATEGORY"
            />
            <Label size="medium" style={{ textAlign: "center" }}>
              {c.name}
            </Label>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {isDesktop && (
        <View style={{ paddingHorizontal: 16, paddingTop: 12 }}>
          <Divider />
        </View>
      )}
    </View>
  );
}
