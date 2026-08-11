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
import CustomNotFound from "@/app/+not-found";

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

  const { data, loading, error } = useQuery<
    ProductViewQuery,
    ProductViewQueryVariables
  >(PRODUCT_VIEW, {
    variables: {
      input: { id: productId },
      isLoggedIn,
      distanceFrom: userCoords
        ? { lat: userCoords.latitude, lng: userCoords.longitude }
        : undefined,
    },
  });

  // Product pages are client-rendered (volatile listings) and intentionally
  // kept out of the index. The static [productId].html template renders during
  // loading, so emit noindex here too — otherwise crawlers would index an empty
  // shell. Also kept out of the sitemap (see scripts/generate-sitemap.ts).
  if (loading)
    return (
      <>
        <RebuildrHead noindex />
        <LoadingSpinner />
      </>
    );
  if (error || !data) {
    return <CustomNotFound />;
  }

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
        image={product.images[0]?.url}
        isProductPage
        noindex
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
