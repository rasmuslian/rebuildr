import { useNavigation } from "@react-navigation/native";
import React from "react";
import { Pressable, View, Image, ImageStyle } from "react-native";
import Colors from "src/styles/colors";
import { Body, Title } from "./texts/text";
import { formatMetersToKm } from "src/utils/distanceHandling";
import { Icon } from "./icons/icon";
import { useResponsiveStyles } from "src/hooks/useResponsiveStyles";

interface ProductCardProps {
  id: string;
  title: string;
  description?: string;
  price: number;
  address: string;
  mainImage?: { presignedGetUrl: string };
  user: { email: string };
  distance?: number;
}

export const ProductCard = ({
  id,
  title,
  description,
  price,
  address,
  user,
  mainImage,
  distance,
}: ProductCardProps) => {
  const { navigate } = useNavigation();
  const styles = useResponsiveStyles(responsiveStyles);
  return (
    <Pressable onPress={() => navigate("ProductDetails", { productId: id })}>
      {mainImage ? (
        <Image
          source={{ uri: mainImage.presignedGetUrl }}
          style={[
            styles.upperContainer as ImageStyle,
            styles.image as ImageStyle,
          ]}
        />
      ) : (
        <View style={[styles.upperContainer, styles.noImage]}>
          <Body>Bild saknas</Body>
        </View>
      )}
      {distance && (
        <View style={styles.distanceContainer}>
          <Icon iconType="CrossHair" />
          <Body style={styles.distance}>{formatMetersToKm(distance)} km</Body>
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
          <Title>Pris: {price} Kr</Title>
        </View>
      </View>
    </Pressable>
  );
};

const responsiveStyles = {
  upperContainer: {
    borderColor: Colors.borderGray,
    borderWidth: 1,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderStyle: "solid",
    position: "relative",
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
  distanceContainer: {
    position: "absolute",
    top: 16,
    left: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.white2,
    opacity: 0.9,
    paddingVertical: 6,
    paddingHorizontal: 11,
    borderRadius: 8,
    small: {
      display: "none",
    },
  },
  distance: {
    marginTop: 1,
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
    borderColor: Colors.borderGray,
    borderTopWidth: 0.5,
    borderStyle: "solid",
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginTop: 10,
  },
} as const;
