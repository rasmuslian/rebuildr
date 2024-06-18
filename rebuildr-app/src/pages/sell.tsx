import { useMutation, useQuery } from "@apollo/client";
import React, { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { gql } from "src/gql";
import { Button } from "src/components/button";
import { Input } from "src/components/inputs/input";
import { Page } from "src/components/page";
import { Picker } from "@react-native-picker/picker";
import { Text } from "../components/text";
import { NumberInput } from "src/components/inputs/numberInput";

const SELL_QUERY = gql(`
  query SellQuery {
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
      price
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
  const [selectedRootCategory, setSelectedRootCategory] = useState<
    Category & { children: Category[] }
  >();
  const [selectedChildCategory, setSelectedChildCategory] =
    useState<Category>();
  const [price, setPrice] = useState("");
  const [createdProduct, setCreatedProduct] = useState<{
    title: string;
    category: { name: string };
    price: number;
  }>();

  const { data } = useQuery(SELL_QUERY);

  const [createProduct, { loading: creatingProduct }] =
    useMutation(CREATE_PRODUCT);

  const categories: (Category & { children: Category[] })[] = useMemo(() => {
    if (!data) {
      return [];
    }
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

    return rootCategories.map((root) => {
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
  }, [data]);

  const onPublish = () => {
    if (creatingProduct) {
      return;
    }

    const category = selectedChildCategory ?? selectedRootCategory;

    if (!category || !title || price === undefined) {
      //Invalid inputs!
      return;
    }

    const transformedValue = price.replace(",", ".");
    const toFloat = parseFloat(transformedValue);
    if (isNaN(toFloat)) {
      //invalid number
      return;
    }

    createProduct({
      variables: {
        input: {
          title: title,
          categoryId: category.id,
          price: toFloat,
        },
      },
      onCompleted: (data) => {
        setCreatedProduct(data.createProduct);

        //reset
        setTitle("");
        setSelectedChildCategory(undefined);
        setSelectedRootCategory(undefined);
        setPrice(undefined);
      },
    });
  };

  if (createdProduct) {
    return (
      <Page title={"Vara skapad!"}>
        <Text>title: {createdProduct.title}</Text>
        <Text>category: {createdProduct.category.name}</Text>
        <Text>
          price: {createdProduct.price.toString().replace(".", ",")} kr
        </Text>
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
        <NumberInput
          onChange={setPrice}
          value={price}
          placeholder={"Ange pris"}
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
