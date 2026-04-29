import { gql } from "@apollo/client";
import { useLikeProduct } from "@hooks/useLikeProduct";
import { AdRowSectionQuery } from "@/gql/graphql";
import { useScreenType } from "@hooks/useScreenType";
import { AdRowSectionMobile } from "./ad-row-section.mobile";
import { AdRowSectionDesktop } from "./ad-row-section.desktop";

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
};

export const AdRowSection = ({ data, onPress, title }: Props) => {
  const { onToggleProductHeart } = useLikeProduct();
  const { isDesktop } = useScreenType();

  if (!data || data.products.products.length < 1) return null;

  if (isDesktop) {
    return (
      <AdRowSectionDesktop
        products={data.products.products}
        me={data.me}
        title={title}
        onPress={onPress}
        onToggleProductHeart={onToggleProductHeart}
      />
    );
  }
  return (
    <AdRowSectionMobile
      data={data}
      title={title}
      onPress={onPress}
      onToggleProductHeart={onToggleProductHeart}
    />
  );
};
