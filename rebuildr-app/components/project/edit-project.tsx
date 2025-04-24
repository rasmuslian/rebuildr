import {
  EditProjectQueryQuery,
  EditProjectQueryQueryVariables,
  UpdateProjectMutation,
  UpdateProjectMutationVariables,
} from "@/gql/graphql";
import { gql, useMutation, useSuspenseQuery } from "@apollo/client";
import { ProjectFormFields, ProjectFormType } from "./project-form-fields";

const EDIT_PROJECT_QUERY = gql`
  query EditProjectQuery($input: GetProjectInput!) {
    getProject(input: $input) {
      id
      title
      description
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

const UPDATE_PROJECT = gql`
  mutation UpdateProject($input: UpdateProjectInput!) {
    updateProject(input: $input) {
      id
      title
      description
      description
      contactName
      contactEmail
      contactPhone
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
};

export const EditProject = ({ id, onEdited }: Props) => {
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

  const onEditProject = (project: ProjectFormType) => {
    updateProject({
      variables: {
        input: {
          id,
          title: project.title,
          description: project.description,
          location: {
            lat: project.location.lat,
            lng: project.location.lng,
          },
          contactName: project.contactName,
          contactEmail: project.contactEmail,
          contactPhone: project.contactPhone,
        },
      },
      onCompleted: (data) => {
        onEdited(data.updateProject.id);
      },
    });
  };

  return (
    <ProjectFormFields
      project={data.getProject}
      onSave={(project) => onEditProject(project)}
      isLoading={updatingProject}
    />
  );
};
