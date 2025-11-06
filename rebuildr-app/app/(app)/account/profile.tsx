import { isLoggedInVar } from "@/apollo/config";
import {
  ProfileProductsQuery,
  ProfileProductsQueryVariables,
  ProfileQuery,
  ProfileQueryVariables,
  ProfileUpdateUserMutation,
  ProfileUpdateUserMutationVariables,
} from "@/gql/graphql";
import { gql, useMutation, useQuery } from "@apollo/client";
import { Button } from "@components/buttons/button";
import { UserCard } from "@components/cards/user-card";
import { Divider } from "@components/dividers/divider";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { Header } from "@components/navigation/headers/header";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { Body, Display, Headline } from "@components/typography/text";
import { borderRadius } from "@constants/sizes";
import { useThemeColor } from "@hooks/useThemeColor";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import { View } from "react-native";
import { ProjectCard } from "@components/cards/project-card";
import { CollapsableText } from "@components/collapsable-text/collapsable-text";
import { Icon, IconType } from "@icons/icon";
import { TextInput } from "@components/forms/textInput";
import { launchImageLibraryAsync } from "expo-image-picker";
import { useOptimizeImage } from "@hooks/useOptimizeImage";
import { ReviewsAccordion } from "@components/profile/reviews-accordion";
import { numberToString } from "@/utils/number-strings";
import { EmptyStateCard } from "@components/cards/empty-state-card";
import { AdGridSection } from "@components/ad-grid-section/ad-grid-section";
import { TabRail } from "@components/tabs/tab-rail";
import { useLikeProduct } from "@hooks/useLikeProduct";
import { HoriztalListSection } from "@components/sections/horizontal-list-section";
import { useSellProductContext } from "@context/sell-product-context";

const PROFILE = gql`
  query Profile($input: GetUserInput!, $isLoggedIn: Boolean!) {
    user(input: $input) {
      id
      username
      description
      type
      numberOfSoldProducts
      numberOfPublishedProducts
      rating
      projects {
        id
        title
        likedByMe
        projectPicture {
          id
          url
        }
        products {
          id
          status
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
      profilePicture {
        id
        url
      }
      reviewed {
        id
        createdAt
        review
        stars
        purchase {
          id
          buyerId
        }
        reviewer {
          id
          username
          type
          profilePicture {
            id
            url
          }
        }
      }
    }
    me @include(if: $isLoggedIn) {
      id
    }
  }
`;

const PROFILE_PRODUCTS = gql`
  query ProfileProducts($input: ProductsInput!, $limit: Int, $offset: Int) {
    products(input: $input, limit: $limit, offset: $offset) {
      products {
        id
        status
        title
        price
        condition
        primaryQuantity
        primaryUnit
        likedByMe
        primaryImage {
          id
          url
        }
        approximatePlace {
          address
        }
      }
      total
    }
  }
`;
const PROFILE_UPDATE_USER = gql`
  mutation ProfileUpdateUser($input: UpdateUserInput!) {
    updateUser(input: $input) {
      user {
        id
        description
        profilePicture {
          id
          url
        }
      }
      profilePicturePutUrl
    }
  }
`;

