import { useQuery } from "@apollo/client";
import { router } from "expo-router";
import {
  AdRowSectionQuery,
  AdRowSectionQueryVariables,
  ProductVisibilityEnum,
  UserType,
} from "@/gql/graphql";
import { useUser } from "@hooks/useUser";
import { useScreenType } from "@hooks/useScreenType";
import {
  AD_ROW_SECTION,
  AdRowSection,
} from "@components/ad-row-section/ad-row-section";

/**
 * Home-page section showing the business user's company internal inventory.
 * Hidden for non-business accounts and when there are no internal listings.
 */
export const InternalListings = () => {
  const { me, isLoggedIn } = useUser();
  const { isDesktop } = useScreenType();
  const isBusiness = me?.type === UserType.Business;

  const { data } = useQuery<AdRowSectionQuery, AdRowSectionQueryVariables>(
    AD_ROW_SECTION,
    {
      skip: !isBusiness,
      variables: {
        input: { visibility: ProductVisibilityEnum.Internal },
        limit: isDesktop ? 4 : 10,
        offset: 0,
        isLoggedIn,
      },
    },
  );

  if (!isBusiness || !data || data.products.products.length === 0) {
    return null;
  }

  return (
    <AdRowSection
      data={data}
      title="Interna annonser"
      onPress={() =>
        router.navigate({ pathname: "/account/internal-inventory" })
      }
    />
  );
};
