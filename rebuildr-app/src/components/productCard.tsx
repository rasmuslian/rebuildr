import { useNavigation } from "@react-navigation/native";
import React from "react";
import { Pressable, View, Image, ImageStyle } from "react-native";
import Colors from "src/styles/colors";
import { Body, Title } from "./texts/text";
import { formatMetersToKm } from "src/utils/distanceHandling";
import { Icon } from "./icons/icon";
import { useResponsiveStyles } from "src/hooks/useResponsiveStyles";
import { gql } from "src/gql";
import { useMutation } from "@apollo/client";

const LIKE_PRODUCT = gql(`
  mutation LikeProduct($input: SetLikeProductInput!) {
    setLikeProduct(input: $input) {
      id
      likedByUser
    }
  }
  `);

interface ProductCardProps {
  id: string;
  title: string;
  description?: string;
  price: number;
  isGiveaway: boolean;
  address: string;
  mainImage?: { presignedGetUrl: string };
  user: { username: string };
  distance?: number;
  liked?: boolean;
}

export const ProductCard = ({
  id,
  title,
  description,
  price,
  isGiveaway,
  address,
  user,
  mainImage,
  distance,
  liked,
}: ProductCardProps) => {
  const { navigate } = useNavigation();
  const styles = useResponsiveStyles(responsiveStyles);

  const [likeProduct] = useMutation(LIKE_PRODUCT);

  return (
    <Pressable onPress={() => navigate("ProductDetails", { productId: id })}>
      <View style={styles.container}>
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
            <Icon icon="CrossHair" />
            <Body style={styles.distance}>{formatMetersToKm(distance)} km</Body>
          </View>
        )}
        {liked !== undefined && (
          <View style={styles.likeContainer}>
            <Pressable
              onPress={() =>
                likeProduct({
                  variables: { input: { id: id, like: !liked } },
                })
              }
            >
              <Body color="white">{liked ? "Gillad" : "Ogillad"}</Body>
            </Pressable>
          </View>
        )}
        <View style={styles.lowerContainer}>
          <View style={styles.textContainer}>
            <Title style={styles.title}>{title}</Title>
            <Body color="pale" style={styles.description} numberOfLines={2}>
              {description}
            </Body>
            <Body numberOfLines={1} color="pale">
              Säljare: {user.username}
            </Body>
            <Body numberOfLines={1} color="pale">
              Plats: {address}
            </Body>
          </View>
          <View style={styles.priceContainer}>
            {isGiveaway ? (
              <Title>Skänkes</Title>
            ) : (
              <>
                <Title style={styles.hideOnSmall}>Pris: </Title>
                <Title>{price} Kr</Title>
              </>
            )}
          </View>
        </View>
      </View>
    </Pressable>
  );
};

const responsiveStyles = {
  container: {
    width: 302,
    small: {
      width: 222,
    },
    mobile: {
      width: 146,
    },
  },
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
    small: {
      height: 182,
    },
    mobile: {
      height: 126,
    },
  },
  noImage: {
    height: 261,
    backgroundColor: Colors.inactiveGray,
    justifyContent: "center",
    alignItems: "center",
    small: {
      height: 182,
    },
    mobile: {
      height: 126,
    },
  },
  distanceContainer: {
    position: "absolute",
    top: 16,
    left: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.white3,
    opacity: 0.9,
    paddingVertical: 6,
    paddingHorizontal: 11,
    borderRadius: 8,
    small: {
      display: "none",
    },
  },
  likeContainer: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: Colors.charcoal,
    opacity: 0.6,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 11,
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
    backgroundColor: Colors.white,
  },
  textContainer: {
    paddingHorizontal: 16,
    flex: 1,
    mobile: {
      paddingHorizontal: 8,
    },
  },
  title: {
    minHeight: 65,
    small: {
      fontFamily: "Poppins-Medium",
      minHeight: 42,
    },
    mobile: {
      minHeight: 35,
    },
  },
  description: {
    minHeight: 42,
    marginBottom: 10,
    small: {
      minHeight: 35,
      marginBottom: 2,
    },
    mobile: {
      minHeight: 25,
    },
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
    flexDirection: "row",
  },
  hideOnSmall: {
    small: {
      display: "none",
    },
  },
} as const;
