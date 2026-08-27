import {
  ProjectCard,
  ProjectCardProject,
} from "@components/cards/project-card";
import { useScreenType } from "@hooks/useScreenType";
import { View } from "react-native";

type Props = {
  projects: ProjectCardProject[];
  onProjectPress: (projectId: string) => void;
  landing?: boolean;
};

export const InternalProjectGrid = ({
  projects,
  onProjectPress,
  landing = false,
}: Props) => {
  const { isDesktop } = useScreenType();
  const visibleProjects =
    landing && !isDesktop ? projects.slice(0, 1) : projects;

  return (
    <View
      style={
        isDesktop
          ? { flexDirection: "row", flexWrap: "wrap", marginHorizontal: -12 }
          : { gap: 24 }
      }
    >
      {visibleProjects.map((project) => (
        <View
          key={project.id}
          style={
            isDesktop
              ? {
                  flexBasis: "25%",
                  maxWidth: "25%",
                  paddingHorizontal: 12,
                  paddingBottom: 24,
                }
              : undefined
          }
        >
          <ProjectCard
            compact={landing}
            showHeart={false}
            showOwner={false}
            project={project}
            onPress={() => onProjectPress(project.id)}
          />
        </View>
      ))}
    </View>
  );
};
