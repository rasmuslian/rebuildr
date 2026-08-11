import { gql, useLazyQuery, useQuery } from "@apollo/client";
import { FilterChip } from "@components/chips/filterChip";
import { CreateProjectInline } from "@components/project/create-project-inline";
import { Body, Display, Headline } from "@components/typography/text";
import { useThemeColor } from "@hooks/useThemeColor";
import { useState } from "react";
import { router } from "expo-router";
import { View } from "react-native";
import { ProductFields } from "./types";

const PRODUCT_BOTTOM_SHEET_PROJECT_MY_PROJECTS = gql`
  query ProductBottomSheetProjectMyProjects($internalMode: Boolean!) {
    myProjects @skip(if: $internalMode) {
      id
      title
    }
    internalProjects(input: {}) @include(if: $internalMode) {
      projects {
        id
        title
      }
    }
  }
`;
const PRODUCT_BOTTOM_SHEET_PROJECT_GET_PROJECT = gql`
  query ProductBottomSheetProjectGetProject(
    $input: GetProjectInput!
    $projectId: ID!
    $internalMode: Boolean!
  ) {
    getProject(input: $input) @skip(if: $internalMode) {
      id
      title
      contactName
      contactEmail
      contactPhone
      address
      location {
        lat
        lng
      }
      approximatePlace {
        lat
        lng
        address
      }
    }
    internalProject(projectId: $projectId) @include(if: $internalMode) {
      id
      title
    }
  }
`;

export const NEW_PROJECT_ID = "NEW_PROJECT_ID";

type Props = {
  product: ProductFields;
  update: (product: Partial<ProductFields>) => void;
  internalMode?: boolean;
};

export const ProjectChips = ({
  product,
  update,
  internalMode = false,
}: Props) => {
  const [showCreate, setShowCreate] = useState(false);
  const colors = useThemeColor();

  //unselected project chips use the same grey tonal fill as the cards on the
  //details step (e.g. "Tillåt delköp") instead of the default outlined chip
  const unselectedChipStyle = {
    backgroundColor: colors.buttons.tonal.disabled,
    borderWidth: 0,
    paddingHorizontal: 8,
  };

  const { data, refetch } = useQuery<any>(
    PRODUCT_BOTTOM_SHEET_PROJECT_MY_PROJECTS,
    { variables: { internalMode } },
  );
  const [getProject] = useLazyQuery<any>(
    PRODUCT_BOTTOM_SHEET_PROJECT_GET_PROJECT,
  );

  //only shown to users who already have projects (one-tap reuse + address
  //autofill). Everyone else gets their first project via the post-publish
  //suggestion ("N annonser på samma adress — samla dem i ett projekt?"),
  //which carries the explanation at the moment it makes sense.
  const myProjects = internalMode
    ? ((data as any)?.internalProjects?.projects ?? [])
    : (data?.myProjects ?? []);
  const selectedId =
    product.project?.id !== NEW_PROJECT_ID ? product.project?.id : undefined;

  const onSelect = async (id: string) => {
    const { data: projectData } = await getProject({
      variables: { input: { id }, projectId: id, internalMode },
    });
    const project = internalMode
      ? (projectData as any)?.internalProject
      : projectData?.getProject;
    if (!project) return;
    update({
      noProject: false,
      project: { id },
      ...(internalMode
        ? {}
        : {
            address: project.address,
            location: project.location,
            approximatePlace: project.approximatePlace,
          }),
    });
  };

  const onDeselect = () => {
    update({ noProject: true, project: undefined });
  };

  const onProjectCreated = async (id: string) => {
    await refetch();
    setShowCreate(false);
    await onSelect(id);
  };

  return (
    <View style={{ gap: 8, marginBottom: 8 }}>
      <Display size="small">Projekt</Display>
      <Headline size="small">Hör annonsen till ett projekt?</Headline>
      <Body size="medium">
        {internalMode
          ? "Valfritt — samla annonser som hör till samma interna projekt."
          : "Valfritt — adressen fylls i automatiskt och köpare ser fler annonser från samma projekt."}
      </Body>
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 8,
          marginTop: 8,
        }}
      >
        {myProjects.map((p: { id: string; title: string }) => (
          <FilterChip
            key={p.id}
            label={p.title}
            selected={selectedId === p.id}
            style={selectedId === p.id ? undefined : unselectedChipStyle}
            onPress={() =>
              selectedId === p.id ? onDeselect() : onSelect(p.id)
            }
          />
        ))}
        {!internalMode && (
          <FilterChip
            label="+ Nytt projekt"
            selected={showCreate}
            style={showCreate ? undefined : unselectedChipStyle}
            onPress={() => setShowCreate(!showCreate)}
          />
        )}
      </View>
      {internalMode && !myProjects.length && (
        <View style={{ gap: 8, marginTop: 4 }}>
          <Body size="small" color="secondary">
            Du har inga interna projekt ännu.
          </Body>
          <Body
            size="small"
            color="link"
            isLink
            onPress={() =>
              router.navigate({
                pathname: "/internal/projects",
                params: { action: "create", t: Date.now().toString() },
              })
            }
          >
            Skapa ett internt projekt
          </Body>
        </View>
      )}
      {!internalMode && showCreate && (
        <View style={{ marginTop: 8 }}>
          <CreateProjectInline
            onCreate={onProjectCreated}
            prefillAddress={product.address}
            prefillLocation={product.location}
          />
        </View>
      )}
    </View>
  );
};
