import { isLoggedInVar } from "@/apollo/config";
import {
  ProfileProductsQuery,
  ProfileProductsQueryVariables,
  ProfileQuery,
  ProfileQueryVariables,
  UserType,
} from "@/gql/graphql";
import { gql, useQuery } from "@apollo/client";
import { Button } from "@components/buttons/button";
import { AdGrid } from "@components/cards/ad-grid";
import { UserCard } from "@components/cards/user-card";
import { Divider } from "@components/dividers/divider";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { Header } from "@components/navigation/headers/header";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { Body, Headline, Label, Title } from "@components/typography/text";
import { defaultApproximateLocation } from "@constants/map";
import { borderRadius } from "@constants/sizes";
import { useThemeColor } from "@hooks/useThemeColor";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { FlatList, Pressable } from "react-native-gesture-handler";
import { Image } from "expo-image";
import { ProjectCard } from "@components/cards/project-card";
import { CollapsableText } from "@components/collapsable-text/collapsable-text";
import { IconType } from "@icons/icon";

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
      products {
        id
        primaryQuantity
        primaryUnit
        condition
        price
        approximatePlace {
          address
        }
      }
      projects {
        id
        title
        projectPicture {
          id
          url
        }
        products {
          id
          primaryImage {
            id
            url
          }
        }
      }
      profilePicture {
        id
        url
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

export default function Profile() {
  const [tab, setTab] = useState<"products" | "reviewed">("products");
  const [offset, setOffset] = useState(0);
  const productsPerPage = 10;
  const colors = useThemeColor();
  const { mode, userId } = useLocalSearchParams<{
    userId: string;
    mode?: "edit" | "read";
  }>();
  const isLoggedIn = isLoggedInVar();
  const { data } = useQuery<ProfileQuery, ProfileQueryVariables>(PROFILE, {
    variables: { input: { id: userId }, isLoggedIn },
  });
  const {
    data: productsData,
    loading: productsLoading,
    fetchMore,
  } = useQuery<ProfileProductsQuery, ProfileProductsQueryVariables>(
    PROFILE_PRODUCTS,
    {
      variables: {
        input: {
          sellerId: userId,
        },
        limit: productsPerPage,
        offset,
      },
    },
  );

  const onShowMore = async () => {
    await fetchMore({
      variables: {
        limit: productsPerPage,
        offset: offset + 1,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult?.products?.products.length) return prev;
        setOffset(offset + 1);

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

  if (!data) {
    return <LoadingSpinner />;
  }

  if (data.me?.id && data.me.id !== userId && mode === "edit") {
    router.setParams({ mode: "read" });
  }

  return (
    <ScreenLayout
      style={{ marginTop: 24, gap: 24 }}
      headerComponent={
        <Header
          CTA={[
            ...(data.me?.id === userId
              ? [
                  {
                    icon: "edit" as IconType,
                    onPress: () => router.setParams({ mode: "edit", userId }),
                  },
                ]
              : []),
            {
              icon: "upload",
              onPress: () => {
                //TODO: share profile
              },
            },
          ]}
        />
      }
    >
      <UserCard
        username={data.user.username}
        numberOfPublishedProducts={data.user.numberOfPublishedProducts}
        numberOfSoldProducts={data.user.numberOfSoldProducts}
      />
      {data.user.description && (
        <CollapsableText text={data.user.description} nrOfLines={2} />
      )}
      <Divider />
      <View style={{ gap: 16 }}>
        <View
          style={{
            flexDirection: "row",
            alignSelf: "flex-start",
            backgroundColor: colors.buttons.tonal.enabled,
            borderRadius: borderRadius.medium,
          }}
        >
          <Pressable onPress={() => setTab("products")}>
            <View
              style={[
                {
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  borderRadius: borderRadius.medium,
                },
                tab === "products" && {
                  backgroundColor: colors.buttons.tonal.hovered,
                },
              ]}
            >
              <Label size="large">Annonser</Label>
            </View>
          </Pressable>
          <Pressable onPress={() => setTab("reviewed")}>
            <View
              style={[
                {
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  borderRadius: borderRadius.medium,
                },
                tab === "reviewed" && {
                  backgroundColor: colors.buttons.tonal.hovered,
                },
              ]}
            >
              <Label size="large">Omdömen</Label>
            </View>
          </Pressable>
        </View>
        {data.user.projects && (
          <View style={{ gap: 16 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Headline size="small">Projekt</Headline>
              <Button
                icon="arrowRight"
                type="text"
                onPress={() => {
                  //TODO: navigate to projects page
                }}
              />
            </View>
            <FlatList
              showsHorizontalScrollIndicator={false}
              data={data.user.projects}
              contentContainerStyle={{ gap: 16 }}
              horizontal
              renderItem={({ item: project }) => (
                <View style={{ minWidth: 272 }}>
                  <ProjectCard project={project} />
                </View>
              )}
            />
          </View>
        )}
      </View>
      <Divider />
      <View style={{ gap: 24 }}>
        <Headline size="small">Annonser</Headline>
        <View
          style={{
            flexDirection: "row",
            gap: 16,
            flexWrap: "wrap",
            paddingBottom: 16,
            marginTop: 16,
          }}
        >
          {productsData?.products.products.map((product) => (
            <AdGrid
              key={product.id}
              imageUri={product.primaryImage?.url}
              title={product.title}
              quantity={product.primaryQuantity ?? 0}
              condition={product.condition}
              account={{
                rating: data.user.rating ?? 3,
                isBusiness: data.user.type === UserType.Business,
                location:
                  product.approximatePlace?.address ??
                  defaultApproximateLocation,
              }}
              price={product.price}
              onPress={() =>
                router.navigate({
                  pathname: "/(app)/product",
                  params: { productId: product.id },
                })
              }
            />
          ))}
        </View>
        <Button
          label="Läs in fler"
          onPress={onShowMore}
          loading={productsLoading}
          disabled={
            productsData &&
            productsData.products.products.length >= productsData.products.total
          }
          style={{ marginTop: 24 }}
        />
      </View>
    </ScreenLayout>
  );
}
