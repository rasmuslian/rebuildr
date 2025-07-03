import { MyFavoritesQuery, MyFavoritesQueryVariables } from "@/gql/graphql";
import { gql, useQuery } from "@apollo/client";
import { EmptyStateCard } from "@components/cards/empty-state-card";
import { Header } from "@components/navigation/headers/header";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { Display } from "@components/typography/text";
import { router } from "expo-router";
import { AdGridSection } from "@components/ad-grid-section/ad-grid-section";
import { ProjectCard } from "@components/cards/project-card";
import { Divider } from "@components/dividers/divider";
import { HoriztalListSection } from "@components/sections/horizontal-list-section";
import { useLikeProduct } from "@hooks/useLikeProduct";

export const MY_FAVORITES = gql`
  query MyFavorites($limit: Int, $offset: Int) {
    me {
      id
      likedProducts(limit: $limit, offset: $offset) {
        total
        products {
          id
          primaryImage {
            id
            url
          }
          title
          primaryQuantity
          condition
          likedByMe
          seller {
            id
            type
            rating
          }
          approximatePlace {
            address
          }
          price
        }
      }
      likedProjects {
        id
        title
        projectPicture {
          id
          url
        }
        likedByMe
        products {
          id
          primaryImage {
            id
            url
          }
        }
        user {
          id
          profilePicture {
            id
            url
          }
        }
      }
    }
  }
`;

export default function Favorites() {
  const PRODUCTS_PER_PAGE = 10;
  const { onToggleProductHeart } = useLikeProduct();

  const { data, loading, fetchMore } = useQuery<
    MyFavoritesQuery,
    MyFavoritesQueryVariables
  >(MY_FAVORITES, {
    variables: {
      limit: PRODUCTS_PER_PAGE,
      offset: 0,
    },
  });

  const onShowMore = async () => {
    await fetchMore({
      variables: {
        limit: PRODUCTS_PER_PAGE,
        offset: Math.ceil(
          (data?.me.likedProducts?.products.length ?? 0) / PRODUCTS_PER_PAGE,
        ),
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult?.me?.likedProducts?.products.length) return prev;

        return {
          me: {
            ...prev.me,
            likedProducts: {
              ...prev.me.likedProducts,
              total: fetchMoreResult.me.likedProducts.total,
              products: [
                ...(prev.me.likedProducts?.products ?? []),
                ...fetchMoreResult.me.likedProducts.products,
              ],
            },
          },
        };
      },
    });
  };

  const hasFavoritProducts = !!data?.me.likedProducts?.products.length;
  const hasFavoritProjects = !!data?.me.likedProjects?.length;

  const emptyPage = !hasFavoritProducts && !hasFavoritProjects;

  return (
    <ScreenLayout
      headerComponent={<Header title="Favoriter" />}
      loading={loading}
      style={{ gap: 24 }}
    >
      <Display size="small">En samlad plats för dina favoriter</Display>
      {emptyPage && (
        <EmptyStateCard
          header="Inga favoriter ännu"
          description="Spara annonser du gillar genom att trycka på hjärtat. Då hittar du dem enkelt här senare!"
          cta={{
            label: "Se fler annonser",
            onPress: () => router.navigate("/search"),
          }}
        />
      )}
      {data?.me.likedProjects && hasFavoritProjects && (
        <HoriztalListSection
          data={data.me.likedProjects}
          renderItem={({ item }) => <ProjectCard project={item} />}
          title="Favoritprojekt"
          onPress={() => {
            //TODO: navigate to projects page
          }}
          visibleItems={2}
        />
      )}
      {hasFavoritProjects && hasFavoritProducts && <Divider />}
      {hasFavoritProducts && (
        <AdGridSection
          header="Favoritannonser"
          products={
            (data?.me.likedProducts?.products ?? []).map((product) => ({
              id: product.id,
              imageUri: product.primaryImage?.url,
              title: product.title,
              quantity: product.primaryQuantity,
              condition: product.condition,
              account: {
                rating: product.seller.rating,
                type: product.seller.type,
                location: product.approximatePlace?.address,
              },
              price: product.price,
              heart: true,
              liked: !!product.likedByMe,
              onHeartPress: () => {
                onToggleProductHeart({
                  productId: product.id,
                  likedByMe: !!product.likedByMe,
                });
              },
            })) ?? []
          }
          pagination={{
            onShowMore,
            loading,
            total: data?.me.likedProducts?.total ?? 0,
          }}
        />
      )}
    </ScreenLayout>
  );
}
