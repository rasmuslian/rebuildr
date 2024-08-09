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
      children {
        id
        name
        inSelection
      }
    }
  }
`);

const UPDATE_CATEGORY = gql(`
  mutation UpdateCategory($input: UpdateCategoryInput!) {
    updateCategory(input: $input) {
      id
      name
      inSelection
    }
  }
  `);

export const EditCategories = () => {
  const { data, loading } = useQuery(EDIT_CATEGORIES_QUERY);
  const [updateCategory] = useMutation(UPDATE_CATEGORY);

  const onPressSelected = (category: {
    id: string;
    name: string;
    inSelection: string;
  }) => {
    updateCategory({
      variables: {
        input: { id: category.id, inSelection: !category.inSelection },
      },
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
          <Body>Namn</Body>
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
        <View style={{ flex: 1, alignSelf: "stretch" }}>
          <Body>Utvalda</Body>
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
      </View>
    </Page>
  );
};

const styles = StyleSheet.create({
  tableContainer: {
    flexDirection: "row",
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
