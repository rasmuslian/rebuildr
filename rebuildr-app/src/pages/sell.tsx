import { useMutation, useQuery } from "@apollo/client";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { gql } from "src/apollo/__generated__";
import { Button } from "src/components/button";
import { Input } from "src/components/inputs/input";
import { Page } from "src/components/page";
import { Picker } from "@react-native-picker/picker";
import { Text } from "../components/text";

const GET_ALL_CATEGORIES = gql(`
  query GetCategories {
    getCategories {
      id
      name
      parentId
    }
  }
`);

const CREATE_PRODUCT = gql(`
  mutation CreateProduct($input: CreateProductInput!) {
    createProduct(input: $input) {
      title
      category {
        name
      }
    }
  }
`);

interface Category {
  id: string;
  name: string;
  parentId?: string;
}

export const Sell = () => {
  const [title, setTitle] = useState("");
  const [categories, setCategories] = useState<
    (Category & { children: Category[] })[]
  >([]);
  const [selectedRootCategory, setSelectedRootCategory] = useState<
    Category & { children: Category[] }
  >();
  const [selectedChildCategory, setSelectedChildCategory] =
    useState<Category>();
  const [createdProduct, setCreatedProduct] = useState<{
    title: string;
    category: { name: string };
  }>();

  useQuery(GET_ALL_CATEGORIES, {
    onCompleted: (data) => {
      const rootCategories = data.getCategories.reduce(
        (
          _rootCategories: {
            id: string;
            name: string;
            parentId?: string;
          }[],
          cat,
        ) => {
          if (!cat.parentId) {
            return [..._rootCategories, cat];
          }
          return _rootCategories;
        },
        [],
      );

      const _categories = rootCategories.map((root) => {
        const children = data.getCategories.reduce(
          (
            _children: {
              id: string;
              name: string;
              parentId?: string;
            }[],
            cat,
          ) => {
            if (cat.parentId === root.id) {
              return [..._children, cat];
            }
            return _children;
          },
          [],
        );
        return {
          ...root,
          children: children,
        };
      });

      setCategories(_categories);
    },
  });

  const [createProduct, { loading: creatingProduct }] =
    useMutation(CREATE_PRODUCT);

  const onPublish = () => {
    if (creatingProduct) {
      return;
    }

    const category = selectedChildCategory ?? selectedRootCategory;

    if (!category || !title) {
      //Invalid inputs!
      return;
    }

    createProduct({
      variables: {
        input: {
          title: title,
          categoryId: category.id,
        },
      },
      onCompleted: (data) => {
        setCreatedProduct(data.createProduct);

        //reset
        setTitle("");
        setSelectedChildCategory(undefined);
        setSelectedRootCategory(undefined);
      },
    });
  };

  if (createdProduct) {
    return (
      <Page title={"Vara skapad!"}>
        <Text>title: {createdProduct.title}</Text>
        <Text>category: {createdProduct.category.name}</Text>
        <Button
          title="Skapa en till"
          onPress={() => setCreatedProduct(undefined)}
        />
      </Page>
    );
  }

  return (
    <Page title={"Vad vill du sälja?"}>
      <View style={styles.formContainer}>
        <Picker
          selectedValue={selectedRootCategory?.id}
          onValueChange={(v) => {
            const selectedCategory = categories.find((cat) => cat.id === v);
            setSelectedRootCategory(selectedCategory);
          }}
        >
          <Picker.Item
            key={"kategori"}
            label={"Välj en kategori"}
            value={"unselected"}
          />
          {categories.map((cat) => (
            <Picker.Item key={cat.id} label={cat.name} value={cat.id} />
          ))}
        </Picker>
        <Picker
          selectedValue={selectedChildCategory?.id}
          onValueChange={(v) => {
            const selectedCategory = selectedRootCategory.children.find(
              (cat) => cat.id === v,
            );
            setSelectedChildCategory(selectedCategory);
          }}
          enabled={!!selectedRootCategory}
        >
          <Picker.Item
            key={"underkategori"}
            label={"Välj en underkategori"}
            value={"unselected"}
          />
          {selectedRootCategory?.children.map((cat) => (
            <Picker.Item key={cat.id} label={cat.name} value={cat.id} />
          ))}
        </Picker>
        <Input
          onChange={setTitle}
          placeholder={"Titel på objektet"}
          value={title}
        />
        <Button
          title="Publicera"
          onPress={onPublish}
          disabled={creatingProduct}
        />
      </View>
    </Page>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    borderColor: "#000",
    borderRadius: 20,
    borderWidth: 1,
    gap: 10,
    padding: 20,
  },
});
