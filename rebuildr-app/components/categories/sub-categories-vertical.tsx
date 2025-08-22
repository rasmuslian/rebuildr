import { FlatList, TouchableOpacity, Image, View } from "react-native";
import React from "react";
import { router } from "expo-router";
import { SubCategoriesQuery, SubCategoriesQueryVariables } from "@/gql/graphql";
import { SUB_CATEGORIES } from "@/queries";
import { useQuery } from "@apollo/client";
import Placeholder from "@assets/images/placeholder.png";
import { Headline } from "@components/typography/text";
import { useFilterProduct } from "@hooks/useFilterProduct";
import { Button } from "@components/buttons/button";

type Props = {
  id: string;
};

export function SubCategoriesVertical({ id }: Props) {
  const { setCategories } = useFilterProduct();
  const { data } = useQuery<SubCategoriesQuery, SubCategoriesQueryVariables>(
    SUB_CATEGORIES,
    {
      variables: {
        categoryInput: { id },
        getCategoriesInput: { parentIds: [id] },
      },
    },
  );

  const categories = data?.getCategories ?? [];

  return (
    <View>
      <Button
        label="Visa alla annonser"
        onPress={() => {
          const categoryIds = categories.map((category) => category.id);
          setCategories(categoryIds);
          router.navigate("/(app)/(tabs)/search/products");
        }}
        style={{ marginBottom: 24 }}
      />

      <FlatList
        showsHorizontalScrollIndicator={false}
        data={categories}
        contentContainerStyle={{ gap: 16 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => {
              setCategories([item.id]);
              router.navigate("/(app)/(tabs)/search/products");
            }}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              flex: 1,
            }}
          >
            <Image
              source={item.image ? item.image.url : Placeholder.uri}
              style={{
                height: 60,
                width: 60,
                borderRadius: 100,
              }}
            />

            <Headline size="small" ellipsizeMode="tail" numberOfLines={1}>
              {item.name}
            </Headline>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
