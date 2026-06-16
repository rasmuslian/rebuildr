import {
  EditProjectQueryQuery,
  EditProjectQueryQueryVariables,
  UpdateProjectMutation,
  UpdateProjectMutationVariables,
} from "@/gql/graphql";
import { gql, useMutation, useSuspenseQuery } from "@apollo/client";
import { ProjectFormFields, ProjectFormType } from "./project-form-fields";
import { DeleteProjectBottomSheet } from "./delete-project-bottom-sheet";
import { useState } from "react";
import { useImageHandler } from "@hooks/use-image-handler";

const EDIT_PROJECT_QUERY = gql`
  query EditProjectQuery($input: GetProjectInput!) {
    getProject(input: $input) {
      id
      title
      description
      shortText
      contactName
      contactEmail
      contactPhone
      showDetailsOnMap
      address
      location {
        lat
        lng
      }
      projectPicture {
        id
        url
      }
    }
  }
`;

const UPDATE_PROJECT = gql`
  mutation UpdateProject($input: UpdateProjectInput!) {
    updateProject(input: $input) {
      projectPicturePutUrl
      project {
        id
        title
        description
        shortText
        contactName
        contactEmail
        contactPhone
        address
        showDetailsOnMap
        location {
          lat
          lng
        }
        approximatePlace {
          lat
          lng
          address
        }
        projectPicture {
          id
          url
        }
      }
    }
  }
`;

type Props = {
  id: string;
  onEdited: (id: string) => void;
  onDeleted?: () => void;
};

export const EditProject = ({ id, onEdited, onDeleted }: Props) => {
  const [showDeleteSheet, setShowDeleteSheet] = useState(false);
  const { pickImage } = useImageHandler();
  const [pickedPicture, setPickedPicture] = useState<{
    uri: string;
    mimeType: string;
    file: File;
    name?: string | null;
  }>();
  const { data } = useSuspenseQuery<
    EditProjectQueryQuery,
    EditProjectQueryQueryVariables
  >(EDIT_PROJECT_QUERY, {
    variables: { input: { id } },
  });
  const [updateProject, { loading: updatingProject }] = useMutation<
    UpdateProjectMutation,
    UpdateProjectMutationVariables
  >(UPDATE_PROJECT);

  const onPickPicture = async () => {
    const image = await pickImage();
    if (!image) return;
    setPickedPicture(image);
  };

  const onEditProject = (project: ProjectFormType) => {
    updateProject({
      variables: {
        input: {
          id,
          title: project.title,
          description: project.description,
          shortText: project.shortText,
          location: {
            lat: project.location.lat,
            lng: project.location.lng,
          },
          contactName: project.contactName,
          contactEmail: project.contactEmail,
          contactPhone: project.contactPhone,
          showDetailsOnMap: project.showDetailsOnMap,
          // Cover image rides along in updateProject, mirroring updateUser's
          // profilePicture handling.
          projectPicture: pickedPicture
            ? { mimeType: pickedPicture.mimeType }
            : undefined,
        },
      },
      onCompleted: async (data) => {
        const putUrl = data.updateProject.projectPicturePutUrl;
        if (putUrl && pickedPicture) {
          await fetch(putUrl, {
            method: "PUT",
            headers: {
              "Content-Type": pickedPicture.mimeType,
              "x-amz-acl": "public-read",
            },
            body: pickedPicture.file,
          });
        }
        onEdited(data.updateProject.project.id);
      },
    });
  };

  const onDeleteProject = async () => {
    setShowDeleteSheet(true);
  };

  return (
    <>
      <ProjectFormFields
        project={data.getProject}
        onSave={(project) => onEditProject(project)}
        onDelete={onDeleteProject}
        isLoading={updatingProject}
        currentPictureUrl={data.getProject.projectPicture?.url}
        pickedPictureUri={pickedPicture?.uri}
        onPickPicture={onPickPicture}
      />
      <DeleteProjectBottomSheet
        projectId={id}
        show={showDeleteSheet}
        onDismiss={() => setShowDeleteSheet(false)}
        onProjectDeleted={() => {
          setShowDeleteSheet(false);
          onDeleted?.();
        }}
      />
    </>
  );
};
