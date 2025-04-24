import {
  CreateProjectMutation,
  CreateProjectMutationVariables,
} from "@/gql/graphql";
import { gql, useMutation } from "@apollo/client";

import { ProjectFormFields, ProjectFormType } from "./project-form-fields";

const CREATE_PROJECT = gql`
  mutation CreateProject($input: CreateProjectInput!) {
    createProject(input: $input) {
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
    }
  }
`;

type Props = {
  onCreate: (id: string) => void;
};

export const CreateProject = ({ onCreate }: Props) => {
  const [createProject, { loading: creatingProject }] = useMutation<
    CreateProjectMutation,
    CreateProjectMutationVariables
  >(CREATE_PROJECT);

  const onSaveProject = (project: ProjectFormType) => {
    createProject({
      variables: {
        input: {
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
        onCreate(data.createProject.id);
      },
    });
  };

  return (
    <ProjectFormFields onSave={onSaveProject} isLoading={creatingProject} />
  );
};
