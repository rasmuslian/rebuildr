import { useNavigation } from "@react-navigation/native";
import { ScrollView, View } from "react-native";
import { Button } from "src/components/button";
import { Icon } from "src/components/icons/icon";
import { ProductCard } from "src/components/productCard";
import { Body } from "src/components/texts/text";
import { NearbyProductsQueryQuery } from "src/gql/graphql";
import { useResponsiveStyles } from "src/hooks/useResponsiveStyles";
import { formatMetersToKm } from "src/utils/distanceHandling";

interface RelevantProductsProps {
  products: NearbyProductsQueryQuery["products"];
}

export const RelevantProducts = ({ products }: RelevantProductsProps) => {
  const { navigate } = useNavigation();
  const styles = useResponsiveStyles(responsiveStyles);

  const renderProducts = () => {
    return products.map((product, i) => (
      <View key={i}>
        <ProductCard {...product} distance={product.distanceFromPosition} />
        {product.distanceFromPosition && (
          <View style={styles.distanceContainer}>
            <Body>Avstånd från</Body>
            <Icon iconType="CrossHair" />
            <Body style={styles.distance}>
              {formatMetersToKm(product.distanceFromPosition)} km
            </Body>
          </View>
        )}
      </View>
    ));
  };

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
