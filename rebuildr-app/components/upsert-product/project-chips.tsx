import { gql, useLazyQuery, useQuery } from "@apollo/client";
import { FilterChip } from "@components/chips/filterChip";
import { CreateProjectInline } from "@components/project/create-project-inline";
import { Body, Headline } from "@components/typography/text";
import { useState } from "react";
import { View } from "react-native";
import {
  ProductBottomSheetProjectGetProjectQuery,
  ProductBottomSheetProjectGetProjectQueryVariables,
  ProductBottomSheetProjectMyProjectsQuery,
} from "@/gql/graphql";
import { ProductFields } from "./types";

const PRODUCT_BOTTOM_SHEET_PROJECT_MY_PROJECTS = gql`
  query ProductBottomSheetProjectMyProjects {
    myProjects {
      id
      title
    }
  }
`;
const PRODUCT_BOTTOM_SHEET_PROJECT_GET_PROJECT = gql`
  query ProductBottomSheetProjectGetProject($input: GetProjectInput!) {
    getProject(input: $input) {
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
  }
`;

export const NEW_PROJECT_ID = "NEW_PROJECT_ID";

type Props = {
  product: ProductFields;
  update: (product: Partial<ProductFields>) => void;
};

/**
 * Compact, optional project linking. Replaces the old blocking "project" wizard
 * step: only rendered for users who already have projects, never required.
 * Selecting a project auto-fills the product's pickup address.
 */
export const ProjectChips = ({ product, update }: Props) => {
  const [showCreate, setShowCreate] = useState(false);

  const { data, refetch } = useQuery<ProductBottomSheetProjectMyProjectsQuery>(
    PRODUCT_BOTTOM_SHEET_PROJECT_MY_PROJECTS,
  );
  const [getProject] = useLazyQuery<
    ProductBottomSheetProjectGetProjectQuery,
    ProductBottomSheetProjectGetProjectQueryVariables
  >(PRODUCT_BOTTOM_SHEET_PROJECT_GET_PROJECT);

  //only shown to users who already have projects (one-tap reuse + address
  //autofill). Everyone else gets their first project via the post-publish
  //suggestion ("N annonser på samma adress — samla dem i ett projekt?"),
  //which carries the explanation at the moment it makes sense.
  const myProjects = data?.myProjects ?? [];
  if (!myProjects.length) {
    return null;
  }

  const selectedId =
    product.project?.id !== NEW_PROJECT_ID ? product.project?.id : undefined;

  const onSelect = async (id: string) => {
    const { data: projectData } = await getProject({
      variables: { input: { id } },
    });
    const project = projectData?.getProject;
    if (!project) return;
    update({
      noProject: false,
      project: { id },
      address: project.address,
      location: project.location,
      approximatePlace: project.approximatePlace,
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
      <Headline size="small">Hör annonsen till ett projekt?</Headline>
      <Body size="medium">
        Valfritt — adressen fylls i automatiskt och köpare ser fler annonser
        från samma projekt.
      </Body>
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 8,
          marginTop: 8,
        }}
      >
        {myProjects.map((p) => (
          <FilterChip
            key={p.id}
            label={p.title}
            selected={selectedId === p.id}
            onPress={() =>
              selectedId === p.id ? onDeselect() : onSelect(p.id)
            }
          />
        ))}
        <FilterChip
          label="+ Nytt projekt"
          selected={showCreate}
          onPress={() => setShowCreate(!showCreate)}
        />
      </View>
      {showCreate && (
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
