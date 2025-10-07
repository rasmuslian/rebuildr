import { View } from "react-native";
import { Toggle } from "@components/controls/toggle";
import { Divider } from "@components/dividers/divider";
import { Form } from "@components/forms/form";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { CreateProject } from "@components/project/create-project";
import { PreviewProject } from "@components/project/preview-project";
import { Display, Body, Headline, Label } from "@components/typography/text";
import { borderRadius } from "@constants/sizes";
import React, { Suspense, useEffect, useState } from "react";
import { EditProject as EditProjectSection } from "@components/project/edit-project";
import { useThemeColor } from "@hooks/useThemeColor";
import { gql, useLazyQuery, useQuery } from "@apollo/client";
import {
  ProductBottomSheetProjectGetProjectQuery,
  ProductBottomSheetProjectGetProjectQueryVariables,
  ProductBottomSheetProjectMyProjectsQuery,
} from "@/gql/graphql";
import { Button } from "@components/buttons/button";
import { ProductFields } from "./upsert-product-bottom-sheet";

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

type Props = {
  product: ProductFields;
  update: (product: Partial<ProductFields>) => void;
  onNext: () => void;
  nextIsDisabled: boolean;
  badFields?: { [key: string]: string };
  onBack: () => void;
  updateProgress: (progress: number) => void;
};

export const Project = ({
  product,
  update,
  onNext,
  onBack,
  nextIsDisabled,
  updateProgress,
}: Props) => {
  const [skipProject, setSkipProject] = useState(!!product.noProject);
  const [connectProject, setConnectProject] = useState(!!product.project);
  const [isEditing, setIsEditing] = useState(false);

  const progress = () => {
    if (skipProject) {
      return 100;
    }

    if (isEditing || product.project?.id === newProjectOption) {
      return 50;
    }

    if (!!product.project?.id && connectProject) {
      return 100;
    }

    return 0;
  };
  useEffect(() => {
    const p = progress();
    updateProgress(p);
  }, [isEditing, product.project?.id, connectProject, skipProject]);

  const newProjectOption = "1";
  const colors = useThemeColor();

  const { data, refetch } = useQuery<ProductBottomSheetProjectMyProjectsQuery>(
    PRODUCT_BOTTOM_SHEET_PROJECT_MY_PROJECTS,
  );
  const [getProject] = useLazyQuery<
    ProductBottomSheetProjectGetProjectQuery,
    ProductBottomSheetProjectGetProjectQueryVariables
  >(PRODUCT_BOTTOM_SHEET_PROJECT_GET_PROJECT);

  const onSelectProjectId = async (id: string) => {
    if (id === newProjectOption) {
      update({ project: { id } });
      return;
    }
    const { data } = await getProject({
      variables: {
        input: {
          id,
        },
      },
    });
    const project = data?.getProject;
    if (!project) return;
    update({
      noProject: false,
      project: {
        id,
      },
      address: project.address,
      location: project.location,
      approximatePlace: project.approximatePlace,
    });
  };

  const onProjectCreated = async (id: string) => {
    refetch();
    await onSelectProjectId(id);
  };

  const onSelectNotConnect = () => {
    update({
      noProject: true,
    });
    setConnectProject(false);
    setSkipProject(!skipProject);
    setIsEditing(false);
  };
  const onSelectConnect = () => {
    update({
      noProject: false,
    });
    setSkipProject(false);
    setConnectProject(!connectProject);
    setIsEditing(false);
  };

  const projectOptions = [
    {
      value: newProjectOption,
      label: "Nytt projekt",
      disabled: product.project?.id === newProjectOption,
    },
    ...(data?.myProjects
      ? data.myProjects.map((p) => ({
          value: p.id,
          label: p.title,
          disabled: product.project?.id === p.id,
        }))
      : []),
  ];
  return (
    <View style={{ gap: 24, marginTop: 24 }}>
      <Display size="small" style={{ marginBottom: 16 }}>
        Koppla till projekt?
      </Display>
      <Body size="large" style={{ marginBottom: 18 }}>
        Genom att koppla din annons till ett projekt kommer köpare lättare att
        hitta fler produkter från samma projekt.
      </Body>
      <Body size="large">
        Slipp fylla i plats, kontaktuppgifter och annan information varje gång
        du lägger upp en ny annons. Läs mer i vår{" "}
        <Body isLink size="large">
          guide för projekt.
        </Body>
      </Body>
      <View style={{ marginTop: 16, gap: 16, paddingBottom: 16, zIndex: 1 }}>
        <Headline size="small">
          Vill du koppla annonsen till ett projekt?
        </Headline>
        <View
          style={[
            {
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              borderRadius: borderRadius.medium,
              backgroundColor: colors.buttons.tonal.enabled,
              padding: 16,
            },
            skipProject && {
              borderColor: colors.textField.clicked,
              borderWidth: 1,
              padding: 15,
              backgroundColor: colors.background.neutral,
            },
            connectProject && {
              backgroundColor: colors.buttons.filled.disabled,
            },
          ]}
        >
          <View style={{ gap: 4, flex: 1 }}>
            <Label size="medium">Nej, fortsätt utan projekt.</Label>
            <Body size="medium">Du lägger upp annonsen som vanligt.</Body>
          </View>
          <Toggle value={skipProject} onPress={() => onSelectNotConnect()} />
        </View>
        <View
          style={[
            {
              borderRadius: borderRadius.medium,
              backgroundColor: colors.buttons.tonal.enabled,
              padding: 16,
              gap: 24,
            },
            connectProject && {
              borderColor: colors.textField.clicked,
              borderWidth: 1,
              padding: 15,
              backgroundColor: colors.background.neutral,
            },
            skipProject && {
              backgroundColor: colors.buttons.filled.disabled,
            },
          ]}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <View style={{ gap: 4, flex: 1 }}>
              <Label size="medium">Ja, koppla till ett projekt.</Label>
              <Body size="medium">
                Smart! Då kan du återanvända information och visa fler
                relaterade annonser.
              </Body>
            </View>
            <Toggle value={connectProject} onPress={() => onSelectConnect()} />
          </View>
          {connectProject && (
            <>
              <Form
                style={{ zIndex: 1 }}
                fields={[
                  {
                    type: "select",
                    heading: "Välj projekt",
                    value: product.project?.id,
                    placeholder: "Välj",
                    options: projectOptions,
                    onSelect: (value) => {
                      onSelectProjectId(value);
                    },
                  },
                ]}
              />
              {product.project?.id === newProjectOption && (
                <>
                  <Divider />
                  <CreateProject onCreate={onProjectCreated} />
                </>
              )}
              {!!product.project?.id &&
                product.project.id !== newProjectOption && (
                  <>
                    <Divider />
                    <Suspense fallback={<LoadingSpinner />}>
                      {isEditing ? (
                        <EditProjectSection
                          id={product.project?.id}
                          onEdited={() => setIsEditing(false)}
                        />
                      ) : (
                        <PreviewProject
                          id={product.project?.id}
                          onEdit={() => setIsEditing(true)}
                        />
                      )}
                    </Suspense>
                  </>
                )}
            </>
          )}
        </View>
      </View>
      <View style={{ flexDirection: "row", gap: 8, marginTop: 24 }}>
        <Button icon="arrowLeft" label="Tillbaka" onPress={() => onBack()} />
        <Button
          label="Fortsätt"
          onPress={() => onNext()}
          style={{ flex: 1 }}
          disabled={nextIsDisabled}
        />
      </View>
    </View>
  );
};
