import { ProjectsListFragmentFragment } from "@/gql/graphql";
import { gql } from "@apollo/client";
import { ProjectCard } from "@components/cards/project-card";
import { useScreenType } from "@hooks/useScreenType";
import { useUser } from "@hooks/useUser";
import { useWindowDimensions, View } from "react-native";

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
  const { isDesktop } = useScreenType();
  const { width: screenWidth } = useWindowDimensions();
  const { me } = useUser();
  const width = isDesktop && (screenWidth - 75 * 2) / 4 - 16;
  return (
    <View
      style={[
        { gap: isDesktop ? 16 : 24 },
        isDesktop ? { flexDirection: "row", flexWrap: "wrap" } : {},
      ]}
    >
      {projects.map((project, index) => {
        return (
          <View style={[width ? { width } : undefined]} key={project.id}>
            <ProjectCard
              key={index}
              showHeart={project.user.id !== me?.id}
              project={project}
            />
          </View>
        );
      })}
    </View>
  );
};
