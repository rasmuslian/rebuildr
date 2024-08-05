import { useQuery } from "@apollo/client";
import { useNavigation } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";
import { ActivityIndicator, View, Image, StyleSheet } from "react-native";
import { Page } from "src/components/page";
import { LandingStackParamList } from "src/navigators/navigation.types";
import { gql } from "src/gql";
import { Body } from "src/components/texts/text";
import { Button } from "src/components/button";
import { isLoggedInVar } from "src/apollo/apollo";

const PRODUCT_DETAILS_QUERY = gql(`
  query ProductDetails($input: GetProductInput!) {
    product(input: $input) {
      id
      title
      price
      address
      images {
        presignedGetUrl
      }
      user {
        id
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

  const { data } = useQuery(PRODUCT_DETAILS_QUERY, {
    variables: { input: { id: route.params.productId } },
  });

  if (!data) {
    return <ActivityIndicator size="large" />;
  }

  return (
    <Page title={data.product.title}>
      <View style={styles.imagesContainer}>
        {data.product.images.length ? (
          data.product.images.map((img) => (
            <View style={styles.imageContainer}>
              <Image
                alt="Beskrivande bild av produkten"
                resizeMode="contain"
                style={styles.image}
                defaultSource={{ uri: "../../assets/images/logo.png" }}
                source={{ uri: img.presignedGetUrl }}
              />
            </View>
          ))
        ) : (
          <Body>-- Inga bilder att visa -- </Body>
        )}
      </View>
      <Body>Pris {data.product.price} kr</Body>
      <Body>Kategori: {data.product.category.name}</Body>
      <Body>Produkten finns på adressen: {data.product.address}</Body>
      <Body>Säljare {data.product.user.email}</Body>
      {isLoggedInVar() && (
        <Button
          onPress={() =>
            navigation.navigate("Conversation", {
              otherUserId: data.product.user.id,
              productId: data.product.id,
            })
          }
          title="Skicka meddelande"
        />
      )}
    </Page>
  );
};

const styles = StyleSheet.create({
  imagesContainer: {
    marginBottom: 40,
    gap: 10,
  },
  imageContainer: {
    borderStyle: "solid",
    borderColor: "#000",
    borderRadius: 5,
    borderWidth: 1,
  },
  image: {
    height: 120,
    width: 300,
    borderRadius: 5,
  },
});
