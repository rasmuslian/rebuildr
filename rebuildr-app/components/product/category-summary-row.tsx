import {
  CategorySummaryRowQuery,
  CategorySummaryRowQueryVariables,
} from "@/gql/graphql";
import { gql, useQuery } from "@apollo/client";
import { Button } from "@components/buttons/button";
import { Headline, Title } from "@components/typography/text";
import placeholder from "@assets/images/placeholder-product.png";
import { useThemeColor } from "@hooks/useThemeColor";
import { Image } from "expo-image";
import { View } from "react-native";

const CATEGORY_SUMMARY_ROW = gql`
  query CategorySummaryRow($input: CategoryInput!) {
    category(input: $input) {
      id
      name
      image {
        id
        url
      }
      parent {
        id
        name
      }
    }
  }
`;

type Props = {
  categoryId: string;
  onChange: () => void;
};

export const CategorySummaryRow = ({ categoryId, onChange }: Props) => {
  const colors = useThemeColor();
  const { data } = useQuery<
    CategorySummaryRowQuery,
    CategorySummaryRowQueryVariables
  >(CATEGORY_SUMMARY_ROW, { variables: { input: { id: categoryId } } });

  const category = data?.category;
  if (!category) {
    return null;
  }

  return (
    <View
      style={{
        borderBottomWidth: 1,
        borderColor: colors.dividers.neutral,
        paddingBottom: 16,
      }}
    >
      <Headline size="small" style={{ marginBottom: 12 }}>
        Kategori
      </Headline>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16,
        }}
      >
        <Image
          source={{ uri: category.image?.url ?? placeholder.uri }}
          style={{ width: 44, height: 44, borderRadius: 100 }}
        />
        <View style={{ flex: 1 }}>
          <Title size="medium">
            {category.parent
              ? `${category.parent.name} › ${category.name}`
              : category.name}
          </Title>
        </View>
        <Button label="Ändra" type="tonal" onPress={onChange} />
      </View>
    </View>
  );
};
