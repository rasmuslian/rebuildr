import { useNavigation } from "@react-navigation/native";
import { ScrollView, View } from "react-native";
import { Button } from "src/components/button";
import { ProductCard } from "src/components/productCard";
import { useResponsiveStyles } from "src/hooks/useResponsiveStyles";

interface RelevantProductsProps {
  products: {
    id: string;
    title: string;
    description?: string | null;
    address: string;
    price: number;
    user: { __typename?: "User"; id: string; email: string };
    mainImage?: { __typename?: "File"; presignedGetUrl: string } | null;
  }[];
}

export const RelevantProducts = ({ products }: RelevantProductsProps) => {
  const { navigate } = useNavigation();
  const styles = useResponsiveStyles(responsiveStyles);
  return (
    <View>
      <View style={[styles.container, styles.noScrollContainer]}>
        {products.map((product, i) => (
          <View key={i} style={styles.cardContainer}>
            <ProductCard {...product} />
          </View>
        ))}
      </View>
      <ScrollView
        horizontal
        style={(styles.container, styles.scrollContainer)}
        contentContainerStyle={{ gap: 24 }}
      >
        {products.map((product, i) => (
          <View key={i} style={styles.cardContainer}>
            <ProductCard {...product} />
          </View>
        ))}
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
    marginBottom: 24,
  },
  scrollContainer: {
    display: "none",
    medium: {
      display: undefined,
    },
  },
  noScrollContainer: {
    medium: {
      display: "none",
    },
  },
  cardContainer: {
    flex: 1,
  },
  button: { alignSelf: "flex-end" },
} as const;
