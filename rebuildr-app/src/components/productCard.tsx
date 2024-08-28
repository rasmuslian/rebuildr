import { useNavigation } from "@react-navigation/native";
import React from "react";
import { Pressable, View, Image, StyleSheet } from "react-native";
import Colors from "src/styles/colors";
import { Body, Title } from "./texts/text";

interface ProductCardProps {
  id: string;
  title: string;
  description?: string;
  price: number;
  address: string;
  mainImage?: { presignedGetUrl };
  user: { email: string };
}

export const ProductCard = ({
  id,
  title,
  description,
  price,
  address,
  user,
  mainImage,
}: ProductCardProps) => {
  const { navigate } = useNavigation();
  return (
    <Pressable onPress={() => navigate("ProductDetails", { productId: id })}>
      {mainImage ? (
        <Image
          source={mainImage.presignedGetUrl}
          style={[styles.upperContainer, styles.image]}
        />
      ) : (
        <View style={[styles.upperContainer, styles.noImage]}>
          <Body>Bild saknas</Body>
        </View>
      )}
      <View style={styles.lowerContainer}>
        <View style={styles.textContainer}>
          <Title>{title}</Title>
          <Body color="pale" style={styles.description} numberOfLines={3}>
            {description}
          </Body>
          <Body color="pale">Säljare: {user.email}</Body>
          <Body color="pale">Plats: {address}</Body>
        </View>
        <View style={styles.priceContainer}>
          <Title style={styles.price}>Pris: {price} Kr</Title>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  upperContainer: {
    borderColor: Colors.borderGray,
    borderWidth: 1,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderStyle: "solid",
  },
  image: {
    height: 261,
  },
  noImage: {
    height: 261,
    backgroundColor: Colors.inactiveGray,
    justifyContent: "center",
    alignItems: "center",
  },
  lowerContainer: {
    borderColor: Colors.borderGray,
    borderWidth: 1,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    borderStyle: "solid",
    flex: 1,
  },
  textContainer: {
    paddingHorizontal: 16,
    flex: 1,
  },
  description: {
    minHeight: 65,
    marginBottom: 10,
  },
  divider: {
    borderColor: Colors.borderGray,
    borderWidth: 0.5,
    borderStyle: "solid",
    marginVertical: 10,
  },
  priceContainer: {
    // height: 42,
    borderColor: Colors.borderGray,
    borderTopWidth: 0.5,
    borderStyle: "solid",
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginTop: 10,
  },
  price: {
    // marginBottom: 10,
    // paddingHorizontal: 16,
  },
});
