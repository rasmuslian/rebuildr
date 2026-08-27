import {
  InternalAdMapPinGroupsQuery,
  InternalAdMapPopupQuery,
  InternalAdMapPopupQueryVariables,
} from "@/gql/graphql";
import {
  INTERNAL_AD_MAP_POPUP,
  INTERNAL_PROJECT_MAP_POPUP,
} from "@/queries/internal-ads";
import { useQuery } from "@apollo/client";
import { AdGrid } from "@components/ad/ad-grid";
import { Button } from "@components/buttons/button";
import { Divider } from "@components/dividers/divider";
import { Body } from "@components/typography/text";
import { borderRadius } from "@constants/sizes";
import { Image } from "expo-image";
import { Link, router } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";

type MapPinGroup =
  InternalAdMapPinGroupsQuery["internalAdMapPinGroups"]["mapPinGroups"][number];

type InternalProjectMapPopupData = {
  internalProject: {
    id: string;
    title: string;
    description?: string | null;
    projectPicture?: { id: string; url: string } | null;
    user: {
      id: string;
      profilePicture?: { id: string; url: string } | null;
    };
  };
};

type InternalProjectMapPopupVariables = {
  projectId: string;
};

type NavigationRowProps = {
  currentIndex: number;
  total: number;
  onPrevious?: () => void;
  onNext?: () => void;
  label?: string;
};

const NavigationRow = ({
  currentIndex,
  total,
  onPrevious,
  onNext,
  label,
}: NavigationRowProps) => (
  <View
    style={{
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "space-between",
    }}
  >
    <Button
      icon="chevronLeft"
      type="text"
      disabled={!onPrevious}
      onPress={onPrevious}
    />
    <Body size="small" color="secondary">
      {label ?? `${currentIndex + 1} av ${total}`}
    </Body>
    <Button
      icon="chevronRight"
      type="text"
      disabled={!onNext}
      onPress={onNext}
    />
  </View>
);

export const InternalActiveMarkerPopup = ({
  mapPinGroup,
}: {
  mapPinGroup: MapPinGroup;
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showProject, setShowProject] = useState(!!mapPinGroup.projectId);
  const productIds = mapPinGroup.productIds;
  const productId = productIds[currentIndex];
  const { data } = useQuery<
    InternalAdMapPopupQuery,
    InternalAdMapPopupQueryVariables
  >(INTERNAL_AD_MAP_POPUP, {
    variables: productId ? { productId } : undefined,
    skip: !productId,
  });
  const { data: projectData } = useQuery<
    InternalProjectMapPopupData,
    InternalProjectMapPopupVariables
  >(INTERNAL_PROJECT_MAP_POPUP, {
    variables: mapPinGroup.projectId
      ? { projectId: mapPinGroup.projectId }
      : undefined,
    skip: !mapPinGroup.projectId,
  });

  useEffect(() => {
    setCurrentIndex(0);
    setShowProject(!!mapPinGroup.projectId);
  }, [mapPinGroup]);

  const product = data?.internalAd;
  const project = projectData?.internalProject;
  const hasPrevious = currentIndex > 0 || !!project;
  const hasNext = currentIndex < productIds.length - 1;

  if (showProject && project) {
    const imageUrl =
      project.projectPicture?.url ?? project.user.profilePicture?.url;

    return (
      <View style={{ gap: 10 }}>
        <Link
          asChild
          href={{
            pathname: "/internal/projects/[projectId]",
            params: { projectId: project.id },
          }}
        >
          <Body
            style={{ textAlign: "center" }}
            size="small"
            numberOfLines={1}
            isLink
          >
            {project.title}
          </Body>
        </Link>
        <NavigationRow
          currentIndex={0}
          total={productIds.length}
          label="Försättsblad"
          onNext={productIds.length ? () => setShowProject(false) : undefined}
        />
        <Divider />
        <View style={{ gap: 8, marginTop: 6, minHeight: 120 }}>
          {!!imageUrl && (
            <Image
              source={imageUrl}
              cachePolicy="memory-disk"
              style={{ aspectRatio: 1, borderRadius: borderRadius.medium }}
              contentFit="cover"
            />
          )}
          {!!project.description && (
            <Body size="small">{project.description}</Body>
          )}
        </View>
      </View>
    );
  }

  if (!product) return null;

  return (
    <View style={{ gap: 10 }}>
      {!!project && (
        <Link
          asChild
          href={{
            pathname: "/internal/projects/[projectId]",
            params: { projectId: project.id },
          }}
        >
          <Body
            style={{ textAlign: "center" }}
            size="small"
            numberOfLines={1}
            isLink
          >
            {project.title}
          </Body>
        </Link>
      )}
      {(productIds.length > 1 || project) && (
        <>
          <NavigationRow
            currentIndex={currentIndex}
            total={productIds.length}
            onPrevious={
              hasPrevious
                ? () => {
                    if (currentIndex === 0) setShowProject(true);
                    else setCurrentIndex((index) => index - 1);
                  }
                : undefined
            }
            onNext={
              hasNext ? () => setCurrentIndex((index) => index + 1) : undefined
            }
          />
          <Divider />
        </>
      )}
      <AdGrid
        id={product.id}
        title={product.title}
        price={product.price}
        hidePrice
        condition={product.condition}
        imageUri={product.primaryImage?.url}
        soldByQuantity={product.soldByQuantity}
        status={product.status}
        onPress={() =>
          router.navigate({
            pathname: "/internal/[productId]",
            params: { productId: product.id },
          })
        }
      />
    </View>
  );
};
