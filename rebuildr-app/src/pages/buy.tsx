import { useQuery } from "@apollo/client";
import React from "react";
import { View, StyleSheet } from "react-native";
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
  const { data } = useQuery(BUY_QUERY);

  return (
    <Page title="Köp">
      <View style={styles.productsContainer}>
        {data?.products.map((p) => (
          <View key={p.id} style={styles.card}>
            <Text style={textStyles.title}>{p.title}</Text>
            <Text>{p.price} kr</Text>
          </View>
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
