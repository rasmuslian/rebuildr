import {
  OrderCategoriesEnum,
  RootCategorySectionQuery,
  RootCategorySelectedCategoryQuery,
  RootCategorySelectedCategoryQueryVariables,
} from "@/gql/graphql";
import { gql, useQuery } from "@apollo/client";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { View } from "react-native";
import placeholder from "@assets/images/category-placeholder.jpeg";
import { Body, Title } from "@components/typography/text";
import { Button } from "@components/buttons/button";
import { Image } from "expo-image";
import { useThemeColor } from "@hooks/useThemeColor";

const ROOT_CATEGORY_SECTION = gql`
  query RootCategorySection {
    rootCategories {
      id
      name
      description
      image {
        id
        url
      }
      orderIndex
    }
  }
`;

const ROOT_CATEGORY_SELECTED_CATEGORY = gql`
  query RootCategorySelectedCategory($input: CategoryInput!) {
    category(input: $input) {
      id
      name
      description
      image {
        id
        url
      }
    }
  }
`;

type Props = {
  compact?: boolean;
  onSelect: (id: string) => void;
  selectedId?: string;
  onChange?: () => void;
};

export const RootCategorySection = ({
  compact = false,
  onSelect,
  selectedId,
  onChange,
}: Props) => {
  const colors = useThemeColor();
  const { data } = useQuery<RootCategorySectionQuery>(ROOT_CATEGORY_SECTION, {
    skip: !!selectedId,
    variables: {
      input: {
        orderBy: OrderCategoriesEnum.OrderIndexAsc,
      },
    },
  });
  const { data: selectedData } = useQuery<
    RootCategorySelectedCategoryQuery,
    RootCategorySelectedCategoryQueryVariables
  >(ROOT_CATEGORY_SELECTED_CATEGORY, {
    variables: {
      input: {
        id: selectedId as string,
      },
    },
    skip: !selectedId,
  });

  if ((!selectedId && !data) || (!!selectedId && !selectedData)) {
    return <LoadingSpinner />;
  }

  if (selectedData) {
    return (
      <View
        style={{
          borderBottomWidth: compact ? 0 : 1,
          borderColor: colors.dividers.neutral,
          paddingBottom: compact ? 0 : 16,
        }}
      >
        <Title size="medium" style={{ marginBottom: compact ? 6 : 12 }}>
          Vad ska du sälja?{" "}
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
            source={{
              uri: selectedData.category.image?.url ?? placeholder.uri,
            }}
            style={{
              width: compact ? 28 : 60,
              height: compact ? 28 : 60,
              borderRadius: 100,
            }}
          />
          <View style={{ flex: 1 }}>
            <Body size="medium">{selectedData.category.name}</Body>
          </View>
          <Button label="Ändra" onPress={onChange} type="tonal" />
        </View>
      </View>
    );
  }

  return (
    <View>
      <Title size="medium" style={{ marginBottom: compact ? 8 : 24 }}>
        Vad ska du sälja?
      </Title>
      <View style={{ gap: compact ? 8 : 16 }}>
        {data?.rootCategories.map((c, i) => {
          return (
            <View
              key={i}
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                gap: compact ? 8 : 16,
              }}
            >
              <Image
                source={{ uri: c.image?.url ?? placeholder.uri }}
                style={{
                  width: compact ? 28 : 60,
                  height: compact ? 28 : 60,
                  borderRadius: 100,
                }}
              />
              <View style={{ flex: 1 }}>
                <Body size="medium">{c.name}</Body>
              </View>
              <Button label="Välj" onPress={() => onSelect(c.id)} />
            </View>
          );
        })}
      </View>
    </View>
  );
};
