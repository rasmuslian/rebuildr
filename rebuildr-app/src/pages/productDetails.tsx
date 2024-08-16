import { useMutation, useQuery, useReactiveVar } from "@apollo/client";
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
import { UserRoleEnum } from "src/gql/graphql";
import Colors from "src/styles/colors";
import { conditionTranslationMap } from "src/constants/constants";

const PRODUCT_DETAILS_QUERY = gql(`
  query ProductDetails($input: GetProductInput!, $isLoggedIn: Boolean!) {
    product(input: $input) {
      id
      title
      price
      address
      hiddenReason
      make
      amount
      dimensions
      condition
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
    me @include(if: $isLoggedIn) {
      id
      role
    }
  }
`);

const DELETE_PRODUCT = gql(`
  mutation DeleteProduct($input: DeleteProductInput!) {
    deleteProduct(input: $input) {
      title
    }
  }
  `);

const HIDE_PRODUCT = gql(`
  mutation HideProduct($input: HideProductInput!) {
    hideProduct(input: $input) {
      id
    }
  }
  `);
const SHOW_PRODUCT = gql(`
  mutation ShowProduct($input: ShowProductInput!) {
    showProduct(input: $input) {
      id
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
  const isLoggedIn = useReactiveVar(isLoggedInVar);

  const { data, refetch } = useQuery(PRODUCT_DETAILS_QUERY, {
    variables: { input: { id: route.params.productId }, isLoggedIn },
  });
  const [deleteProduct, { loading: deleting, error: deleteError }] =
    useMutation(DELETE_PRODUCT, {
      variables: { input: { id: route.params.productId } },
      onCompleted: () =>
        navigation.canGoBack()
          ? navigation.goBack()
          : navigation.navigate("Landing"),
    });
  const [hideProduct] = useMutation(HIDE_PRODUCT);
  const [showProduct] = useMutation(SHOW_PRODUCT, {
    variables: { input: { id: route.params.productId } },
    onCompleted: () => refetch(),
  });

  const onHideProduct = (reason: string) => {
    hideProduct({
      variables: { input: { id: route.params.productId, reason } },
      onCompleted: () => refetch(),
    });
  };

  if (!data || deleting) {
    return <ActivityIndicator size="large" />;
  }

  return (
    <Page
      title={`${data.product.title}${data.product.hiddenReason ? "(dold)" : ""}`}
    >
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
      <Body>Fabrikat: {data.product.make || "Ej angett"}</Body>
      <Body>Antal: {data.product.amount || "Ej angett"}</Body>
      <Body>Mått: {data.product.dimensions || "Ej angett"}</Body>
      <Body>Skick: {conditionTranslationMap[data.product.condition]}</Body>
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
      {data.me?.role === UserRoleEnum.Admin && (
        <View style={styles.adminContainer}>
          <Body>Adminåtgärder</Body>
          <View style={styles.buttonsContainer}>
            {data.product.hiddenReason ? (
              <Button onPress={showProduct} title="Visa produkt" />
            ) : (
              <Button
                onPress={() => onHideProduct("Olämplig")}
                title="Dölj vara"
              />
            )}
            <Button
              onPress={deleteProduct}
              title="Ta bort vara"
              backgroundColor="red"
              titleColor="white"
            />
            {deleteError && (
              <Body>Något gick fel när varan skulle tas bort</Body>
            )}
          </View>
        </View>
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
  adminContainer: {
    marginTop: 40,
    padding: 16,
    borderBottomWidth: 2,
    borderTopWidth: 2,
    borderColor: Colors.borderGray,
    borderStyle: "solid",
    gap: 10,
    alignItems: "center",
  },
  buttonsContainer: {
    flexDirection: "row",
    gap: 10,
  },
});
