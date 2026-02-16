import {
  AdRowSectionQuery,
  AdRowSectionQueryVariables,
  SearchInSeasonQuery,
} from "@/gql/graphql";
import { useQuery } from "@apollo/client";
import {
  AD_ROW_SECTION,
  AdRowSection,
} from "@components/ad-row-section/ad-row-section";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { useFilterProduct } from "@hooks/useFilterProduct";
import { useUser } from "@hooks/useUser";
import { router } from "expo-router";

type Props = {
  category: SearchInSeasonQuery["categories"][0];
};

export const CategorySection = ({ category }: Props) => {
  const { isLoggedIn } = useUser();
  const { filterBuilder } = useFilterProduct();

  const flattenCategories = [category, ...category.children];

  const { data } = useQuery<AdRowSectionQuery, AdRowSectionQueryVariables>(
    AD_ROW_SECTION,
    {
      variables: {
        input: {
          categoryIds: flattenCategories.map((c) => c.id),
        },
        limit: 10,
        offset: 0,
        isLoggedIn,
      },
    },
  );

  if (!data) {
    return <LoadingSpinner />;
  }

  return (
    <AdRowSection
      data={data}
      title={category.name}
      onPress={() => {
        filterBuilder.setCategories(flattenCategories).apply();

        router.navigate({
          pathname: "/search/products/[categoryId]",
          params: {
            categoryId: category.id,
          },
        });
      }}
    />
  );
};
