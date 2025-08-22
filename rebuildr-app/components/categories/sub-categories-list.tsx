import {
  View,
  TouchableOpacity,
  Image,
  useWindowDimensions,
} from "react-native";
import { useQuery } from "@apollo/client";
import React from "react";
import { SubCategoriesQuery, SubCategoriesQueryVariables } from "@/gql/graphql";
import { SUB_CATEGORIES } from "@/queries";
import { Display, Body, Label } from "@components/typography/text";
import Placeholder from "@assets/images/placeholder.png";
import { Divider } from "@components/dividers/divider";
import { useFilterProduct } from "@hooks/useFilterProduct";
import { router } from "expo-router";

type Props = {
  id: string;
};

export function SubCategoriesList({ id }: Props) {
  const { setCategories } = useFilterProduct();
  const { width: screenWidth } = useWindowDimensions();
  const width = (screenWidth - 56) / 3;

  const { data } = useQuery<SubCategoriesQuery, SubCategoriesQueryVariables>(
    SUB_CATEGORIES,
    {
      variables: {
        categoryInput: { id: id },
        getCategoriesInput: { parentIds: [id] },
      },
    },
  );

  const category = data?.category;
  const subCategories = data?.getCategories ?? [];

  return (
    <View style={{ marginBottom: 24, gap: 24 }}>
      <View style={{ gap: 16 }}>
        <Display size="small">{category?.name}</Display>
        <Body size="large">{category?.description}</Body>
      </View>

      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          rowGap: 24,
          columnGap: 8,
          display: subCategories.length > 1 ? "flex" : "none",
        }}
      >
        {subCategories.map(({ id, name, image }) => (
          <TouchableOpacity
            key={id}
            style={{
              width,
              alignItems: "center",
              gap: 8,
            }}
            onPress={() => {
              setCategories([id]);
              router.navigate({
                pathname: "/(app)/(tabs)/search/products",
                params: { selectedCategoryId: id },
              });
            }}
          >
            <Image
              source={image?.url ?? Placeholder.uri}
              style={{
                height: 80,
                width: 80,
                borderRadius: 100,
              }}
            />

            <Label size="small" style={{ textAlign: "center" }}>
              {name}
            </Label>
          </TouchableOpacity>
        ))}
      </View>

      <Divider />
    </View>
  );
}
