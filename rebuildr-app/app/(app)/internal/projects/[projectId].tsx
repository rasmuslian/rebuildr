import { makeVar, useMutation, useQuery } from "@apollo/client";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Pressable, View } from "react-native";

import { MapPinTypeEnum, OrderProductsEnum } from "@/gql/graphql";
import {
  DELETE_INTERNAL_PROJECT,
  INTERNAL_PROJECT,
  SET_INTERNAL_PROJECT_PICTURE,
  UPDATE_INTERNAL_PROJECT,
} from "@/queries/internal-projects";
import { Button } from "@components/buttons/button";
import { Divider } from "@components/dividers/divider";
import { TextInput } from "@components/forms/textInput";
import { InternalPageLayout } from "@components/internal/internal-page-layout";
import { InternalProjectProducts } from "@components/internal/internal-project-products";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import Map from "@components/maps/map";
import MapThumbnail from "@components/maps/map-thumbnail";
import { Popup } from "@components/popup/popup";
import { SlideInSheet } from "@components/slide-in-sheet/slide-in-sheet";
import { Body, Display, Headline, Label } from "@components/typography/text";
import { borderRadius } from "@constants/sizes";
import { Filter, initialFilterProduct } from "@context/filter-product-context";
import {
  FilterProductScopeProvider,
  OwnFilterScope,
} from "@context/filter-product-scope-context";
import { useImageHandler } from "@hooks/use-image-handler";
import { useScreenType } from "@hooks/useScreenType";

import { ProjectLocationPicker } from "../projects";

const PROJECT_SORTING_OPTIONS = [
  OrderProductsEnum.Latest,
  OrderProductsEnum.Oldest,
  OrderProductsEnum.PriceDesc,
  OrderProductsEnum.PriceAsc,
];

export default function InternalProjectPage() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const scopeRef = useRef<
    { projectId: string; scope: OwnFilterScope } | undefined
  >(undefined);

  if (scopeRef.current?.projectId !== projectId) {
    const initialFilter: Filter = {
      ...initialFilterProduct,
      sorting: OrderProductsEnum.Latest,
    };

    scopeRef.current = {
      projectId,
      scope: {
        filterVar: makeVar<Filter>(initialFilter),
        initialFilter,
        sortingOptions: PROJECT_SORTING_OPTIONS,
        facetProjectId: projectId,
        internalFacets: true,
      },
    };
  }

  return (
    <FilterProductScopeProvider scope={scopeRef.current.scope}>
      <InternalProjectContent projectId={projectId} />
    </FilterProductScopeProvider>
  );
}

function InternalProjectContent({ projectId }: { projectId: string }) {
  const { isDesktop } = useScreenType();
  const [editing, setEditing] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [deleteError, setDeleteError] = useState<string>();
  const { data, loading, refetch } = useQuery<any>(INTERNAL_PROJECT, {
    variables: { projectId },
    skip: !projectId,
    onError: () => router.replace("/internal/projects"),
  });
  const [remove, { loading: removing }] = useMutation(DELETE_INTERNAL_PROJECT);
  const project = data?.internalProject;

  const onDelete = async () => {
    setDeleteError(undefined);

    try {
      await remove({ variables: { projectId } });
      router.replace("/internal/projects");
      return true;
    } catch {
      setDeleteError("Projektet kunde inte raderas. Försök igen.");
      return false;
    }
  };

  if (loading) {
    return (
      <InternalPageLayout contentMaxWidth={1590}>
        <LoadingSpinner />
      </InternalPageLayout>
    );
  }
  if (!project) return null;

  return (
    <InternalPageLayout contentMaxWidth={1590}>
      <View style={{ gap: 24 }}>
        <View style={{ gap: 24 }}>
          <Button
            icon="arrowLeft"
            label="Tillbaka"
            type="text"
            onPress={() => router.navigate("/internal/projects")}
            style={{ alignSelf: "flex-start" }}
          />

          <View
            style={
              isDesktop
                ? { flexDirection: "row", gap: 48, alignItems: "stretch" }
                : { gap: 24 }
            }
          >
            <View style={{ flex: 1, gap: 16 }}>
              {project.projectPicture?.url && (
                <Image
                  source={{ uri: project.projectPicture.url }}
                  style={{
                    width: "100%",
                    height: isDesktop ? 240 : 220,
                    borderRadius: borderRadius.medium,
                  }}
                  contentFit="cover"
                />
              )}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 16,
                  flexWrap: "wrap",
                }}
              >
                <Display size="small" heading={1} style={{ flex: 1 }}>
                  {project.title}
                </Display>
                <Button
                  accessibilityLabel="Redigera"
                  icon="edit"
                  type="text"
                  onPress={() => setEditing(true)}
                />
              </View>
              {!!project.description && (
                <Body size="large" color="secondary">
                  {project.description}
                </Body>
              )}
              {!!project.address && (
                <View>
                  <Label size="medium">Adress</Label>
                  <Body size="medium">{project.address}</Body>
                </View>
              )}
            </View>

            <Pressable style={{ flex: 1 }} onPress={() => setShowMap(true)}>
              <MapThumbnail
                coords={[project.location.lat, project.location.lng]}
                markerType={MapPinTypeEnum.Project}
                style={{ height: isDesktop ? 400 : 240 }}
                cta={
                  <Button
                    label="Visa på karta"
                    type="text"
                    icon="map"
                    style={{ backgroundColor: "white" }}
                    onPress={() => setShowMap(true)}
                  />
                }
              />
            </Pressable>
          </View>
        </View>

        <Divider />

        <InternalProjectProducts projectId={projectId} />
      </View>

      <EditInternalProjectSheet
        project={project}
        open={editing}
        onClose={() => setEditing(false)}
        onDelete={onDelete}
        deleteError={deleteError}
        removing={removing}
        onUpdated={async () => {
          setEditing(false);
          await refetch();
        }}
      />

      <Popup open={showMap} onClose={() => setShowMap(false)} type="full">
        <View style={{ flex: 1, alignItems: "center" }}>
          <View
            style={{
              padding: isDesktop ? 24 : 16,
              width: isDesktop ? "70%" : "100%",
              maxWidth: 1200,
            }}
          >
            <Headline size="small" style={{ marginBottom: 16 }}>
              Plats för {project.title}
            </Headline>
            <Body size="medium" style={{ marginBottom: 24 }}>
              {project.address}
            </Body>
            <Map
              lat={project.location.lat}
              lng={project.location.lng}
              height={isDesktop ? 700 : 500}
            />
          </View>
        </View>
      </Popup>
    </InternalPageLayout>
  );
}

