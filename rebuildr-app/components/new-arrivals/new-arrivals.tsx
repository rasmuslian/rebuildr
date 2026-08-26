import { useQuery } from "@apollo/client";
import { useFilterProduct } from "@hooks/useFilterProduct";
import { router } from "expo-router";
import {
  OrderProductsEnum,
  AdRowSectionQuery,
  AdRowSectionQueryVariables,
} from "@/gql/graphql";
import { useUser } from "@hooks/useUser";
import {
  AD_ROW_SECTION,
  AdRowSection,
} from "@components/ad-row-section/ad-row-section";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { permanentSection } from "@constants/permanent-sections";
import { DESKTOP_ROW_COLUMNS } from "@constants/layout";
import { useScreenType } from "@hooks/useScreenType";

export const NewArrivals = () => {
  const { isDesktop } = useScreenType();
  const { filterBuilder } = useFilterProduct();
  const { isLoggedIn } = useUser();

  const { data } = useQuery<AdRowSectionQuery, AdRowSectionQueryVariables>(
    AD_ROW_SECTION,
    {
      variables: {
        input: {
          excludeOwnProducts: true,
          orderBy: OrderProductsEnum.Latest,
        },
        limit: isDesktop ? DESKTOP_ROW_COLUMNS : 10,
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
      showInlineBanner
      onPress={() => {
        filterBuilder.reset().setOrdering(OrderProductsEnum.Latest).apply();
        router.navigate({ pathname: "/search/products/new-arrivals" });
      }}
    />
  );
};
