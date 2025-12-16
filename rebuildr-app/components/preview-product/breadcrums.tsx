import { Category } from "@/gql/graphql";
import { Body } from "@components/typography/text";
import { useFilterProduct } from "@hooks/useFilterProduct";
import { router } from "expo-router";
import { Pressable, View } from "react-native";

type Props = {
  parentCategory?: Pick<Category, "id" | "name"> | null;
  category?: Pick<Category, "id" | "name"> | null;
};

export const Breadcrums = ({ parentCategory, category }: Props) => {
  const { filterBuilder } = useFilterProduct();
  const handlePress = (id?: string, parentId?: string) => {
    const categories = [{ id, parentId }] as Pick<
      Category,
      "id" | "parentId"
    >[];
    const builder = filterBuilder.setCategories(id ? categories : []);
    if (id) {
      builder.setSelectedCategoryId(id);
    }
    builder.apply();
    router.navigate("/search/products");
  };

  return (
    <View style={{ flexDirection: "row", gap: 4 }}>
      <Pressable onPress={() => handlePress()}>
        <Body size="medium" color="secondary">
          Alla varor
        </Body>
      </Pressable>
      {parentCategory && (
        <>
          <Body size="medium" color="secondary">
            /
          </Body>
          <Pressable onPress={() => handlePress(parentCategory.id)}>
            <Body size="medium" color="secondary">
              {parentCategory.name}
            </Body>
          </Pressable>
        </>
      )}
      {category && (
        <>
          <Body size="medium" color="secondary">
            /
          </Body>
          <Pressable
            onPress={() => handlePress(category.id, parentCategory?.id)}
          >
            <Body size="medium" color="secondary">
              {category.name}
            </Body>
          </Pressable>
        </>
      )}
    </View>
  );
};
