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
import { Map } from "@components/maps/map";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { BottomSheet } from "@components/bottom-sheet/bottom-sheet";

export default function ProjectPage() {
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
  const showLocationRef = useRef<BottomSheetModal>(null);

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
      icon: {
        icon: project.likedByMe ? "heart2Filled" : "heart2",
        size: 18,
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
          ctas={ctsa}
          placeholder="Vad letar du efter?"
          onChange={onSearch}
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
          {location && (
            <Pressable onPress={() => showLocationRef.current?.present()}>
              <Map
                lat={location.lat}
                lng={location.lng}
                interactive={false}
                height={80}
                marker={
                  <Button
                    label="Visa på karta"
                    type="text"
                    icon="map"
                    style={{ backgroundColor: "white" }}
                    onPress={() => showLocationRef.current?.present()}
                  />
                }
              />
            </Pressable>
          )}
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
        ref={showLocationRef}
        title="Plats för avhämtning"
        name="projectLocation"
      >
        <View style={{ marginTop: 16 }}>
          {location && (
            <Map
              lat={location.lat}
              lng={location.lng}
              interactive={false}
              radius={5000}
              height={700}
            />
          )}
        </View>
      </BottomSheet>
    </ScreenLayout>
  );
}
