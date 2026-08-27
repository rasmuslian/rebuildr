import { useMutation, useQuery } from "@apollo/client";
import { Image } from "expo-image";

import { Button } from "@components/buttons/button";
import { TextInput } from "@components/forms/textInput";
import { EditPickup } from "@components/upsert-product/edit-pickup";
import { InternalPageLayout } from "@components/internal/internal-page-layout";
import { InternalProjectGrid } from "@components/internal/internal-project-grid";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { SlideInSheet } from "@components/slide-in-sheet/slide-in-sheet";
import { Body, Headline, Label } from "@components/typography/text";
import { borderRadius } from "@constants/sizes";
import { useImageHandler } from "@hooks/use-image-handler";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import { useDebounceCallback } from "usehooks-ts";

import {
  CREATE_INTERNAL_PROJECT,
  INTERNAL_PROJECTS,
  SET_INTERNAL_PROJECT_PICTURE,
} from "@/queries/internal-projects";

const PAGE_SIZE = 24;

export default function InternalProjectsPage() {
  const params = useLocalSearchParams<{ action?: string; t?: string }>();
  const handledAction = useRef<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchString, setSearchString] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const { data, previousData, loading, refetch, fetchMore } = useQuery<any>(
    INTERNAL_PROJECTS,
    {
      variables: { input: { searchString }, limit: PAGE_SIZE, offset: 0 },
    },
  );
  const visibleProjects =
    data?.internalProjects ?? previousData?.internalProjects;
  const projects = visibleProjects?.projects ?? [];
  const total = visibleProjects?.total ?? 0;
  const onSearch = useDebounceCallback(setSearchString, 300);

  useEffect(() => {
    if (params.action !== "create" || !params.t) return;
    if (handledAction.current === params.t) return;
    handledAction.current = params.t;
    setShowCreate(true);
  }, [params.action, params.t]);

  return (
    <InternalPageLayout contentMaxWidth={1590}>
      <View style={{ gap: 32 }}>
        <Button
          icon="arrowLeft"
          label="Tillbaka"
          type="text"
          onPress={() => router.navigate("/internal")}
          style={{ alignSelf: "flex-start" }}
        />
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 16,
          }}
        >
          <View style={{ gap: 8, flex: 1 }}>
            <Headline size="small" heading={1}>
              Projekt
            </Headline>
            <Body size="large" color="secondary" style={{ maxWidth: 680 }}>
              Samla annonser som hör till samma projekt.
            </Body>
          </View>
          <Button
            label="Nytt projekt"
            icon="plus"
            onPress={() => setShowCreate(true)}
          />
        </View>

        <View style={{ maxWidth: 633 }}>
          <TextInput
            value={searchQuery}
            placeholder="Sök på projektnamn eller beskrivning"
            onChange={(value) => {
              setSearchQuery(value);
              onSearch(value);
            }}
          />
        </View>

        {loading && !visibleProjects ? (
          <LoadingSpinner />
        ) : projects.length ? (
          <View>
            <InternalProjectGrid
              projects={projects}
              onProjectPress={(projectId) =>
                router.navigate({
                  pathname: "/internal/projects/[projectId]",
                  params: { projectId },
                } as any)
              }
            />
            {projects.length < total && (
              <Button
                label="Läs in fler"
                onPress={() =>
                  fetchMore({
                    variables: {
                      offset: Math.ceil(projects.length / PAGE_SIZE),
                    },
                  })
                }
                loading={loading}
                style={{ marginTop: 16 }}
              />
            )}
          </View>
        ) : (
          <View style={{ gap: 8, maxWidth: 560 }}>
            <Label size="large">
              {searchString ? "Inga sökträffar" : "Inga projekt ännu"}
            </Label>
            <Body size="medium" color="secondary">
              {searchString
                ? "Prova ett annat sökord."
                : "Skapa ett projekt för att samla annonser."}
            </Body>
            {!searchString && (
              <Button
                label="Skapa projekt"
                type="outlined"
                onPress={() => setShowCreate(true)}
                style={{ alignSelf: "flex-start", marginTop: 8 }}
              />
            )}
          </View>
        )}
      </View>

      <CreateInternalProjectSheet
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={async () => {
          setShowCreate(false);
          await refetch();
        }}
      />
    </InternalPageLayout>
  );
}

