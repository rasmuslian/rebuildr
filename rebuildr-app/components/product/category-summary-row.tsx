import {
  CategorySummaryRowQuery,
  CategorySummaryRowQueryVariables,
} from "@/gql/graphql";
import { gql, useQuery } from "@apollo/client";
import { Button } from "@components/buttons/button";
import { Body, Title } from "@components/typography/text";
import placeholder from "@assets/images/category-placeholder.jpeg";
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
  compact?: boolean;
  categoryId: string;
  onChange: () => void;
};

export const CategorySummaryRow = ({
  compact = false,
  categoryId,
  onChange,
}: Props) => {
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
        borderBottomWidth: compact ? 0 : 1,
        borderColor: colors.dividers.neutral,
        paddingBottom: compact ? 0 : 16,
      }}
    >
      <Title size="medium" style={{ marginBottom: compact ? 6 : 12 }}>
        Kategori
      </Title>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          gap: compact ? 8 : 16,
        }}
      >
        <Image
          source={
            category.image?.url ? { uri: category.image.url } : placeholder
          }
          style={{
            width: compact ? 28 : 44,
            height: compact ? 28 : 44,
            borderRadius: 100,
            backgroundColor: colors.background.secondary,
          }}
        />
        <View style={{ flex: 1 }}>
          <Body size="medium">
            {category.parent
              ? `${category.parent.name} › ${category.name}`
              : category.name}
          </Body>
        </View>
        <Button label="Ändra" type="tonal" onPress={onChange} />
      </View>
    </View>
  );
};
