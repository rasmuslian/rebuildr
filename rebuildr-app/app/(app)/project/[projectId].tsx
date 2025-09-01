import React, { useState, useRef } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { useQuery } from "@apollo/client";
import {
  GetProjectQuery,
  GetProjectQueryVariables,
  UserType,
} from "@/gql/graphql";
import { useUser } from "@hooks/useUser";
import { SearchBar } from "@components/search/search-bar";
import { Display, Label, Body } from "@components/typography/text";
import { View, useWindowDimensions, Animated, Pressable } from "react-native";
import { Avatar } from "@components/avatar/avatar";
import { CompanyBadge } from "@components/badges/company-badge";
import { Divider } from "@components/dividers/divider";
import { AdGrid } from "@components/ad/ad-grid";
import { useLikeProduct } from "@hooks/useLikeProduct";
import { useLikeProject } from "@hooks/useLikeProject";
import { ButtonProps } from "@components/buttons/button";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { GET_PROJECT } from "@/queries";

export default function ProjectPage() {
  const { width: screenWidth } = useWindowDimensions();
  const width = (screenWidth - 48) / 2;
  const { onToggleProductHeart } = useLikeProduct();
  const { onToggleProjectHeart } = useLikeProject();
  const { isLoggedIn } = useUser();
  const { projectId } = useLocalSearchParams<{ projectId: string }>();

  const [contactExpanded, setContactExpanded] = useState(false);
  const contactAnimation = useRef(new Animated.Value(0)).current;
  const contactRef = useRef(0);

  const { data, loading } = useQuery<GetProjectQuery, GetProjectQueryVariables>(
    GET_PROJECT,
    {
      variables: { input: { id: projectId }, isLoggedIn },
      onError: () => router.navigate("/"),
      skip: !projectId,
    },
  );

  const project = data?.getProject;
  const me = data?.me;
  const numberOfProducts = project?.products.length ?? 0;
  const user = project?.user;
  const products = project?.products ?? [];
  const isMyProject = user && user.id === me?.id;

  const contactName = project?.contactName;
  const contactEmail = project?.contactEmail;
  const contactPhone = project?.contactPhone;
  const address = project?.address;
  const showContactTitle = !!contactName || !!contactEmail || !!contactPhone;

  const ctsa: ButtonProps[] = [];
  if (isMyProject) {
    ctsa.push({
      icon: "edit",
      onPress: () =>
        router.navigate({
          pathname: "/(app)/project/edit/[projectId]",
          params: { projectId, ownerId: project.user.id },
        }),
    });
  }

  if (isLoggedIn && !isMyProject && project) {
    ctsa.push({
      icon: project.likedByMe ? "heartFilled" : "heart",
      onPress: () => {
        onToggleProjectHeart({
          projectId: project.id,
          likedByMe: !!project.likedByMe,
        });
      },
    });
  }

  return (
    <ScreenLayout
      headerComponent={
        <SearchBar
          onPressArrow={() => {
            router.canGoBack() ? router.back() : router.navigate("/");
          }}
          ctas={ctsa}
          placeholder="Vad letar du efter?"
        />
      }
    >
      {loading ? (
        <LoadingSpinner />
      ) : (
        <View style={{ gap: 24 }}>
          <View style={{ flexDirection: "row", gap: 16 }}>
            <Avatar
              size={40}
              imageUrl={user?.profilePicture?.url}
              placeholder={user?.type}
            />
            <View style={{ gap: 2 }}>
              <Label size="large">{user?.username}</Label>

              <View style={{ flexDirection: "row", gap: 4 }}>
                {user?.type === UserType.Business && <CompanyBadge />}
                <Body size="small">
                  {numberOfProducts} annonser i projektet:
                </Body>
              </View>
            </View>
          </View>

          <Display size="small">{project?.title}</Display>

          <View style={{ gap: contactExpanded ? 16 : 8 }}>
            <Body
              size="medium"
              numberOfLines={!contactExpanded ? 2 : undefined}
              ellipsizeMode={!contactExpanded ? "tail" : undefined}
            >
              {project?.description}
            </Body>

            <Animated.View
              style={{ height: contactAnimation, overflow: "hidden" }}
            >
              <View
                onLayout={(e) => {
                  contactRef.current = e.nativeEvent.layout.height;
                  if (contactExpanded)
                    contactAnimation.setValue(contactRef.current);
                }}
              >
                <View style={{ gap: 16 }}>
                  <View>
                    {showContactTitle && (
                      <Label size="medium">Alternativ kontakt</Label>
                    )}
                    {contactName && (
                      <Body size="medium">Namn: {contactName}</Body>
                    )}
                    {contactEmail && (
                      <Body size="medium">Email: {contactEmail}</Body>
                    )}
                    {contactPhone && (
                      <Body size="medium">Telefon: {contactPhone}</Body>
                    )}
                  </View>

                  {address && (
                    <View>
                      <Label size="medium">Adress</Label>
                      <Body size="medium">{address}</Body>
                    </View>
                  )}
                </View>
              </View>
            </Animated.View>

            <Pressable
              onPress={() => {
                const toValue = contactExpanded ? 0 : contactRef.current;
                setContactExpanded((prev) => !prev);

                Animated.timing(contactAnimation, {
                  toValue,
                  duration: 300,
                  useNativeDriver: false,
                }).start();
              }}
            >
              <Body size="medium" color="link">
                {contactExpanded ? "Visa mindre" : "Visa hela beskrivningen"}
              </Body>
            </Pressable>
          </View>

          <Divider />

          <View
            style={{
              flexDirection: "row",
              gap: 16,
              flexWrap: "wrap",
              paddingBottom: 16,
            }}
          >
            {products.map((product) => {
              return (
                <View style={{ width }} key={product.id}>
                  <AdGrid
                    id={product.id}
                    imageUri={product.primaryImage?.url}
                    liked={!!product.likedByMe}
                    heart={project?.user.id != me?.id}
                    quantity={product.primaryQuantity}
                    quantityUnit={product.primaryUnit}
                    condition={product.condition}
                    account={{
                      rating: user?.rating,
                      type: user?.type,
                      location: product.approximatePlace?.address,
                    }}
                    title={product.title}
                    price={product.price}
                    status={product.status}
                    onHeartPress={() => {
                      onToggleProductHeart({
                        productId: product.id,
                        likedByMe: !!product.likedByMe,
                      });
                    }}
                  />
                </View>
              );
            })}
          </View>
        </View>
      )}
    </ScreenLayout>
  );
}