export function CreateInternalProjectSheet({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState<{ lat: number; lng: number }>();
  const [pickedPicture, setPickedPicture] = useState<{
    uri: string;
    mimeType: string;
    file: File;
    name?: string | null;
  }>();
  const { pickImage } = useImageHandler();
  const [create, { loading }] = useMutation(CREATE_INTERNAL_PROJECT);
  const [setProjectPicture, { loading: uploadingPicture }] = useMutation(
    SET_INTERNAL_PROJECT_PICTURE,
  );

  const onPickPicture = async () => {
    const image = await pickImage();
    if (image) setPickedPicture(image);
  };

  const onCreate = async () => {
    if (!location) return;
    const result = await create({
      variables: {
        input: {
          title: title.trim(),
          description: description.trim() || undefined,
          location,
        },
      },
    });
    const projectId = result.data?.createInternalProject.id;
    if (projectId && pickedPicture) {
      const pictureResult = await setProjectPicture({
        variables: {
          projectId,
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
    setTitle("");
    setDescription("");
    setLocation(undefined);
    setPickedPicture(undefined);
    await onCreated();
  };

  return (
    <SlideInSheet open={open} onClose={onClose} title="Nytt projekt">
      <View style={{ gap: 24 }}>
        <View style={{ gap: 8 }}>
          <Label size="medium">Omslagsbild</Label>
          {!!pickedPicture && (
            <Image
              source={{ uri: pickedPicture.uri }}
              style={{
                width: "100%",
                height: 180,
                borderRadius: borderRadius.medium,
              }}
              contentFit="cover"
            />
          )}
          <Button
            label={pickedPicture ? "Byt omslagsbild" : "Lägg till omslagsbild"}
            type="tonal"
            icon="addImage"
            onPress={onPickPicture}
            disabled={loading || uploadingPicture}
          />
        </View>
        <View style={{ gap: 8 }}>
          <Label size="medium">Projektnamn</Label>
          <TextInput
            value={title}
            onChange={setTitle}
            placeholder="Ge projektet ett namn"
          />
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
        <ProjectLocationPicker location={location} onSave={setLocation} />
        <Button
          label="Skapa projekt"
          loading={loading || uploadingPicture}
          disabled={!title.trim() || !location}
          onPress={onCreate}
        />
      </View>
    </SlideInSheet>
  );
}

export function ProjectLocationPicker({
  address,
  location,
  onSave,
}: {
  address?: string;
  location?: { lat: number; lng: number };
  onSave: (location: { lat: number; lng: number }) => void;
}) {
  const [editing, setEditing] = useState(!location);

  useEffect(() => {
    if (location) setEditing(false);
  }, [location]);

  if (!editing && location) {
    return (
      <View style={{ gap: 8 }}>
        <View style={{ gap: 4 }}>
          <Label size="medium">Plats</Label>
          <Body size="medium" color="secondary">
            {address ?? "Plats vald på kartan"}
          </Body>
        </View>
        <Button
          label="Ändra plats"
          type="outlined"
          onPress={() => setEditing(true)}
          style={{ alignSelf: "flex-start" }}
        />
      </View>
    );
  }

  return (
    <EditPickup
      address={address}
      location={location}
      onSave={(lat, lng) => {
        onSave({ lat, lng });
        setEditing(false);
      }}
      title="Plats"
      addressDescription="Välj projektets plats så att dess annonser blir enklare att hitta i Återbanken."
      saveLabel="Spara plats"
    />
  );
}
