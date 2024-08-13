import { useMutation, useQuery } from "@apollo/client";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Button } from "src/components/button";
import { Page } from "src/components/page";
import { Body } from "src/components/texts/text";
import { gql } from "src/gql";
import Colors from "src/styles/colors";

const EDIT_CATEGORIES_QUERY = gql(`
  query EditCategoriesQuery {
    rootCategories {
      id
      name
      inSelection
      inSeason
      children {
        id
        name
        inSelection
        inSeason
      }
    }
  }
`);

const UPDATE_CATEGORY = gql(`
  mutation UpdateCategory($input: UpdateCategoryInput!) {
    updateCategory(input: $input) {
      id
      inSelection
      inSeason
    }
  }
  `);

export const EditCategories = () => {
  const { data, loading } = useQuery(EDIT_CATEGORIES_QUERY);
  const [updateCategory] = useMutation(UPDATE_CATEGORY);

  const onPressSelected = (category: {
    id: string;
    name: string;
    inSelection: boolean;
  }) => {
    updateCategory({
      variables: {
        input: { id: category.id, inSelection: !category.inSelection },
      },
    });
  };
  const onPressSeasonal = (category: { id: string; inSeason: boolean }) => {
    updateCategory({
      variables: { input: { id: category.id, inSeason: !category.inSeason } },
    });
  };

  const flatCategories =
    data?.rootCategories.reduce((acc, current) => {
      const root = { ...current };
      delete root.children;
      return [...acc, root, ...current.children];
    }, []) ?? [];

  return (
    <Page title="Redigera kategorierna" loading={loading}>
      <View style={styles.tableContainer}>
        <View>
          <Body style={styles.header}>Namn</Body>
          {data?.rootCategories.map((rootCategory, i) => (
            <View key={i} style={styles.familyContainer}>
              <View style={styles.parentRow}>
                <Body color="white">{rootCategory.name}</Body>
              </View>
              {rootCategory.children.map((child, j) => (
                <View style={styles.childRow} key={j}>
                  <Body>{child.name}</Body>
                </View>
              ))}
            </View>
          ))}
        </View>
        <View style={{ alignSelf: "stretch" }}>
          <Body style={styles.header}>Utvalda</Body>
          <View style={{ flex: 1, justifyContent: "space-between" }}>
            {flatCategories.map((category, i) => (
              <Button
                key={category.id}
                onPress={() => onPressSelected(category)}
                backgroundColor={!!category.inSelection ? "purple" : undefined}
              />
            ))}
          </View>
        </View>
        <View style={{ alignSelf: "stretch" }}>
          <Body style={styles.header}>Säsong</Body>
          <View style={{ flex: 1, justifyContent: "space-between" }}>
            {flatCategories.map((category, i) => (
              <Button
                key={category.id}
                onPress={() => onPressSeasonal(category)}
                backgroundColor={!!category.inSeason ? "purple" : undefined}
              />
            ))}
          </View>
        </View>
      </View>
    </Page>
  );
};

const styles = StyleSheet.create({
  tableContainer: {
    flexDirection: "row",
    gap: 10,
  },
  header: {
    marginBottom: 10,
  },
  familyContainer: {
    display: "flex",
  },
  parentRow: {
    borderStyle: "solid",
    borderColor: "#000",
    borderWidth: 1,
    backgroundColor: Colors.green,
    padding: 4,
  },
  childRow: {
    borderStyle: "solid",
    borderColor: "#000",
    borderWidth: 1,
    backgroundColor: Colors.brand,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
});
