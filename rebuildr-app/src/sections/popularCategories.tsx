import { useNavigation } from "@react-navigation/native";
import { Pressable, View, Image, StyleSheet, ScrollView } from "react-native";
import { Body } from "src/components/texts/text";
import { useResponsiveStyles } from "src/hooks/useResponsiveStyles";
import Colors from "src/styles/colors";

interface PopularCategoriesProps {
  categories: {
    id: string;
    name: string;
    icon?: { __typename?: "File"; id: string; presignedGetUrl: string } | null;
  }[];
}

export const PopularCategories = ({ categories }: PopularCategoriesProps) => {
  const { navigate } = useNavigation();
  const style = useResponsiveStyles(styles);

  const renderCategories = () => {
    return categories.map((c, i) => (
      <Pressable
        key={i}
        onPress={() =>
          navigate("Products", {
            categoryId: c.id,
          })
        }
      >
        <View style={styles.card}>
          <View style={styles.leftCard}>
            {c.icon ? (
              <Image
                source={{ uri: c.icon.presignedGetUrl }}
                style={styles.image}
              />
            ) : (
              <Body style={styles.noImage}>N/A</Body>
            )}
          </View>
          <Body style={styles.name}>{c.name}</Body>
        </View>
      </Pressable>
    ));
  };

  return (
    <>
      {/* {Mobile view} */}
      <ScrollView horizontal style={style.scrollContainer}>
        <View style={[styles.container, { maxWidth: 2000 }]}>
          {renderCategories()}
        </View>
      </ScrollView>

      {/* desktop view */}
      <View style={[styles.container, style.noScrollContainer]}>
        {renderCategories()}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    display: "none",
    small: {
      display: undefined,
    },
  },
  noScrollContainer: {
    small: {
      display: "none",
    },
  },
  container: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  card: {
    borderWidth: 1,
    borderColor: Colors.borderGray,
    display: "flex",
    flexDirection: "row",
    borderRadius: 8,
  },
  leftCard: {
    borderRightWidth: 1,
    borderColor: Colors.borderGray,
    justifyContent: "center",
    minWidth: 65,
  },
  image: {
    height: "100%",
  },
  noImage: { textAlign: "center" },
  name: { marginVertical: 20, marginHorizontal: 16 },
});
