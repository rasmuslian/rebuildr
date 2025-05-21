import { isLoggedInVar } from "@/apollo/config";
import {
  ProfileProductsQuery,
  ProfileProductsQueryVariables,
  ProfileQuery,
  ProfileQueryVariables,
  ProfileUpdateUserMutation,
  ProfileUpdateUserMutationVariables,
  UserType,
} from "@/gql/graphql";
import { gql, useMutation, useQuery } from "@apollo/client";
import { Button } from "@components/buttons/button";
import { AdGrid } from "@components/cards/ad-grid";
import { UserCard } from "@components/cards/user-card";
import { Divider } from "@components/dividers/divider";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { Header } from "@components/navigation/headers/header";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { Body, Headline, Label } from "@components/typography/text";
import { defaultApproximateLocation } from "@constants/map";
import { borderRadius } from "@constants/sizes";
import { useThemeColor } from "@hooks/useThemeColor";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { FlatList, Pressable } from "react-native-gesture-handler";
import { ProjectCard } from "@components/cards/project-card";
import { CollapsableText } from "@components/collapsable-text/collapsable-text";
import { IconType } from "@icons/icon";
import { TextInput } from "@components/forms/textInput";
import { launchImageLibraryAsync } from "expo-image-picker";
import { useOptimizeImage } from "@hooks/useOptimizeImage";

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
  const [offset, setOffset] = useState(0);

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

  if (data.me?.id && data.me.id !== userId && mode === "edit") {
    router.setParams({ mode: "read" });
  }

  if (mode === "edit") {
    const _description = description ?? data.user.description ?? "";
    return (
      <ScreenLayout
        style={{ gap: 24, marginTop: 24 }}
        headerComponent={
          <Header
            title="Redigera profil"
            onBack={() => router.setParams({ userId, mode: "read" })}
          />
        }
        footerComponent={
          <Button
            label="Spara"
            loading={updateProfileLoading}
            onPress={() => onSaveProfile()}
            style={{ marginBottom: 32 }}
          />
        }
      >
        <UserCard
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
        profilePictureUrl={data.user.profilePicture?.url}
        username={data.user.username}
        numberOfPublishedProducts={data.user.numberOfPublishedProducts}
        numberOfSoldProducts={data.user.numberOfSoldProducts}
      />
      {!!data.user.description && (
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