function EditInternalProjectSheet({
  project,
  open,
  onClose,
  onDelete,
  deleteError,
  removing,
  onUpdated,
}: any) {
  const [title, setTitle] = useState(project.title);
  const [description, setDescription] = useState(project.description ?? "");
  const [location, setLocation] = useState<
    { lat: number; lng: number } | undefined
  >(project.location ?? undefined);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [pickedPicture, setPickedPicture] = useState<{
    uri: string;
    mimeType: string;
    file: File;
    name?: string | null;
  }>();
  const { pickImage } = useImageHandler();
  const [update, { loading }] = useMutation(UPDATE_INTERNAL_PROJECT);
  const [setProjectPicture, { loading: uploadingPicture }] = useMutation(
    SET_INTERNAL_PROJECT_PICTURE,
  );

  const onPickPicture = async () => {
    const image = await pickImage();
    if (image) setPickedPicture(image);
  };

  useEffect(() => {
    setTitle(project.title);
    setDescription(project.description ?? "");
    setLocation(project.location ?? undefined);
    setPickedPicture(undefined);
  }, [project.description, project.location, project.title]);

  return (
    <SlideInSheet
      open={open}
      onClose={() => {
        setConfirmingDelete(false);
        onClose();
      }}
      title={confirmingDelete ? "Radera projekt" : "Redigera projekt"}
    >
      {confirmingDelete ? (
        <View style={{ gap: 24 }}>
          <Body size="medium" color="secondary">
            Annonserna tas bort från projektet, men finns kvar i Återbanken.
          </Body>
          {!!deleteError && <Body color="error">{deleteError}</Body>}
          <View style={{ gap: 12 }}>
            <Button
              label="Ja, radera projektet"
              type="danger"
              loading={removing}
              onPress={async () => {
                const deleted = await onDelete();
                if (!deleted) return;
                setConfirmingDelete(false);
              }}
            />
            <Button
              label="Avbryt"
              type="outlined"
              disabled={removing}
              onPress={() => setConfirmingDelete(false)}
            />
          </View>
        </View>
      ) : (
        <View style={{ gap: 24 }}>
          <View style={{ gap: 8 }}>
            <Label size="medium">Omslagsbild</Label>
            {(pickedPicture?.uri || project.projectPicture?.url) && (
              <Image
                source={{
                  uri: pickedPicture?.uri ?? project.projectPicture?.url,
                }}
                style={{
                  width: "100%",
                  height: 180,
                  borderRadius: borderRadius.medium,
                }}
                contentFit="cover"
              />
            )}
            <Button
              label={
                pickedPicture?.uri || project.projectPicture?.url
                  ? "Byt omslagsbild"
                  : "Lägg till omslagsbild"
              }
              type="tonal"
              icon="addImage"
              onPress={onPickPicture}
              disabled={loading || uploadingPicture}
            />
          </View>
          <View style={{ gap: 8 }}>
            <Label size="medium">Projektnamn</Label>
            <TextInput value={title} onChange={setTitle} />
          </View>
          <View style={{ gap: 8 }}>
            <Label size="medium">Beskrivning</Label>
            <TextInput
              value={description}
              onChange={setDescription}
              placeholder="Beskriv projektet (valfritt)"
              multiline
              style={{ height: 144 }}
            />
          </View>
          <ProjectLocationPicker
            address={project.address ?? undefined}
            location={location}
            onSave={setLocation}
          />
          <View style={{ gap: 12 }}>
            <Button
              label="Spara ändringar"
              loading={loading || uploadingPicture}
              disabled={!title.trim() || !location}
              onPress={async () => {
                if (!location) return;
                await update({
                  variables: {
                    input: {
                      id: project.id,
                      title: title.trim(),
                      description: description.trim(),
                      location: { lat: location.lat, lng: location.lng },
                    },
                  },
                });
                if (pickedPicture) {
                  const pictureResult = await setProjectPicture({
                    variables: {
                      projectId: project.id,
                      picture: {
                        mimeType: pickedPicture.mimeType,
                        name: pickedPicture.name,
                      },
                    },
                  });
                  const putUrl = pictureResult.data?.setInternalProjectPicture;
                  if (putUrl) {
                    await fetch(putUrl, {
                      method: "PUT",
                      headers: {
                        "Content-Type": pickedPicture.mimeType,
                        "x-amz-acl": "public-read",
                      },
                      body: pickedPicture.file,
                    });
                  }
                }
                await onUpdated();
              }}
            />
            <Button
              label="Radera projekt"
              icon="trash"
              type="outlined"
              onPress={() => setConfirmingDelete(true)}
            />
          </View>
        </View>
      )}
    </SlideInSheet>
  );
}
