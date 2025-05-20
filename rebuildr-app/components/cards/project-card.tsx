import { Body, Label } from "@components/typography/text";
import { View } from "react-native";
import { Image } from "expo-image";
import { borderRadius } from "@constants/sizes";
import { useThemeColor } from "@hooks/useThemeColor";
import PlaceholderProject from "@assets/images/placeholder-project.png";
import { Pressable } from "react-native-gesture-handler";

type Props = {
  project: {
    title: string;
    projectPicture?: { url: string } | null;
    products: { primaryImage?: { url: string } | null }[];
  };
};

export const ProjectCard = ({ project }: Props) => {
  const colors = useThemeColor();

  return (
    <Pressable
      onPress={() => {
        //TODO: navigate to project page
      }}
    >
      <View style={{ gap: 16 }}>
        <View
          style={{
            flexDirection: "row",
            gap: 4,
            height: 231,
          }}
        >
          <Image
            key="1"
            source={{
              uri: project.products[0]?.primaryImage?.url,
            }}
            style={{
              flex: 2,
              height: "100%",
              borderTopLeftRadius: borderRadius.medium,
              borderBottomLeftRadius: borderRadius.medium,
            }}
          />
          <View
            style={{
              justifyContent: "space-between",
              gap: 4,
              flex: 1,
            }}
          >
            <Image
              key="2"
              source={{
                uri: project.products[1]?.primaryImage?.url,
              }}
              style={{
                width: "100%",
                flex: 1,
                backgroundColor: colors.background.secondary,
                borderTopRightRadius: borderRadius.medium,
              }}
            />

            <Image
              key="3"
              source={{
                uri: project.products[2]?.primaryImage?.url,
              }}
              style={{
                width: "100%",
                flex: 1,
                backgroundColor: colors.background.primary,
                borderBottomRightRadius: borderRadius.medium,
              }}
            />
          </View>
        </View>
        <View
          style={{
            flexDirection: "row",
            gap: 16,
            alignItems: "center",
          }}
        >
          <Image
            source={project.projectPicture?.url ?? PlaceholderProject.uri}
            style={{ width: 40, height: 40 }}
          />
          <View style={{ gap: 2 }}>
            <Label size="large">{project.title}</Label>
            <Body size="small">{project.products.length} annonser</Body>
          </View>
        </View>
      </View>
    </Pressable>
  );
};
