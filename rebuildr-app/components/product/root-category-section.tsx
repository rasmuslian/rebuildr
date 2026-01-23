import {
  RootCategorySectionQuery,
  RootCategorySelectedCategoryQuery,
  RootCategorySelectedCategoryQueryVariables,
} from "@/gql/graphql";
import { gql, useQuery } from "@apollo/client";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { View } from "react-native";
import placeholder from "@assets/images/category-placeholder.jpeg";
import { Body, Display, Headline, Title } from "@components/typography/text";
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
  onSelect: (id: string) => void;
  selectedId?: string;
  onChange?: () => void;
};

export const RootCategorySection = ({
  onSelect,
  selectedId,
  onChange,
}: Props) => {
  const colors = useThemeColor();
  const { data } = useQuery<RootCategorySectionQuery>(ROOT_CATEGORY_SECTION, {
    skip: !!selectedId,
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
          borderBottomWidth: 1,
          borderColor: colors.dividers.neutral,
          paddingBottom: 16,
        }}
      >
        <Headline size="small" style={{ marginBottom: 12 }}>
          Vad ska du sälja?{" "}
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
            source={{
              uri: selectedData.category.image?.url ?? placeholder.uri,
            }}
            style={{ width: 60, height: 60, borderRadius: 100 }}
          />
          <View style={{ flex: 1 }}>
            <Title size="medium">{selectedData.category.name}</Title>
          </View>
          <Button label="Ändra" onPress={onChange} type="tonal" />
        </View>
      </View>
    );
  }

  return (
    <View>
      <Display size="small" style={{ marginBottom: 24 }}>
        Vad ska du sälja?
      </Display>
      <View style={{ gap: 16 }}>
        {data?.rootCategories.map((c, i) => {
          return (
            <View
              key={i}
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 16,
              }}
            >
              <Image
                source={{ uri: c.image?.url ?? placeholder.uri }}
                style={{ width: 60, height: 60, borderRadius: 100 }}
              />
              <View style={{ flex: 1, gap: 4 }}>
                <Title size="medium">{c.name}</Title>
                <Body
                  size="medium"
                  color="secondary"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {c.description}
                </Body>
              </View>
              <Button label="Välj" onPress={() => onSelect(c.id)} />
            </View>
          );
        })}
      </View>
    </View>
  );
};
