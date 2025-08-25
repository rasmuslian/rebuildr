import { Body, Label } from "@components/typography/text";
import { View } from "react-native";
import { Image } from "expo-image";
import { borderRadius } from "@constants/sizes";
import { useThemeColor } from "@hooks/useThemeColor";
import { Pressable } from "react-native-gesture-handler";
import { Avatar } from "@components/avatar/avatar";
import { Icon } from "@icons/icon";
import { useLikeProject } from "@hooks/useLikeProject";

type Props = {
  project: {
    id: string;
    title: string;
    projectPicture?: { url: string } | null;
    products: { id: string; primaryImage?: { url: string } | null }[];
    likedByMe?: boolean | null;
    user: { profilePicture?: { url: string } | null };
  };
};

export const ProjectCard = ({ project }: Props) => {
  const colors = useThemeColor();
  const { onToggleProjectHeart } = useLikeProject();

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
          }}
        >
          <Image
            key="1"
            source={
              project.products[0]?.primaryImage?.url
                ? {
                    uri: project.products[0].primaryImage.url,
                  }
                : undefined
            }
            style={{
              aspectRatio: 1,
              flex: 2,
              borderTopLeftRadius: borderRadius.medium,
              borderBottomLeftRadius: borderRadius.medium,
            }}
          />
          <View
            style={{
              justifyContent: "space-between",
              gap: 4,
              flex: 1,
              position: "relative",
            }}
          >
            <Image
              key="2"
              source={
                project.products[1]?.primaryImage?.url
                  ? {
                      uri: project.products[1].primaryImage.url,
                    }
                  : undefined
              }
              style={{
                aspectRatio: 1,
                flex: 1,
                backgroundColor: colors.buttons.filled.disabled,
                borderTopRightRadius: borderRadius.medium,
              }}
            />
            <Image
              key="3"
              source={
                project.products[2]?.primaryImage?.url
                  ? {
                      uri: project.products[2].primaryImage.url,
                    }
                  : undefined
              }
              style={{
                aspectRatio: 1,
                flex: 1,
                backgroundColor: colors.buttons.filled.disabled,
                borderBottomRightRadius: borderRadius.medium,
              }}
            />

            <Pressable
              style={({ pressed }) => ({
                position: "absolute",
                top: 8,
                right: 8,
                opacity: pressed ? 0.7 : 1,
              })}
              pointerEvents="box-only"
              onPress={() => {
                onToggleProjectHeart({
                  projectId: project.id,
                  likedByMe: !!project.likedByMe,
                });
              }}
            >
              <Icon
                strokeColor="primaryLight"
                color={project.likedByMe ? "link" : undefined}
                opacity={project.likedByMe ? undefined : "99"}
                icon="heartFilled"
              />
            </Pressable>
          </View>
        </View>
        <View
          style={{
            flexDirection: "row",
            gap: 16,
            alignItems: "center",
          }}
        >
          <Avatar
            imageUrl={project.user.profilePicture?.url}
            placeholder={"PROJECT"}
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
