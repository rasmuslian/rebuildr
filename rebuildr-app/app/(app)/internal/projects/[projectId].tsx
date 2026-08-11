import { useMutation, useQuery } from "@apollo/client";
import { AdGridSection } from "@components/ad-grid-section/ad-grid-section";
import { Button } from "@components/buttons/button";
import { TextInput } from "@components/forms/textInput";
import { InternalPageLayout } from "@components/internal/internal-page-layout";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { SlideInSheet } from "@components/slide-in-sheet/slide-in-sheet";
import { Body, Headline, Label } from "@components/typography/text";
import { primitives } from "@constants/colors";
import { borderRadius } from "@constants/sizes";
import { useScreenType } from "@hooks/useScreenType";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Pressable, View } from "react-native";

import {
  DELETE_INTERNAL_PROJECT,
  INTERNAL_PROJECT,
  UPDATE_INTERNAL_PROJECT,
} from "@/queries/internal-projects";

export default function InternalProjectPage() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const { isDesktop } = useScreenType();
  const [editing, setEditing] = useState(false);
  const { data, loading, refetch } = useQuery<any>(INTERNAL_PROJECT, {
    variables: { projectId },
    skip: !projectId,
    onError: () => router.replace("/internal/projects"),
  });
  const [remove, { loading: removing }] = useMutation(DELETE_INTERNAL_PROJECT);
  const project = data?.internalProject;

  const onDelete = () => {
    Alert.alert(
      "Radera projekt?",
      "Annonserna tas bort från projektet, men finns kvar i Internlagret.",
      [
        { text: "Avbryt", style: "cancel" },
        {
          text: "Radera",
          style: "destructive",
          onPress: async () => {
            await remove({ variables: { projectId } });
            router.replace("/internal/projects");
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <InternalPageLayout>
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
    <InternalPageLayout>
      <View style={{ gap: isDesktop ? 48 : 32 }}>
        <View style={{ gap: 24 }}>
          <Pressable onPress={() => router.navigate("/internal/projects")}>
            <Body size="medium" color="link">
              Internlagret / Interna projekt
            </Body>
          </Pressable>

          <View
            style={
              isDesktop
                ? { flexDirection: "row", gap: 48, alignItems: "stretch" }
                : { gap: 24 }
            }
          >
            <View
              style={{
                flex: 1,
                gap: 24,
                justifyContent: "space-between",
                minHeight: isDesktop ? 300 : undefined,
                padding: isDesktop ? 32 : 24,
                backgroundColor: primitives.neutrals100,
                borderRadius: borderRadius.medium,
              }}
            >
              <View style={{ gap: 16 }}>
                <Body size="small" color="secondary">
                  Internt projekt
                </Body>
                <Headline size="small" heading={1}>
                  {project.title}
                </Headline>
                {!!project.description && (
                  <Body size="large" color="secondary">
                    {project.description}
                  </Body>
                )}
              </View>
              <View style={{ gap: 16 }}>
                <Body size="medium" color="secondary">
                  {project.products.length} interna annonser
                </Body>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <Button
                    label="Redigera"
                    icon="edit"
                    type="outlined"
                    onPress={() => setEditing(true)}
                  />
                  <Button
                    label="Radera"
                    type="tonal"
                    loading={removing}
                    onPress={onDelete}
                  />
                </View>
              </View>
            </View>

            {project.projectPicture?.url && (
              <Image
                source={{ uri: project.projectPicture.url }}
                style={{
                  flex: 1,
                  minHeight: isDesktop ? 300 : 220,
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
            <Label size="large">Projektet har inga annonser ännu</Label>
            <Body size="medium" color="secondary">
              Välj projektet nästa gång du skapar eller redigerar en intern
              annons.
            </Body>
          </View>
        )}
      </View>

      <EditInternalProjectSheet
        project={project}
        open={editing}
        onClose={() => setEditing(false)}
        onUpdated={async () => {
          setEditing(false);
          await refetch();
        }}
      />
    </InternalPageLayout>
  );
}

function EditInternalProjectSheet({ project, open, onClose, onUpdated }: any) {
  const [title, setTitle] = useState(project.title);
  const [description, setDescription] = useState(project.description ?? "");
  const [update, { loading }] = useMutation(UPDATE_INTERNAL_PROJECT);

  useEffect(() => {
    setTitle(project.title);
    setDescription(project.description ?? "");
  }, [project.description, project.title]);

  return (
    <SlideInSheet open={open} onClose={onClose} title="Redigera projekt">
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
        <Button
          label="Spara ändringar"
          loading={loading}
          disabled={!title.trim()}
          onPress={async () => {
            await update({
              variables: {
                input: {
                  id: project.id,
                  title: title.trim(),
                  description: description.trim(),
                },
              },
            });
            await onUpdated();
          }}
        />
      </View>
    </SlideInSheet>
  );
}
