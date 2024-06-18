import { useQuery } from "@apollo/client";
import { useNavigation } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";
import { ActivityIndicator } from "react-native";
import { Page } from "src/components/page";
import { LandingStackParamList } from "src/navigators/navigation.types";
import { Text } from "src/components/text";
import { gql } from "src/gql";

const DETAILED_PRODUCT_QUERY = gql(`
  query DetailedProduct($input: GetProductInput!) {
    product(input: $input) {
      title
      price
      user {
        email
      }
      category {
        name
      }
    }
  }
`);

export const ProductDetails = ({
  route,
}: NativeStackScreenProps<LandingStackParamList, "ProductDetails">) => {
  const navigation = useNavigation();
  if (!route.params) {
    navigation.goBack();
  }

  const { data } = useQuery(DETAILED_PRODUCT_QUERY, {
    variables: { input: { id: route.params.productId } },
  });

  if (!data) {
    return <ActivityIndicator size="large" />;
  }
  return (
    <Page title={data.product.title}>
      <Text>Pris {data.product.price} kr</Text>
      <Text>Kategori {data.product.category.name}</Text>
      <Text>Säljare {data.product.user.email}</Text>
    </Page>
  );
};
