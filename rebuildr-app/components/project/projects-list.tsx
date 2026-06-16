import { ProjectsListFragmentFragment } from "@/gql/graphql";
import { gql } from "@apollo/client";
import { ProjectCard } from "@components/cards/project-card";
import { useScreenType } from "@hooks/useScreenType";
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
  /** When provided, own project cards get an edit affordance wired to this. */
  onEditProject?: (id: string) => void;
};

export const ProjectsList = ({ projects, onEditProject }: Props) => {
  const { isDesktop } = useScreenType();
  const { me } = useUser();

  return (
    <View
      style={[
        isDesktop
          ? { flexDirection: "row", flexWrap: "wrap", marginHorizontal: -8 }
          : { gap: 24 },
      ]}
    >
      {projects.map((project, index) => {
        const isMine = project.user.id === me?.id;
        return (
          <View
            style={[
              isDesktop && {
                flexBasis: "25%",
                paddingHorizontal: 8,
                paddingBottom: 24,
              },
            ]}
            key={project.id}
          >
            <ProjectCard
              key={index}
              showHeart={!isMine}
              project={project}
              onEdit={
                isMine && onEditProject
                  ? () => onEditProject(project.id)
                  : undefined
              }
            />
          </View>
        );
      })}
    </View>
  );
};
