import {
  ActiveProductPopupQuery,
  ActiveProductPopupQueryVariables,
  ActiveProjectPopupQuery,
  ActiveProjectPopupQueryVariables,
  MapPinGroupsQuery,
} from "@/gql/graphql";
import { ACTIVE_PROJECT_POPUP, ACTIVE_PRODUCT_POPUP } from "@/queries";
import { useApolloClient, useQuery } from "@apollo/client";
import { Divider } from "@components/dividers/divider";
import { Body, Label } from "@components/typography/text";
import { useMapContext } from "@context/map-context";
import { useLikeProduct } from "@hooks/useLikeProduct";
import { useUser } from "@hooks/useUser";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { Image } from "expo-image";
import { Button } from "@components/buttons/button";
import { borderRadius } from "@constants/sizes";
import { Link } from "expo-router";
import { AdGrid } from "@components/ad/ad-grid";

type Props = {
  pin: MapPinGroupsQuery["mapPinGroups"]["mapPinGroups"][number];
};

export const ActiveMarkerPopup = ({ pin }: Props) => {
  const [showProject, setShowProject] = useState(!!pin.projectId);

  const [currentIndex, setCurrentIndex] = useState(0);
  const { onToggleProductHeart } = useLikeProduct();
  const { state } = useMapContext();

  const client = useApolloClient();
  const { me } = useUser();

  const productIds = pin.productIds ?? [];
  const numberOfProducts = productIds.length;
  const hasMultipleProducts = numberOfProducts > 1;

  useEffect(() => {
    setCurrentIndex(0);
  }, [state.activePin]);

  const MAX = numberOfProducts - 1;

  const hasNextProduct = currentIndex < MAX;

  const productId = productIds.at(currentIndex);
  const nextProductId = productIds.at(currentIndex + 1);

  const showPreviousProduct = () => {
    if (currentIndex === 0 && projectShowsShortText(projectData?.getProject)) {
      setShowProject(true);
    } else if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const showNextProduct = () =>
    setCurrentIndex((prev) => Math.min(MAX, prev + 1));

  const projectShowsShortText = (
    project?: ActiveProjectPopupQuery["getProject"],
  ) => {
    if (!project) return false;
    return project.description && project.showDetailsOnMap;
  };

  const { data } = useQuery<
    ActiveProductPopupQuery,
    ActiveProductPopupQueryVariables
  >(ACTIVE_PRODUCT_POPUP, {
    variables: productId ? { input: { id: productId } } : undefined,
    skip: !productId,
  });
  const { data: projectData } = useQuery<
    ActiveProjectPopupQuery,
    ActiveProjectPopupQueryVariables
  >(ACTIVE_PROJECT_POPUP, {
    variables: pin.projectId ? { input: { id: pin.projectId } } : undefined,
    skip: !pin.projectId,
  });

  useEffect(() => {
    if (!nextProductId) return;

    const cached = client.readQuery<
      ActiveProductPopupQuery,
      ActiveProductPopupQueryVariables
    >({
      query: ACTIVE_PRODUCT_POPUP,
      variables: { input: { id: nextProductId } },
    });

    if (!cached) {
      client.query<ActiveProductPopupQuery, ActiveProductPopupQueryVariables>({
        query: ACTIVE_PRODUCT_POPUP,
        variables: { input: { id: nextProductId } },
      });
    }
  }, [nextProductId]);

  useEffect(() => {
    if (projectData) {
      if (projectShowsShortText(projectData.getProject)) {
        setShowProject(true);
      } else {
        setShowProject(false);
      }
    }
  }, [projectData]);

  const product = data?.product;
  const project = projectData?.getProject;

  if (showProject && project) {
    return (
      <View style={{ gap: 10 }}>
        <Label
          style={{ textAlign: "center" }}
          size="small"
          lineBreakMode="tail"
          numberOfLines={1}
        >
          {project.title}
        </Label>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <View style={{ flex: 1, alignItems: "flex-start" }} />

          <View style={{ flex: 1, alignItems: "center" }}>
            <Body size="small" color="secondary">
              Försättsblad
            </Body>
          </View>

          <View style={{ flex: 1, alignItems: "flex-end" }}>
            <Button
              onPress={() => {
                setShowProject(false);
              }}
              type="text"
              icon="chevronRight"
            />
          </View>
        </View>

        <Divider />

        <View style={{ gap: 8, marginTop: 6, minHeight: 200 }}>
          <Image
            source={project.user.profilePicture?.url}
            style={{
              height: 96,
              width: 128,
              borderRadius: borderRadius.medium,
            }}
            contentFit="contain"
          />
          <Body size="small">{project.shortText}</Body>
        </View>
      </View>
    );
  }

  if (!pin.productIds.length) {
    return (
      <View style={{ gap: 10 }}>
        {project && (
          <Label
            style={{ textAlign: "center" }}
            size="small"
            lineBreakMode="tail"
            numberOfLines={1}
          >
            {project.title}
          </Label>
        )}
        {project && (
          <Link
            style={{ textAlign: "center" }}
            href={{
              pathname: "/project/[projectId]",
              params: { projectId: project.id },
            }}
          >
            <Body size="small" isLink>
              Projektvy
            </Body>
          </Link>
        )}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <View style={{ flex: 1, alignItems: "flex-start" }}>
            {project && (
              <Button
                onPress={() => {
                  setShowProject(true);
                }}
                type="text"
                icon="chevronLeft"
              />
            )}
          </View>

          <View style={{ flex: 1, alignItems: "center" }}>
            <Body size="small" color="secondary">
              {0} av {0}
            </Body>
          </View>

          <View style={{ flex: 1, alignItems: "flex-end" }} />
        </View>
        <Divider />

        <View style={{ gap: 8, marginTop: 6, minHeight: 200 }}>
          {project && (
            <Image
              source={project.user.profilePicture?.url}
              style={{
                height: 96,
                width: 128,
                borderRadius: borderRadius.medium,
              }}
              contentFit="contain"
            />
          )}
          <Body size="small">
            Här finns det för tillfället inga annonser att visa. Vänligen kom
            tillbaka senare.
          </Body>
        </View>
      </View>
    );
  }

  if (product) {
    const previousExist =
      currentIndex > 0 ||
      (projectData && projectShowsShortText(projectData.getProject));
    return (
      <View style={{ gap: 10 }}>
        {product.project && (
          <Label
            style={{ textAlign: "center" }}
            size="small"
            lineBreakMode="tail"
            numberOfLines={1}
          >
            {product.project.title}
          </Label>
        )}

        {product.project && (
          <Link
            style={{ textAlign: "center" }}
            href={{
              pathname: "/project/[projectId]",
              params: { projectId: product.project.id },
            }}
          >
            <Body size="small" isLink>
              Projektvy
            </Body>
          </Link>
        )}

        {hasMultipleProducts && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <View style={{ flex: 1, alignItems: "flex-start" }}>
              {previousExist && (
                <Button
                  onPress={showPreviousProduct}
                  type="text"
                  icon="chevronLeft"
                />
              )}
            </View>

            <View style={{ flex: 1, alignItems: "center" }}>
              <Body size="small" color="secondary">
                {currentIndex + 1} av {numberOfProducts}
              </Body>
            </View>

            <View style={{ flex: 1, alignItems: "flex-end" }}>
              {hasNextProduct && (
                <Button
                  onPress={showNextProduct}
                  type="text"
                  icon="chevronRight"
                />
              )}
            </View>
          </View>
        )}

        {hasMultipleProducts && <Divider />}

        {product && (
          <AdGrid
            id={product.id}
            price={product.price}
            condition={product.condition}
            imageUri={product.primaryImage?.url}
            title={product.title}
            heart={product.sellerId !== me?.id}
            liked={!!product.likedByMe}
            onHeartPress={() => {
              onToggleProductHeart({
                productId: product.id,
                likedByMe: !!product.likedByMe,
              });
            }}
          />
        )}
      </View>
    );
  }
};
