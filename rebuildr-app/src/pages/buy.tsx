import { useQuery } from "@apollo/client";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Button } from "src/components/button";
import { Page } from "src/components/page";
import { Text, textStyles } from "src/components/text";
import { gql } from "src/gql";

const BUY_QUERY = gql(
  `
    query BuyQuery {
      products {
        id
        title
        price
      }
    }
  `,
);

export const Buy = () => {
  const { navigate } = useNavigation();
  const { data } = useQuery(BUY_QUERY);

  return (
    <Page title="Köp">
      <View style={styles.productsContainer}>
        {data?.products.map((p) => (
          <Pressable
            key={p.id}
            style={styles.card}
            onPress={() => navigate("ProductDetails", { productId: p.id })}
          >
            <Text style={textStyles.title}>{p.title}</Text>
            <Text>{p.price} kr</Text>
          </Pressable>
        ))}
      </View>
      <Button onPress={() => console.log("hej")}>
        <Text>Visa fler</Text>
      </Button>
    </Page>
  );
};

const styles = StyleSheet.create({
  productsContainer: {
    display: "flex",
    flexDirection: "row",
    width: 360, //Roughly size of two products
    flexWrap: "wrap",
    gap: 4,
    justifyContent: "center",
    marginBottom: 12,
  },
  card: {
    width: 168, //size of one product,
    padding: 4,
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 5,
    borderStyle: "solid",
  },
});
