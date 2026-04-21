import { MyFavoritesQuery, MyFavoritesQueryVariables } from "@/gql/graphql";
import { useQuery } from "@apollo/client";
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
import { useScreenType } from "@hooks/useScreenType";
import TopBar from "@components/navigation/top-bar/top-bar";
import { View } from "react-native";
import { SectionHeader } from "@components/sections/section-header";
import { MY_FAVORITES } from "@components/account/queries";

export default function Favorites() {
  const { isDesktop } = useScreenType();
  const PRODUCTS_PER_PAGE = isDesktop ? 8 : 10;
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
  const isEmptyPage = !hasFavoritProducts && !hasFavoritProjects;

  const onFavoritesPress = () => {
    router.navigate({
      pathname: "/account/favorites/projects",
    });
  };

  const content = (
    <>
      <Display size="small">En samlad plats för dina favoriter</Display>
      {isEmptyPage && (
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
        <>
          {isDesktop ? (
            <>
              <SectionHeader onPress={onFavoritesPress} buttonTitle="Visa alla">
                Favoritprojekt
              </SectionHeader>
              <View
                style={{
                  flexDirection: "row",
                  marginHorizontal: -8,
                  flexWrap: "wrap",
                }}
              >
                {data.me.likedProjects.slice(0, 4).map((project) => (
                  <View style={{ flexBasis: "25%", paddingHorizontal: 8 }}>
                    <ProjectCard
                      key={project.id}
                      showHeart={project.user.id !== data.me.id}
                      project={project}
                    />
                  </View>
                ))}
              </View>
            </>
          ) : (
            <HoriztalListSection
              data={data.me.likedProjects}
              renderItem={({ item }) => (
                <ProjectCard
                  showHeart={item.user.id !== data.me.id}
                  project={item}
                />
              )}
              title="Favoritprojekt"
              onPress={onFavoritesPress}
              visibleItems={2}
            />
          )}
        </>
      )}
      {hasFavoritProjects && hasFavoritProducts && <Divider />}
      {hasFavoritProducts && (
        <AdGridSection
          header={
            hasFavoritProducts && hasFavoritProjects
              ? "Favoritannonser"
              : undefined
          }
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
              soldByQuantity: product.soldByQuantity,
              heart: product.seller.id !== data.me.id,
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
    </>
  );

  if (isDesktop) {
    return (
      <ScreenLayout
        headerComponent={<TopBar theme="light" />}
        loading={loading}
        style={{ gap: 24 }}
      >
        {content}
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout
      headerComponent={<Header title="Favoriter" />}
      loading={loading}
      style={{ gap: 24 }}
    >
      {content}
    </ScreenLayout>
  );
}
