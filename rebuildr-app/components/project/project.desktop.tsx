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
import { ButtonProps } from "@components/buttons/button";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { GET_PROJECT } from "@/queries";
import { Map } from "@components/maps/map";
import { mapDefaultApproximateRadiusLarge } from "@constants/map";
import TopBar from "@components/navigation/top-bar/top-bar";
import { PickupPositionPopupContent } from "@components/preview-product/pickup-position-popup-content";
import { usePopupContext } from "@context/popup-context";

export const ProjectDesktop = () => {
  const { onToggleProductHeart } = useLikeProduct();
  const { onToggleProjectHeart } = useLikeProject();
  const { isLoggedIn } = useUser();
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const { setVisible: setPopupVisible, setContent } = usePopupContext();

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

  const showMapPopup = () => {
    if (!location || !location) return;
    setContent(
      <PickupPositionPopupContent
        address={location.address}
        location={location}
      />,
    );
    setPopupVisible("full");
  };

  return (
    <ScreenLayout headerComponent={<TopBar theme="light" />}>
      {loading ? (
        <LoadingSpinner />
      ) : (
        <View style={{ gap: 24 }}>
          <View style={{ flexDirection: "row", gap: 24 }}>
            <View style={{ flex: 1 }}>
              <View style={{ gap: 16 }}>
                <Display size="small">{project?.title}</Display>
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
              {location && (
                <Pressable onPress={showMapPopup}>
                  <Map
                    lat={location.lat}
                    lng={location.lng}
                    interactive={false}
                    height={400}
                    radius={mapDefaultApproximateRadiusLarge}
                  />
                </Pressable>
              )}
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
    </ScreenLayout>
  );
};
