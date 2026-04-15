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
  mapPinGroup: MapPinGroupsQuery["mapPinGroups"]["mapPinGroups"][number];
};

type Project = ActiveProjectPopupQuery["getProject"];

const projectShowsShortText = (project?: Project) => {
  if (!project) return false;
  return project.description && project.showDetailsOnMap;
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
  <View style={{ flexDirection: "row", alignItems: "center" }}>
    <View style={{ flex: 1, alignItems: "flex-start" }}>
      {onPrevious && (
        <Button onPress={onPrevious} type="text" icon="chevronLeft" />
      )}
    </View>
    <View style={{ flex: 1, alignItems: "center" }}>
      <Body size="small" color="secondary">
        {label ?? `${currentIndex + 1} av ${total}`}
      </Body>
    </View>
    <View style={{ flex: 1, alignItems: "flex-end" }}>
      {onNext && <Button onPress={onNext} type="text" icon="chevronRight" />}
    </View>
  </View>
);

type ProjectHeaderProps = {
  project: Pick<Project, "id" | "title">;
};

const ProjectHeader = ({ project }: ProjectHeaderProps) => (
  <>
    <Label
      style={{ textAlign: "center" }}
      size="small"
      lineBreakMode="tail"
      numberOfLines={1}
    >
      {project.title}
    </Label>
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
  </>
);

export const ActiveMarkerPopup = ({ mapPinGroup }: Props) => {
  const [showProject, setShowProject] = useState(!!mapPinGroup.projectId);
  const [currentIndex, setCurrentIndex] = useState(0);

  const { onToggleProductHeart } = useLikeProduct();
  const { state } = useMapContext();
  const client = useApolloClient();
  const { me } = useUser();

  const productIds = mapPinGroup.productIds ?? [];
  const numberOfProducts = productIds.length;
  const hasMultipleProducts = numberOfProducts > 1;

  const MAX = numberOfProducts - 1;
  const hasNextProduct = currentIndex < MAX;

  const productId = productIds.at(currentIndex);
  const nextProductId = productIds.at(currentIndex + 1);

  useEffect(() => {
    setCurrentIndex(0);
  }, [state.activePin]);

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
    variables: mapPinGroup.projectId
      ? { input: { id: mapPinGroup.projectId } }
      : undefined,
    skip: !mapPinGroup.projectId,
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
    if (!projectData) return;
    setShowProject(!!projectShowsShortText(projectData.getProject));
  }, [projectData]);

  const product = data?.product;
  const project = projectData?.getProject;

  const showPreviousProduct = () => {
    if (currentIndex === 0 && projectShowsShortText(project)) {
      setShowProject(true);
    } else if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const showNextProduct = () =>
    setCurrentIndex((prev) => Math.min(MAX, prev + 1));

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

        <NavigationRow
          currentIndex={0}
          total={numberOfProducts}
          label="Försättsblad"
          onNext={() => setShowProject(false)}
        />

        <Divider />

        <View style={{ gap: 8, marginTop: 6, minHeight: 200 }}>
          <Image
            source={project.user.profilePicture?.url}
            cachePolicy="memory-disk"
            style={{ aspectRatio: 1, borderRadius: borderRadius.medium }}
            contentFit="contain"
          />
          <Body size="small">{project.shortText}</Body>
        </View>
      </View>
    );
  }

  if (!mapPinGroup.productIds.length) {
    return (
      <View style={{ gap: 10 }}>
        {project && <ProjectHeader project={project} />}

        <NavigationRow
          currentIndex={0}
          total={0}
          label="0 av 0"
          onPrevious={project ? () => setShowProject(true) : undefined}
        />

        <Divider />

        <View style={{ gap: 8, marginTop: 6, minHeight: 200 }}>
          {project && (
            <Image
              source={project.user.profilePicture?.url}
              cachePolicy="memory-disk"
              style={{ aspectRatio: 1, borderRadius: borderRadius.medium }}
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
    const previousExist = currentIndex > 0 || !!projectShowsShortText(project);

    return (
      <View style={{ gap: 10 }}>
        {product.project && <ProjectHeader project={product.project} />}

        {hasMultipleProducts && (
          <>
            <NavigationRow
              currentIndex={currentIndex}
              total={numberOfProducts}
              onPrevious={previousExist ? showPreviousProduct : undefined}
              onNext={hasNextProduct ? showNextProduct : undefined}
            />
            <Divider />
          </>
        )}

        <AdGrid
          id={product.id}
          price={product.price}
          condition={product.condition}
          imageUri={product.primaryImage?.url}
          title={product.title}
          heart={product.sellerId !== me?.id}
          liked={!!product.likedByMe}
          account={product.seller}
          onHeartPress={() => {
            onToggleProductHeart({
              productId: product.id,
              likedByMe: !!product.likedByMe,
            });
          }}
        />
      </View>
    );
  }
};
