import {
  ProductViewQuery,
  ProductViewQueryVariables,
  UserType,
} from "@/gql/graphql";
import { gql, useQuery } from "@apollo/client";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { useLocalSearchParams } from "expo-router";
import { useUser } from "@hooks/useUser";
import { PRODUCT_VIEW_FRAGMENT } from "@/queries/product-view-fragment";
import { useScreenType } from "@hooks/useScreenType";
import { ProductMobile } from "@components/product/product.mobile";
import { ProductDesktop } from "@components/product/product.desktop";
import { useLocationContext } from "@context/location-context";
import RebuildrHead from "@components/meta-data/rebuildr-head";

const PRODUCT_VIEW = gql`
  query ProductView(
    $input: GetProductInput!
    $isLoggedIn: Boolean!
    $distanceFrom: LocationInputType
  ) {
    product(input: $input) {
      ...ProductViewFragment
      distanceFromLocation(location: $distanceFrom)
    }
    me @include(if: $isLoggedIn) {
      id
      address
      type
    }
  }
  ${PRODUCT_VIEW_FRAGMENT}
`;

export default function Product() {
  const { userCoords } = useLocationContext();
  const { isLoggedIn } = useUser();
  const { productId } = useLocalSearchParams<{ productId: string }>();
  const { isDesktop } = useScreenType();

  const { data } = useQuery<ProductViewQuery, ProductViewQueryVariables>(
    PRODUCT_VIEW,
    {
      variables: {
        input: { id: productId },
        isLoggedIn,
        distanceFrom: userCoords
          ? { lat: userCoords.latitude, lng: userCoords.longitude }
          : undefined,
      },
    },
  );

  if (!data) return <LoadingSpinner />;
  const product = data.product;
  const me = data.me;

  const approximatePlace = product.project
    ? product.project.approximatePlace
    : product.approximatePlace;

  const isMyProduct = me?.id === product.seller.id;

  const otherProducts = product.seller.products
    .filter((otherProduct) => otherProduct.id !== productId)
    .map((otherProduct) => ({
      seller: {
        id: product.seller.id,
      },
      ...otherProduct,
    }));

  const buyButtonDisabled = me?.type === UserType.Business;

  return (
    <>
      <RebuildrHead
        title={product.title}
        description={product.description ?? undefined}
        image={product.images[0].url}
        isProductPage
      />

      {isDesktop ? (
        <ProductDesktop
          product={product}
          me={me}
          approximatePlace={approximatePlace}
          isMyProduct={isMyProduct}
          otherProducts={otherProducts}
          buyButtonDisabled={buyButtonDisabled}
        />
      ) : (
        <ProductMobile
          product={product}
          me={me}
          approximatePlace={approximatePlace}
          isMyProduct={isMyProduct}
          otherProducts={otherProducts}
          buyButtonDisabled={buyButtonDisabled}
        />
      )}
    </>
  );
}
