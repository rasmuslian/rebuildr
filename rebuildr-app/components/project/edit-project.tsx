import {
  EditProjectQueryQuery,
  EditProjectQueryQueryVariables,
  SetProjectPictureMutation,
  SetProjectPictureMutationVariables,
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

const SET_PROJECT_PICTURE = gql`
  mutation SetProjectPicture($input: SetProjectPictureInput!) {
    setProjectPicture(input: $input) {
      putUrl
      project {
        id
        projectPicture {
          id
          url
        }
      }
    }
  }
`;

const UPDATE_PROJECT = gql`
  mutation UpdateProject($input: UpdateProjectInput!) {
    updateProject(input: $input) {
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
  const [setProjectPicture, { loading: uploadingPicture }] = useMutation<
    SetProjectPictureMutation,
    SetProjectPictureMutationVariables
  >(SET_PROJECT_PICTURE);

  const onPickPicture = async () => {
    const image = await pickImage();
    if (!image) return;
    setPickedPicture(image);
  };

  const uploadPicture = async () => {
    if (!pickedPicture) return;
    const { data } = await setProjectPicture({
      variables: {
        input: { projectId: id, mimeType: pickedPicture.mimeType },
      },
    });
    if (data?.setProjectPicture.putUrl) {
      await fetch(data.setProjectPicture.putUrl, {
        method: "PUT",
        headers: {
          "Content-Type": pickedPicture.mimeType,
          "x-amz-acl": "public-read",
        },
        body: pickedPicture.file,
      });
    }
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
        },
      },
      onCompleted: async (data) => {
        await uploadPicture();
        onEdited(data.updateProject.id);
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
        isLoading={updatingProject || uploadingPicture}
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
