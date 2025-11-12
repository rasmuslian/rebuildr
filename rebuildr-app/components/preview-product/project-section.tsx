import { Button } from "@components/buttons/button";
import {
  ProjectCard,
  ProjectCardProject,
} from "@components/cards/project-card";
import { Headline } from "@components/typography/text";
import { router } from "expo-router";
import { View } from "react-native";

type Props = {
  project: ProjectCardProject;
  myId?: string;
};

export const ProjectSection = ({ project, myId }: Props) => {
  return (
    <View style={{ gap: 16 }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Headline size="small">Mer från samma projekt</Headline>
        <Button
          icon="arrowRight"
          type="text"
          onPress={() => {
            router.navigate({
              pathname: "/(app)/project/[projectId]",
              params: { projectId: project.id },
            });
          }}
        />
      </View>
      <ProjectCard showHeart={myId !== project.user.id} project={project} />
    </View>
  );
};
