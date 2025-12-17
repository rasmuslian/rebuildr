import {
  AdRowSectionQuery,
  AdRowSectionQueryVariables,
  OrderProductsEnum,
} from "@/gql/graphql";
import { gql, useQuery } from "@apollo/client";
import {
  AD_ROW_SECTION,
  AdRowSection,
} from "@components/ad-row-section/ad-row-section";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { permanentSection } from "@constants/permanent-sections";
import { useFilterProduct } from "@hooks/useFilterProduct";
import { useScreenType } from "@hooks/useScreenType";
import { useUser } from "@hooks/useUser";
import { router } from "expo-router";

type Props = {
  category: { id: string; name: string };
};

export const CategorySection = ({ category: { id, name } }: Props) => {
  const { isLoggedIn } = useUser();
  const { filterBuilder } = useFilterProduct();

  const { data } = useQuery<AdRowSectionQuery, AdRowSectionQueryVariables>(
    AD_ROW_SECTION,
    {
      variables: {
        input: {
          categoryIds: [id],
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
      title={name}
      onPress={() => {
        filterBuilder.setCategories([{ id }]).apply();
        router.navigate("/search/products");
      }}
    />
  );
};
