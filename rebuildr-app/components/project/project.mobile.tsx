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
import { Button, ButtonProps } from "@components/buttons/button";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { GET_PROJECT } from "@/queries";
import { useDebounceCallback } from "usehooks-ts";
import { BottomSheet } from "@components/bottom-sheet/bottom-sheet";
import MapThumbnail from "@components/maps/map-thumbnail";
import { MapPinProjectType } from "@/utils/map-pin/map-pin-project-type";
import InteractiveMap from "@components/maps/interactive-map";
import { DeleteProjectButton } from "./delete-project-button";

export const ProjectMobile = () => {
  const { width: screenWidth } = useWindowDimensions();
  const width = (screenWidth - 48) / 2;
  const { onToggleProductHeart } = useLikeProduct();
  const { onToggleProjectHeart } = useLikeProject();
  const { isLoggedIn } = useUser();
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const [searchString, setSearchString] = useState("");
  const [contactExpanded, setContactExpanded] = useState(false);
  const contactAnimation = useRef(new Animated.Value(0)).current;
  const contactRef = useRef(0);
  const [showLocation, setShowLocation] = useState(false);

  const { data, loading } = useQuery<GetProjectQuery, GetProjectQueryVariables>(
    GET_PROJECT,
    {
      variables: { input: { id: projectId }, searchString, isLoggedIn },
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
  const location = project?.approximatePlace;
  const showContactTitle = !!contactName || !!contactEmail || !!contactPhone;

  const ctas: ButtonProps[] = [];
  if (isLoggedIn && !isMyProject && project) {
    ctas.push({
      icon: {
        icon: project.likedByMe ? "heart2Filled" : "heart2",
        color: project.likedByMe ? "link" : undefined,
      },
      onPress: () => {
        onToggleProjectHeart({
          projectId: project.id,
          likedByMe: !!project.likedByMe,
        });
      },
    });
  }

  const onSearch = useDebounceCallback((value) => {
    setSearchString(value);
  }, 400);

  return (
    <ScreenLayout
      headerComponent={
        <SearchBar
          onPressArrow={() =>
            router.canGoBack() ? router.back() : router.navigate("/")
          }
          ctas={ctas}
          placeholder="Vad letar du efter?"
          onChange={onSearch}
        />
      }
      footerBorder
      footerComponent={
        isMyProject ? (
          <View
            style={{
              paddingTop: 24,
              gap: 6,
            }}
          >
            <View
              style={{
                gap: 8,
                flexDirection: "row",
              }}
            >
              <DeleteProjectButton
                style={{ flex: 1 }}
                projectId={projectId}
                onProjectDeleted={() =>
                  router.canGoBack()
                    ? router.back()
                    : router.navigate({
                        pathname: "/project-list/[userId]",
                        params: { userId: project.user.id },
                      })
                }
              />
              <Button
                label="Redigera"
                onPress={() =>
                  router.navigate({
                    pathname: "/(app)/project/edit/[projectId]",
                    params: { projectId, ownerId: project.user.id },
                  })
                }
                style={{ flex: 1 }}
              />
            </View>
          </View>
        ) : undefined
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

          <Pressable onPress={() => setShowLocation(true)}>
            <MapThumbnail
              coords={location ? [location.lat, location.lng] : undefined}
              markerType={MapPinProjectType(me)}
              cta={
                <Button
                  label="Visa på karta"
                  type="text"
                  icon="map"
                  style={{ backgroundColor: "white" }}
                  onPress={() => setShowLocation(true)}
                />
              }
            />
          </Pressable>

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

                  {location && (
                    <View>
                      <Label size="medium">Adress</Label>
                      <Body size="medium">{location.address}</Body>
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
                    heart={project?.user.id !== me?.id}
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
                    soldByQuantity={product.soldByQuantity}
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

      <BottomSheet
        open={showLocation}
        onDismiss={() => setShowLocation(false)}
        title={project?.title}
        name="projectLocation"
        screenHeight
      >
        {project && (
          <InteractiveMap
            productsInput={{ projectId }}
            projectsInput={{ ids: [projectId] }}
            initialCenter={{
              lat: project.approximatePlace.lat,
              lng: project.approximatePlace.lng,
            }}
            style={{ height: 700 }}
          />
        )}
      </BottomSheet>
    </ScreenLayout>
  );
};
