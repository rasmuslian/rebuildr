import {
  ProjectCard,
  ProjectCardProject,
} from "@components/cards/project-card";
import { useScreenType } from "@hooks/useScreenType";
import { View } from "react-native";

type Props = {
  projects: ProjectCardProject[];
  onProjectPress: (projectId: string) => void;
};

export const InternalProjectGrid = ({ projects, onProjectPress }: Props) => {
  const { isDesktop } = useScreenType();

  return (
    <View
      style={
        isDesktop
          ? { flexDirection: "row", flexWrap: "wrap", marginHorizontal: -12 }
          : { gap: 24 }
      }
    >
      {projects.map((project) => (
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
