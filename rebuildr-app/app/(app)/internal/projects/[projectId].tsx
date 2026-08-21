import { useMutation, useQuery } from "@apollo/client";
import { AdGridSection } from "@components/ad-grid-section/ad-grid-section";
import { Button } from "@components/buttons/button";
import { TextInput } from "@components/forms/textInput";
import { InternalPageLayout } from "@components/internal/internal-page-layout";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { SlideInSheet } from "@components/slide-in-sheet/slide-in-sheet";
import { Body, Headline, Label } from "@components/typography/text";
import { borderRadius } from "@constants/sizes";
import { useScreenType } from "@hooks/useScreenType";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";

import { ProjectLocationPicker } from "../projects";

import {
  DELETE_INTERNAL_PROJECT,
  INTERNAL_PROJECT,
  UPDATE_INTERNAL_PROJECT,
} from "@/queries/internal-projects";

export default function InternalProjectPage() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const { isDesktop } = useScreenType();
  const [editing, setEditing] = useState(false);
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

  const products = project.products.map((product: any) => ({
    id: product.id,
    title: product.title,
    imageUri: product.primaryImage?.url,
    quantity: product.primaryQuantity,
    quantityUnit: product.primaryUnit,
    condition: product.condition,
    price: product.price,
    hidePrice: true,
    soldByQuantity: product.soldByQuantity,
    status: product.status,
    heart: false,
    onPress: () =>
      router.navigate({
        pathname: "/internal/[productId]",
        params: { productId: product.id },
      }),
  }));

  return (
    <InternalPageLayout contentMaxWidth={1590}>
      <View style={{ gap: isDesktop ? 48 : 32 }}>
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
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 16,
                  flexWrap: "wrap",
                }}
              >
                <Headline size="small" heading={1} style={{ flex: 1 }}>
                  {project.title}
                </Headline>
                <Button
                  label="Redigera"
                  icon="edit"
                  type="outlined"
                  onPress={() => setEditing(true)}
                />
              </View>
              {!!project.description && (
                <Body size="large" color="secondary">
                  {project.description}
                </Body>
              )}
              <Body size="medium" color="secondary">
                {project.products.length} annonser
              </Body>
            </View>

            {project.projectPicture?.url && (
              <Image
                source={{ uri: project.projectPicture.url }}
                style={{
                  flex: 1,
                  minHeight: isDesktop ? 240 : 220,
                  borderRadius: borderRadius.medium,
                }}
                contentFit="cover"
              />
            )}
          </View>
        </View>

        {products.length ? (
          <AdGridSection header="Annonser i projektet" products={products} />
        ) : (
          <View style={{ gap: 8, maxWidth: 560 }}>
            <Headline size="small">Annonser i projektet</Headline>
            <Body size="medium" color="secondary">
              Projektet har inga annonser ännu. Välj projektet nästa gång du
              skapar eller redigerar en annons.
            </Body>
          </View>
        )}
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
  const [update, { loading }] = useMutation(UPDATE_INTERNAL_PROJECT);

  useEffect(() => {
    setTitle(project.title);
    setDescription(project.description ?? "");
    setLocation(project.location ?? undefined);
  }, [project.description, project.title]);

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
              loading={loading}
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
