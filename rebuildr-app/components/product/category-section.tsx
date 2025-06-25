import {
  CategorySectionQuery,
  CategorySectionSelectedCategoryQuery,
  CategorySectionSelectedCategoryQueryVariables,
} from "@/gql/graphql";
import { gql, useQuery } from "@apollo/client";
import { Button } from "@components/buttons/button";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { Body, Display, Headline } from "@components/typography/text";
import { useThemeColor } from "@hooks/useThemeColor";
import { View } from "react-native";

const CATEGORY_SECTION = gql`
  query CategorySection($input: CategoryInput!) {
    category(input: $input) {
      id
      children {
        id
        name
        image {
          id
          url
        }
      }
    }
  }
`;

const CATEGORY_SECTION_SELECTED_CATEGORY = gql`
  query CategorySectionSelectedCategory($input: CategoryInput!) {
    category(input: $input) {
      id
      name
      image {
        id
        url
      }
    }
  }
`;

type Props = {
  parentId: string;
  onSelect: (id: string) => void;
  selectedId?: string;
  onChange?: () => void;
};

export const CategorySection = ({
  parentId,
  onSelect,
  selectedId,
  onChange,
}: Props) => {
  const colors = useThemeColor();
  const { data } = useQuery<CategorySectionQuery>(CATEGORY_SECTION, {
    variables: { input: { id: parentId } },
    skip: !!selectedId,
  });
  const { data: selectedData } = useQuery<
    CategorySectionSelectedCategoryQuery,
    CategorySectionSelectedCategoryQueryVariables
  >(CATEGORY_SECTION_SELECTED_CATEGORY, {
    variables: {
      input: { id: selectedId as string },
    },
    skip: !selectedId,
  });

  if ((!data && !selectedId) || (!selectedData && !!selectedId)) {
    return <LoadingSpinner />;
  }

  if (selectedData) {
    return (
      <View
        style={{
          borderBottomWidth: 1,
          borderColor: colors.dividers.neutral,
          paddingBottom: 16,
        }}
      >
        <Headline size="small">Välj en kategori</Headline>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Body size="medium">{selectedData.category.name}</Body>
          <Button label="Ändra" type="tonal" onPress={onChange} />
        </View>
      </View>
    );
  }

  return (
    <View>
      <Display size="small" style={{ marginBottom: 16 }}>
        Välj en kategori
      </Display>
      <Body size="large">
        Osäker på vilken kategori du ska välja? Läs mer i vår{" "}
        <Body isLink size="large">
          Hjälpguide för kategorival.
        </Body>
      </Body>
      <View style={{ marginTop: 24, gap: 16 }}>
        {data?.category.children.map((c, i) => (
          <View
            key={i}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Body size="medium">{c.name}</Body>
            <Button label="Välj" onPress={() => onSelect(c.id)} />
          </View>
        ))}
      </View>
    </View>
  );
};
