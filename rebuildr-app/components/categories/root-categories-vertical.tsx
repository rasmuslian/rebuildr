import React from "react";
import { View, FlatList, Pressable } from "react-native";
import { useQuery } from "@apollo/client";
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
import { Icon } from "@icons/icon";

export type RootCategoriesVerticalCategory =
  RootCategoriesQuery["rootCategories"][number];

type Props = {
  onNavigate?: () => void;
};

export function RootCategoriesVertical({ onNavigate }: Props) {
  const { filterBuilder } = useFilterProduct();
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
          <Pressable
            onPress={() => {
              router.navigate({
                pathname: "/search/products/[categoryId]",
                params: {
                  categoryId: category.id,
                },
              });

              onNavigate?.();
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View
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
              </View>
              <Icon
                icon="chevronRight"
                size={18}
                style={{ paddingHorizontal: 8 }}
              />
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}
