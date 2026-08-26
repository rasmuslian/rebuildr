import { gql } from "@apollo/client";
import { useLikeProduct } from "@hooks/useLikeProduct";
import { AdRowSectionQuery } from "@/gql/graphql";
import { useScreenType } from "@hooks/useScreenType";
import { AdRowSectionCarousel } from "./ad-row-section-carousel";

export const AD_ROW_SECTION = gql`
  query AdRowSection(
    $input: ProductsInput!
    $limit: Int
    $offset: Int
    $isLoggedIn: Boolean!
    $distanceFrom: LocationInputType
  ) {
    products(input: $input, limit: $limit, offset: $offset) {
      products {
        id
        title
        status
        availability
        likedByMe
        primaryQuantity
        primaryUnit
        condition
        price
        soldByQuantity
        distanceFromLocation(location: $distanceFrom)
        primaryImage {
          id
          url
        }
        category {
          id
          name
        }
        seller {
          id
        }
      }
    }
    me @include(if: $isLoggedIn) {
      id
    }
  }
`;

type Props = {
  data: AdRowSectionQuery;
  onPress: () => void;
  title: string;
  showInlineBanner?: boolean;
};

export const AdRowSection = ({
  data,
  onPress,
  title,
  showInlineBanner,
}: Props) => {
  const { onToggleProductHeart } = useLikeProduct();
  const { isDesktop } = useScreenType();

  if (!data || data.products.products.length < 1) return null;

  return (
    <AdRowSectionCarousel
      data={data}
      title={title}
      buttonTitle={isDesktop ? "Visa alla" : undefined}
      onPress={onPress}
      onToggleProductHeart={onToggleProductHeart}
      showInlineBanner={showInlineBanner}
    />
  );
};
