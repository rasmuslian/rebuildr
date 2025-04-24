import { Button } from "@components/buttons/button";
import { Toggle } from "@components/controls/toggle";
import { ProgressHeader } from "@components/create-product/progress-header";
import { Form } from "@components/forms/form";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { Body, Display, Headline, Label } from "@components/typography/text";
import { borderRadius } from "@constants/sizes";
import { useThemeColor } from "@hooks/useThemeColor";
import { router } from "expo-router";
import { Suspense, useState } from "react";
import { View } from "react-native";
import { gql, useLazyQuery, useMutation, useQuery } from "@apollo/client";
import {
  ProjectGetMyProjectsQuery,
  ProjectGetProjectQuery,
  ProjectGetProjectQueryVariables,
} from "@/gql/graphql";
import { CreateProject } from "@components/project/create-project";
import { PreviewProject } from "@components/project/preview-project";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { Divider } from "@components/dividers/divider";
import { EditProject } from "@components/project/edit-project";

const PROJECT_GET_MY_PROJECTS = gql`
  query ProjectGetMyProjects {
    myProjects {
      id
      title
    }
    getDraftedProduct {
      id
      project {
        id
      }
    }
  }
`;

const PROJECT_GET_PROJECT_QUERY = gql`
  query ProjectGetProject($input: GetProjectInput!) {
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
    }
  }
`;

const PROJECT_UPDATE_PRODUCT = gql`
  mutation ProjectUpdateProduct($input: UpdateProductInput!) {
    updateProduct(input: $input) {
      product {
        id
      }
    }
  }
`;

export default function Project() {
  const [skipProject, setSkipProject] = useState(false);
  const [connectProject, setConnectProject] = useState(false);
  const [projectId, setProjectId] = useState<string>();
  const [isEditing, setIsEditing] = useState(false);
  const newProjectOption = "1";
  const colors = useThemeColor();

  const { data, refetch } = useQuery<ProjectGetMyProjectsQuery>(
    PROJECT_GET_MY_PROJECTS,
    {
      onCompleted(data) {
        if (!data.getDraftedProduct) {
          console.error("No draft found");
          router.replace("/");
          return;
        }
        if (data.getDraftedProduct.project) {
          setProjectId(data.getDraftedProduct.project.id);
          setConnectProject(true);
        }
      },
    },
  );
  const [getProject] = useLazyQuery<
    ProjectGetProjectQuery,
    ProjectGetProjectQueryVariables
  >(PROJECT_GET_PROJECT_QUERY);
  const [updateProduct, { loading: updatingProduct }] = useMutation(
    PROJECT_UPDATE_PRODUCT,
  );

  const onProjectCreated = (id: string) => {
    setProjectId(id);
    getProject({
      variables: {
        input: {
          id,
        },
      },
    });
    refetch();
  };

  const onSelectNotConnect = () => {
    setConnectProject(false);
    setSkipProject(!skipProject);
    setIsEditing(false);
  };
  const onSelectConnect = () => {
    setSkipProject(false);
    setConnectProject(!connectProject);
    setIsEditing(false);
  };

  const canContinue = () => {
    if (skipProject) {
      return true;
    }

    if (
      connectProject &&
      !isEditing &&
      !!projectId &&
      projectId !== newProjectOption
    ) {
      return true;
    }

    return false;
  };
  const onNext = () => {
    if (!data?.getDraftedProduct || updatingProduct) {
      return;
    }

    if (skipProject) {
      router.navigate("/sell-product/transportation");
    }

    updateProduct({
      variables: {
        input: {
          id: data.getDraftedProduct.id,
          projectId,
        },
      },
      onCompleted: () => {
        router.navigate("/sell-product/transportation");
      },
    });
  };
  const progress = () => {
    if (skipProject) {
      return 100;
    }

    if (isEditing || projectId === newProjectOption) {
      return 50;
    }

    if (!!projectId && connectProject) {
      return 100;
    }

    return 0;
  };

  const projectOptions = [
    {
      value: newProjectOption,
      label: "Nytt project",
      disabled: projectId === newProjectOption,
    },
    ...(data
      ? data.myProjects.map((p) => ({
          value: p.id,
          label: p.title,
          disabled: projectId === p.id,
        }))
      : []),
  ];

  return (
    <>
      <View style={{ marginHorizontal: 16, marginBottom: 24 }}>
        <ProgressHeader
          onClose={() =>
            router.canDismiss() ? router.dismiss() : router.replace("/")
          }
          title="Ny annons"
          prog2={progress()}
        />
      </View>

      <ScreenLayout style={{ paddingBottom: 32 }}>
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
              <Toggle
                value={connectProject}
                onPress={() => onSelectConnect()}
              />
            </View>
            {connectProject && (
              <>
                <Form
                  style={{ zIndex: 1 }}
                  fields={[
                    {
                      type: "select",
                      heading: "Välj project",
                      value: projectId,
                      placeholder: "Välj",
                      options: projectOptions,
                      onSelect: (value) => {
                        setProjectId(value);
                      },
                    },
                  ]}
                />
                {projectId === newProjectOption && (
                  <>
                    <Divider />
                    <CreateProject onCreate={onProjectCreated} />
                  </>
                )}
                {!!projectId && projectId !== newProjectOption && (
                  <>
                    <Divider />
                    <Suspense fallback={<LoadingSpinner />}>
                      {isEditing ? (
                        <EditProject
                          id={projectId}
                          onEdited={() => setIsEditing(false)}
                        />
                      ) : (
                        <PreviewProject
                          id={projectId}
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
          <Button
            icon="arrowLeft"
            label="Tillbaka"
            onPress={() => {
              router.navigate("/sell-product");
            }}
          />
          <Button
            label="Fortsätt"
            onPress={() => onNext()}
            loading={updatingProduct}
            style={{ flex: 1 }}
            disabled={!canContinue()}
          />
        </View>
      </ScreenLayout>
    </>
  );
}
