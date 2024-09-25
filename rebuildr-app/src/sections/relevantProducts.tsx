import { useLazyQuery, useMutation } from "@apollo/client";
import { useNavigation } from "@react-navigation/native";
import { useEffect } from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";
import { Button } from "src/components/button";
import { Icon } from "src/components/icons/icon";
import { ProductCard } from "src/components/productCard";
import { Body } from "src/components/texts/text";
import { gql } from "src/gql";
import { OrderProductsEnum } from "src/gql/graphql";
import { useResponsiveStyles } from "src/hooks/useResponsiveStyles";
import { formatMetersToKm } from "src/utils/distanceHandling";
import * as Location from "expo-location";

const RELEVANT_PRODUCTS_QUERY = gql(`
  query RelevantProductsQuery($input: ProductsInput!) {
    products(input: $input) {
      id
      title
      description
      distanceFromPosition
      likedByUser
      user {
        id
        username
      }
      address
      price
      isGiveaway
      mainImage {
        presignedGetUrl
      }
    } 
  }
  `);

const LIKE_PRODUCT = gql(`
  mutation LikeProduct($input: SetLikeProductInput!) {
    setLikeProduct(input: $input) {
      id
      likedByUser
    }
  }
  `);

export const RelevantProducts = () => {
  const { navigate } = useNavigation();
  const styles = useResponsiveStyles(responsiveStyles);

  const [likeProduct] = useMutation(LIKE_PRODUCT);
  const [fetchRelevantProducts, { data, error, loading }] = useLazyQuery(
    RELEVANT_PRODUCTS_QUERY,
  );

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        fetchRelevantProducts({
          variables: { input: { limit: 6, orderBy: OrderProductsEnum.Latest } },
        });
        return;
      }
      const position = await Location.getCurrentPositionAsync();
      fetchRelevantProducts({
        variables: {
          input: {
            limit: 6,
            orderBy: OrderProductsEnum.Distance,
            location: {
              longitude: position.coords.longitude,
              latitude: position.coords.latitude,
            },
          },
        },
      });
    })();
  }, [fetchRelevantProducts]);

  const renderProducts = () => {
    return data?.products.map((product, i) => (
      <View key={i}>
        <ProductCard
          {...product}
          distance={product.distanceFromPosition}
          liked={product.likedByUser}
          onLike={() =>
            likeProduct({
              variables: {
                input: { id: product.id, like: !product.likedByUser },
              },
            })
          }
        />
        {product.distanceFromPosition && (
          <View style={styles.distanceContainer}>
            <Body>Avstånd från</Body>
            <Icon icon="CrossHair" />
            <Body style={styles.distance}>
              {formatMetersToKm(product.distanceFromPosition)} km
            </Body>
          </View>
        )}
      </View>
    ));
  };

  if (loading) {
    return <ActivityIndicator size="large" />;
  }

  if (error) {
    return <Body>Något gick fel vid inladdning av annonser</Body>;
  }

  return (
    <View>
      <ScrollView horizontal contentContainerStyle={styles.container}>
        {renderProducts()}
      </ScrollView>
      <Button
        title="Se fler"
        onPress={() => navigate("Products")}
        style={styles.button}
      />
    </View>
  );
};

const responsiveStyles = {
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 24,
  },
  noScrollContainer: {
    medium: {
      display: "none",
    },
  },
  distanceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    marginTop: 6,
    display: "none",
    small: {
      display: undefined,
    },
  },
  distance: { marginTop: 1 },
  button: {
    alignSelf: "flex-end",
    marginTop: 24,
    small: {
      display: "none",
    },
  },
} as const;
