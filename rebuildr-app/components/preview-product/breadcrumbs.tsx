import { Category } from "@/gql/graphql";
import { Body } from "@components/typography/text";
import { router } from "expo-router";
import { Pressable, View } from "react-native";

type Props = {
  parentCategory?: Pick<Category, "id" | "name"> | null;
  category?: Pick<Category, "id" | "name"> | null;
};

export const Breadcrumbs = ({ parentCategory, category }: Props) => {
  return (
    <View style={{ flexDirection: "row", gap: 4 }}>
      <Pressable
        onPress={() => {
          router.navigate("/search/products");
        }}
      >
        <Body size="medium" color="secondary">
          Alla varor
        </Body>
      </Pressable>

      {parentCategory && (
        <>
          <Body size="medium" color="secondary">
            /
          </Body>
          <Pressable
            onPress={() => {
              router.navigate({
                pathname: "/search/products/[categoryId]",
                params: {
                  categoryId: parentCategory.id,
                },
              });
            }}
          >
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
          <Body size="medium" color="secondary">
            {category.name}
          </Body>
        </>
      )}
    </View>
  );
};
