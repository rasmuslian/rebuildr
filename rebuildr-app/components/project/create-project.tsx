import {
  CreateProjectMutationMutation,
  CreateProjectMutationMutationVariables,
  CreateProjectQueryQuery,
} from "@/gql/graphql";
import { gql, useMutation, useQuery } from "@apollo/client";

import { ProjectFormFields, ProjectFormType } from "./project-form-fields";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";

const CREATE_PROJECT_QUERY = gql`
  query CreateProjectQuery {
    me {
      id
      address
      location {
        lat
        lng
      }
    }
  }
`;

const CREATE_PROJECT_MUTATION = gql`
  mutation CreateProjectMutation($input: CreateProjectInput!) {
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
    CreateProjectMutationMutation,
    CreateProjectMutationMutationVariables
  >(CREATE_PROJECT_MUTATION);

  const { data } = useQuery<CreateProjectQueryQuery>(CREATE_PROJECT_QUERY);

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

  if (!data) {
    return <LoadingSpinner />;
  }

  return (
    <ProjectFormFields
      myPlace={{
        location: data.me.location ?? undefined,
        address: data.me.address ?? undefined,
      }}
      onSave={onSaveProject}
      isLoading={creatingProject}
    />
  );
};