export default function Profile() {
  const [tab, setTab] = useState<"products" | "reviewed">("products");
  const { onToggleProductHeart } = useLikeProduct();

  //------edit profile variables------
  const [description, setDescription] = useState<string>();
  const [profilePicture, setProfilePicture] = useState<{
    uri: string;
    mimeType: string;
    file: File;
    size: number;
  }>();
  const { optimizeImage } = useOptimizeImage();
  const [updateProfile, { loading: updateProfileLoading }] = useMutation<
    ProfileUpdateUserMutation,
    ProfileUpdateUserMutationVariables
  >(PROFILE_UPDATE_USER);
  const { setVisible } = useSellProductContext();

  const PRODUCTS_PER_PAGE = 10;
  const colors = useThemeColor();
  const { mode, userId } = useLocalSearchParams<{
    userId: string;
    mode?: "edit" | "read";
  }>();
  const isLoggedIn = isLoggedInVar();
  const { data } = useQuery<ProfileQuery, ProfileQueryVariables>(PROFILE, {
    variables: { input: { id: userId }, isLoggedIn },
  });

  const isMyProfile = data?.me ? data.me.id === data.user.id : false;

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, []),
  );

  //-------- PRODUCTS FUNCTIONS --------------
  const {
    data: productsData,
    loading: productsLoading,
    fetchMore,
    refetch,
  } = useQuery<ProfileProductsQuery, ProfileProductsQueryVariables>(
    PROFILE_PRODUCTS,
    {
      variables: {
        input: {
          sellerId: userId,
        },
        limit: PRODUCTS_PER_PAGE,
        offset: 0,
      },
    },
  );

  const onShowMore = async () => {
    await fetchMore({
      variables: {
        limit: PRODUCTS_PER_PAGE,
        offset: Math.ceil(
          (productsData?.products.products?.length ?? 0) / PRODUCTS_PER_PAGE,
        ),
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult?.products?.products.length) return prev;

        return {
          products: {
            ...prev.products,
            ...fetchMoreResult.products,
            products: [
              ...prev.products.products,
              ...fetchMoreResult.products.products,
            ],
          },
        };
      },
    });
  };
  //-----------------------------------------------

  //-------- EDIT PROFILE FUNCTIONS ---------------
  const onPickProfilePicture = async () => {
    const result = await launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (result?.canceled) return;
    const image = result?.assets[0];
    if (image) {
      const uri = image.uri;
      const {
        mimeType,
        file,
        uri: optimizedImageUri,
        size,
      } = await optimizeImage(uri);

      const _image = {
        uri: optimizedImageUri,
        mimeType,
        file,
        size,
        name: image.fileName,
      };

      setProfilePicture(_image);
    }
  };
  const onSaveProfile = () => {
    if (updateProfileLoading) {
      return;
    }
    updateProfile({
      variables: {
        input: {
          id: userId,
          description,
          profilePicture: profilePicture
            ? { mimeType: profilePicture.mimeType }
            : undefined,
        },
      },
      onCompleted: async (data) => {
        if (data.updateUser.profilePicturePutUrl && profilePicture) {
          await fetch(data.updateUser.profilePicturePutUrl, {
            method: "PUT",
            headers: {
              "Content-Type": profilePicture.mimeType,
              "x-amz-acl": "public-read",
            },
            body: profilePicture.file,
          });
        }
        setProfilePicture(undefined);
        router.setParams({ userId, mode: "read" });
      },
    });
  };
  //--------------------------------------------------

  if (!data) {
    return <LoadingSpinner />;
  }

  if (!isMyProfile && mode === "edit") {
    router.setParams({ mode: "read" });
  }

  const renderProducts = () => {
    const emptyState = isMyProfile
      ? {
          header: "Inga annonser än",
          description:
            "Just nu har du inga annonser ute, men det är enkelt att komma igång",
          cta: {
            label: "Lägg upp en annons",
            onPress: () => setVisible(true),
          },
        }
      : {
          header: "Inga annonser här just nu",
          description:
            "Den här säljaren har inga aktiva annonser för tillfället. Kika tillbaka senare eller utforska fler annonser på marknadsplatsen!",
          cta: {
            label: "Se fler annonser",
            onPress: () => router.navigate("/search"),
          },
        };

    return (
      <View style={{ gap: 24, marginTop: 16 }}>
        {productsData?.products.products.length ? (
          <>
            {!!data.user.projects.length && (
              <>
                <HoriztalListSection
                  data={data.user.projects}
                  renderItem={({ item }) => (
                    <ProjectCard
                      showHeart={data.me?.id !== item.user.id}
                      project={item}
                    />
                  )}
                  title="Projekt"
                  onPress={() => {
                    router.navigate({
                      pathname: "/(app)/project-list/[userId]",
                      params: { userId: data.user.id },
                    });
                  }}
                  visibleItems={2}
                />
                <Divider />
              </>
            )}
            <AdGridSection
              header="Annonser"
              products={productsData.products.products.map((product) => ({
                id: product.id,
                status: product.status,
                imageUri: product.primaryImage?.url,
                title: product.title,
                quantity: product.primaryQuantity,
                condition: product.condition,
                account: {
                  rating: data.user.rating,
                  type: data.user.type,
                  location: product.approximatePlace?.address,
                },
                price: product.price,
                heart: data.me?.id !== data.user.id,
                liked: !!product.likedByMe,
                onHeartPress: () => {
                  onToggleProductHeart({
                    productId: product.id,
                    likedByMe: !!product.likedByMe,
                  });
                },
              }))}
              pagination={{
                onShowMore,
                loading: productsLoading,
                total: productsData.products.total,
              }}
            />
          </>
        ) : (
          <EmptyStateCard {...emptyState} />
        )}
      </View>
    );
  };

  const renderReviewed = () => {
    const salesReviewed = data.user.reviewed.filter(
      (review) => review.purchase.buyerId !== userId,
    );
    const buysReviewed = data.user.reviewed.filter(
      (review) => review.purchase.buyerId === userId,
    );
    const emptyState = isMyProfile
      ? {
          header: "Inga omdömen än",
          description:
            "Du har inte fått några omdömen ännu. När någon genomför ett köp kan de lämna en recension som hamnar här!",
        }
      : {
          header: "Inga omdömen här just nu",
          description:
            "Den här säljaren har inte fått några omdömen ännu. När någon genomför ett köp kan de lämna en recension här!",
        };

    return (
      <View style={{ gap: 16, marginTop: 16 }}>
        <View style={{ paddingVertical: 16, gap: 48, flexDirection: "row" }}>
          <View style={{ paddingRight: 12 }}>
            <Display size="large" style={{ marginBottom: 14 }}>
              {numberToString(data.user.rating ?? 0, 1)}
            </Display>
            <View style={{ flexDirection: "row", gap: 3 }}>
              {[...Array(5)].map((_, i) => {
                const size = 10;
                const rating = data.user.rating ?? 0;
                const fillPercent = Math.min(1, Math.max(0, rating - i));

                return (
                  <View key={i}>
                    <Icon icon="star" size={10} color="disabled" />
                    <View
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: size * fillPercent,
                        height: size,
                        overflow: "hidden",
                      }}
                    >
                      <Icon icon="star" size={10} color="link" />
                    </View>
                  </View>
                );
              })}
            </View>
            <Body size="small" style={{ marginTop: 4 }}>
              {data.user.reviewed.length} recensioner
            </Body>
          </View>
          <View style={{ gap: 4, flex: 1 }}>
            {[...Array(5)].map((_, i) => {
              const nrOfThisRating = data.user.reviewed.reduce(
                (acc, curr) => (acc + curr.stars === 5 - i ? 1 : 0),
                0,
              );
              const fillPercent = data.user.reviewed.length
                ? nrOfThisRating / data.user.reviewed.length
                : 0;
              return (
                <View
                  key={i}
                  style={{ flexDirection: "row", gap: 8, alignItems: "center" }}
                >
                  <Body size="small">{5 - i}</Body>
                  <View
                    style={{
                      borderRadius: borderRadius.small,
                      backgroundColor: colors.buttons.tonal.hovered,
                      height: 8,
                      flex: 1,
                    }}
                  >
                    <View
                      style={{
                        borderRadius: borderRadius.small,
                        position: "absolute",
                        width: `${fillPercent * 100}%`,
                        height: "100%",
                        backgroundColor: colors.buttons.filled.enabled,
                      }}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        </View>
        <Divider />
        {data.user.reviewed.length > 0 ? (
          <View style={{ gap: 24 }}>
            <ReviewsAccordion
              title="Från andra köpare"
              reviews={salesReviewed}
              emptyDescription="Inga omdömen från köpare ännu"
            />
            <Divider />
            <ReviewsAccordion
              title="Från andra säljare"
              reviews={buysReviewed}
              emptyDescription="Inga omdömen från säljare ännu"
            />
          </View>
        ) : (
          <EmptyStateCard {...emptyState} />
        )}
      </View>
    );
  };

  if (mode === "edit") {
    const _description = description ?? data.user.description ?? "";
    return (
      <ScreenLayout
        style={{ gap: 24, marginTop: 24 }}
        headerComponent={
          <Header title="Redigera profil" onBack={() => router.back()} />
        }
        footerComponent={
          <Button
            label="Spara"
            loading={updateProfileLoading}
            onPress={() => onSaveProfile()}
          />
        }
      >
        <UserCard
          userType={data.user.type}
          profilePictureUrl={
            profilePicture?.uri ?? data.user.profilePicture?.url
          }
          username={data.user.username}
          numberOfPublishedProducts={data.user.numberOfPublishedProducts}
          numberOfSoldProducts={data.user.numberOfSoldProducts}
        />
        <Button
          label="Ladda upp profilbild"
          onPress={() => onPickProfilePicture()}
        />
        <View style={{ gap: 16 }}>
          <Divider />
          <Headline size="small">Din profil</Headline>
          <View style={{ gap: 12 }}>
            <TextInput
              style={{ minHeight: 172 }}
              multiline
              value={_description}
              onChange={(t) => setDescription(t.slice(0, 5000))}
              placeholder="Här kan du skriva en kort beskrivning om dig själv och vad du säljer."
            />
            <Body size="small" color="secondary">
              {_description.length ?? 0} av 5000 tecken
            </Body>
          </View>
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout
      style={{ marginTop: 24, gap: 24 }}
      headerComponent={
        <Header
          ctas={[
            ...(isMyProfile
              ? [
                  {
                    icon: "edit" as IconType,
                    onPress: () =>
                      router.push({
                        pathname: "/account/profile",
                        params: { mode: "edit", userId },
                      }),
                  },
                ]
              : []),
            //Hide share button until implemented
            // {
            //   icon: "upload",
            //   onPress: () => {
            //     //TODO: share profile
            //   },
            // },
          ]}
        />
      }
    >
      <UserCard
        userType={data.user.type}
        profilePictureUrl={data.user.profilePicture?.url}
        username={data.user.username}
        numberOfPublishedProducts={data.user.numberOfPublishedProducts}
        numberOfSoldProducts={data.user.numberOfSoldProducts}
        rating={data.user.rating}
      />
      {!!data.user.description && (
        <CollapsableText text={data.user.description} nrOfLines={2} />
      )}
      <Divider />
      <View>
        <TabRail
          tabs={[
            {
              title: "Annonser",
              active: tab === "products",
              onActivate: () => setTab("products"),
            },
            {
              title: "Omdömen",
              active: tab === "reviewed",
              onActivate: () => setTab("reviewed"),
            },
          ]}
        />
        {tab === "products" && renderProducts()}
        {tab === "reviewed" && renderReviewed()}
      </View>
    </ScreenLayout>
  );
}
