import { ProjectsListFragmentFragment } from "@/gql/graphql";
import { gql } from "@apollo/client";
import { ProjectCard } from "@components/cards/project-card";
import { useUser } from "@hooks/useUser";
import { View } from "react-native";

export const PROJECTS_LIST_FRAGMENT = gql`
  fragment ProjectsListFragment on Project {
    id
    title
    likedByMe
    projectPicture {
      id
      url
    }
    products {
      id
      status
      primaryImage {
        id
        url
      }
    }
    user {
      id
      profilePicture {
        id
        url
      }
    }
  }
`;

type Props = {
  projects: ProjectsListFragmentFragment[];
};

export const ProjectsList = ({ projects }: Props) => {
  const { me } = useUser();
  return (
    <View style={{ gap: 24 }}>
      {projects.map((project, index) => {
        return (
          <ProjectCard
            key={index}
            showHeart={project.user.id !== me?.id}
            project={project}
          />
        );
      })}
    </View>
  );
};
