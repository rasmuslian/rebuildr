import { router, useLocalSearchParams } from "expo-router";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { useQuery } from "@apollo/client";
import {
  GetProjectQuery,
  GetProjectQueryVariables,
  UserType,
} from "@/gql/graphql";
import { useUser } from "@hooks/useUser";
import { Display, Label, Body, Title } from "@components/typography/text";
import { View, Pressable } from "react-native";
import { Avatar } from "@components/avatar/avatar";
import { CompanyBadge } from "@components/badges/company-badge";
import { Divider } from "@components/dividers/divider";
import { AdGrid } from "@components/ad/ad-grid";
import { useLikeProduct } from "@hooks/useLikeProduct";
import { useLikeProject } from "@hooks/useLikeProject";
import { Button, ButtonProps } from "@components/buttons/button";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { GET_PROJECT } from "@/queries";
import TopBar from "@components/navigation/top-bar/top-bar";
import { PickupPositionPopupContent } from "@components/preview-product/pickup-position-popup-content";
import { useState } from "react";
import { Popup } from "@components/popup/popup";
import MapThumbnail from "@components/maps/map-thumbnail";
import { SlideInSheet } from "@components/slide-in-sheet/slide-in-sheet";
import { EditProject } from "./edit-project";
import { MapPinProjectType } from "@/utils/map-pin/map-pin-project-type";

export const ProjectDesktop = () => {
  const { onToggleProductHeart } = useLikeProduct();
  const { onToggleProjectHeart } = useLikeProject();
  const { isLoggedIn } = useUser();
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const [showMapPopup, setShowMapPopup] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const { data, loading } = useQuery<GetProjectQuery, GetProjectQueryVariables>(
    GET_PROJECT,
    {
      variables: { input: { id: projectId }, searchString: "", isLoggedIn },
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
      type: "text",
      onPress: () => setShowEdit(true),
    });
  }

  if (isLoggedIn && !isMyProject && project) {
    ctsa.push({
      icon: {
        icon: project.likedByMe ? "heart2Filled" : "heart2",
        color: project.likedByMe ? "link" : undefined,
      },
      type: "text",
      onPress: () => {
        onToggleProjectHeart({
          projectId: project.id,
          likedByMe: !!project.likedByMe,
        });
      },
    });
  }

  const handleShowMapPopup = () => {
    if (!location || !location) return;
    setShowMapPopup(true);
  };

  return (
    <ScreenLayout headerComponent={<TopBar theme="light" />}>
      {loading ? (
        <LoadingSpinner />
      ) : (
        <View style={{ gap: 24 }}>
          <View style={{ flexDirection: "row", gap: 72 }}>
            <View style={{ flex: 1 }}>
              <View style={{ gap: 16 }}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Display size="small">{project?.title}</Display>
                  {ctsa.map((cta, i) => (
                    <Button {...cta} key={i} />
                  ))}
                </View>
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
                <Body size="medium">{project?.description}</Body>

                <View>
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
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <Pressable onPress={handleShowMapPopup}>
                <MapThumbnail
                  coords={location ? [location.lat, location.lng] : undefined}
                  style={{ height: 400 }}
                  markerType={MapPinProjectType(me?.type)}
                />
              </Pressable>
            </View>
          </View>
          <Divider />
          <View>
            <Title size="medium">Annonser i projektet</Title>
          </View>
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              marginHorizontal: -8,
            }}
          >
            {products.map((product) => {
              return (
                <View
                  style={{
                    flexBasis: "25%",
                    paddingHorizontal: 8,
                    paddingBottom: 16,
                  }}
                  key={product.id}
                >
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
      <SlideInSheet
        open={showEdit}
        title="Redigera projekt"
        onClose={() => setShowEdit(false)}
      >
        <EditProject
          id={projectId}
          onEdited={() => router.dismiss(1)}
          onDeleted={() => {
            if (!me) {
              router.navigate("/");
              return;
            }
            router.replace({
              pathname: "/project-list/[userId]",
              params: { userId: me.id },
            });
          }}
        />
      </SlideInSheet>
      {!!location && (
        <Popup
          open={showMapPopup}
          onClose={() => setShowMapPopup(false)}
          type="full"
        >
          <PickupPositionPopupContent
            address={location.address}
            location={location}
            markerType={MapPinProjectType(me?.type)}
          />
        </Popup>
      )}
    </ScreenLayout>
  );
};
