import {
  ProjectCard,
  ProjectCardProject,
} from "@components/cards/project-card";
import { HoriztalListSection } from "@components/sections/horizontal-list-section";
import { DESKTOP_ROW_COLUMNS } from "@constants/layout";
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
  if (landing) {
    return (
      <HoriztalListSection
        data={projects}
        keyExtractor={(project) => project.id}
        renderItem={({ item: project }) => (
          <ProjectCard
            compact
            showHeart={false}
            showOwner={false}
            titleSize="small"
            project={project}
            onPress={() => onProjectPress(project.id)}
          />
        )}
        visibleItems={3}
        visibleItemsDesktop={DESKTOP_ROW_COLUMNS}
      />
    );
  }

  return (
    <View
      style={
        isDesktop
          ? { flexDirection: "row", flexWrap: "wrap", marginHorizontal: -8 }
          : { gap: 16 }
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
                  paddingHorizontal: 8,
                  paddingBottom: 16,
                }
              : undefined
          }
        >
          <ProjectCard
            showHeart={false}
            showOwner={false}
            titleSize="small"
            project={project}
            onPress={() => onProjectPress(project.id)}
          />
        </View>
      ))}
    </View>
  );
};
