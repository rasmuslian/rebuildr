import { useMutation, useQuery } from "@apollo/client";
import { Button } from "@components/buttons/button";
import { TextInput } from "@components/forms/textInput";
import { InternalPageLayout } from "@components/internal/internal-page-layout";
import { InternalProjectGrid } from "@components/internal/internal-project-grid";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { Search } from "@components/search/search";
import { SectionHeader } from "@components/sections/section-header";
import { SlideInSheet } from "@components/slide-in-sheet/slide-in-sheet";
import { Body, Headline, Label } from "@components/typography/text";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import { useDebounceCallback } from "usehooks-ts";

import {
  CREATE_INTERNAL_PROJECT,
  INTERNAL_PROJECTS,
} from "@/queries/internal-projects";

const PAGE_SIZE = 24;

export default function InternalProjectsPage() {
  const params = useLocalSearchParams<{ action?: string; t?: string }>();
  const handledAction = useRef<string>();
  const [searchString, setSearchString] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const { data, loading, refetch, fetchMore } = useQuery<any>(
    INTERNAL_PROJECTS,
    {
      variables: { input: { searchString }, limit: PAGE_SIZE, offset: 0 },
    },
  );
  const projects = data?.internalProjects.projects ?? [];
  const total = data?.internalProjects.total ?? 0;
  const onSearch = useDebounceCallback(setSearchString, 300);

  useEffect(() => {
    if (params.action !== "create" || !params.t) return;
    if (handledAction.current === params.t) return;
    handledAction.current = params.t;
    setShowCreate(true);
  }, [params.action, params.t]);

  return (
    <InternalPageLayout>
      <View style={{ gap: 32 }}>
        <View style={{ gap: 8 }}>
          <Body size="medium" color="secondary">
            Internlagret
          </Body>
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
                Interna projekt
              </Headline>
              <Body size="large" color="secondary" style={{ maxWidth: 680 }}>
                Samla interna annonser som hör till samma projekt.
              </Body>
            </View>
            <Button
              label="Nytt projekt"
              icon="plus"
              onPress={() => setShowCreate(true)}
            />
          </View>
        </View>

        <Search
          placeholder="Sök bland projekt"
          onChange={onSearch}
          style={{ maxWidth: 633 }}
        />

        {loading && !data ? (
          <LoadingSpinner />
        ) : projects.length ? (
          <View style={{ gap: 16 }}>
            <SectionHeader>Interna projekt</SectionHeader>
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
              {searchString ? "Inga sökträffar" : "Inga interna projekt ännu"}
            </Label>
            <Body size="medium" color="secondary">
              {searchString
                ? "Prova ett annat sökord."
                : "Skapa ett projekt för att samla interna annonser."}
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
  const [create, { loading }] = useMutation(CREATE_INTERNAL_PROJECT);

  const onCreate = async () => {
    await create({
      variables: {
        input: {
          title: title.trim(),
          description: description.trim() || undefined,
        },
      },
    });
    setTitle("");
    setDescription("");
    await onCreated();
  };

  return (
    <SlideInSheet open={open} onClose={onClose} title="Nytt projekt">
      <View style={{ gap: 24 }}>
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
        <Button
          label="Skapa projekt"
          loading={loading}
          disabled={!title.trim()}
          onPress={onCreate}
        />
      </View>
    </SlideInSheet>
  );
}
