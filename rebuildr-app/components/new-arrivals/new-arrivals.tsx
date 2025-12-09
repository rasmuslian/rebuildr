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

export const NewArrivals = () => {
  const { setSorting } = useFilterProduct();
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
      title="Nyinkomna varor"
      onPress={() => {
        setSorting(OrderProductsEnum.Latest, true);
        router.navigate("/search/products");
      }}
    />
  );
};
