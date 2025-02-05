import { useLazyQuery } from "@apollo/client";
import { useNavigation } from "@react-navigation/native";
import { useEffect } from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";
import { Button } from "src/components/button";
import { Icon } from "src/components/icons-old/icon";
import { ProductCard } from "src/components/productCard";
import { Body } from "src/components/texts/text";
import { gql } from "src/gql";
import { OrderProductsEnum } from "src/gql/graphql";
import { useResponsiveStyles } from "src/hooks/useResponsiveStyles";
import { formatMetersToKm } from "src/utils/distanceHandling";
import * as Location from "expo-location";

const RELEVANT_PRODUCTS_QUERY = gql(`
  query RelevantProductsQuery($input: ProductsInput!, $limit: Int) {
    products(input: $input, limit: $limit) {
      products {
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
  }
`);

export const RelevantProducts = () => {
  const { navigate } = useNavigation();
  const styles = useResponsiveStyles(responsiveStyles);

  const [fetchRelevantProducts, { data, error, loading }] = useLazyQuery(
    RELEVANT_PRODUCTS_QUERY,
  );

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        fetchRelevantProducts({
          variables: { input: { orderBy: OrderProductsEnum.Latest }, limit: 6 },
        });
        return;
      }
      const position = await Location.getCurrentPositionAsync();
      fetchRelevantProducts({
        variables: {
          input: {
            orderBy: OrderProductsEnum.Distance,
            location: {
              longitude: position.coords.longitude,
              latitude: position.coords.latitude,
            },
          },
          limit: 6,
        },
      });
    })();
  }, [fetchRelevantProducts]);

  const renderProducts = () => {
    return data?.products.products.map((product, i) => (
      <View key={i}>
        <ProductCard
          {...product}
          distance={product.distanceFromPosition}
          liked={product.likedByUser}
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
