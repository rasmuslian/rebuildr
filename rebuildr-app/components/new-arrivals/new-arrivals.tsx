import { useQuery } from "@apollo/client";
import { useFilterProduct } from "@hooks/useFilterProduct";
import { router } from "expo-router";
import {
  OrderProductsEnum,
  AdRowSectionQuery,
  AdRowSectionQueryVariables,
} from "@/gql/graphql";
import { useUser } from "@hooks/useUser";
import { useScreenType } from "@hooks/useScreenType";
import {
  AD_ROW_SECTION,
  AdRowSection,
} from "@components/ad-row-section/ad-row-section";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { permanentSection } from "@constants/permanent-sections";

export const NewArrivals = () => {
  const { filterBuilder } = useFilterProduct();
  const { isLoggedIn } = useUser();
  const { isDesktop } = useScreenType();

  const { data } = useQuery<AdRowSectionQuery, AdRowSectionQueryVariables>(
    AD_ROW_SECTION,
    {
      variables: {
        input: {
          excludeOwnProducts: true,
          orderBy: OrderProductsEnum.Latest,
        },
        limit: isDesktop ? 4 : 10,
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
      title={permanentSection.newArrivals.title}
      onPress={() => {
        filterBuilder
          .setOrdering(OrderProductsEnum.Latest)
          .setCategories([])
          .setSourceSection("newArrivals")
          .apply();
        router.navigate("/search/products");
      }}
    />
  );
};
