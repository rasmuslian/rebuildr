import { Body, Label } from "@components/typography/text";
import { View, Pressable } from "react-native";
import { Avatar } from "@components/avatar/avatar";
import { Icon } from "@icons/icon";
import { useLikeProject } from "@hooks/useLikeProject";
import { useUser } from "@hooks/useUser";
import { router } from "expo-router";
import { ProductStatusEnum } from "@/gql/graphql";
import { ImageCardPart } from "./image-card-part";

export type ProjectCardProject = {
  id: string;
  title: string;
  projectPicture?: { url: string } | null;
  products: {
    id: string;
    primaryImage?: { url: string } | null;
    status: ProductStatusEnum;
  }[];
  likedByMe?: boolean | null;
  user: { id: string; profilePicture?: { url: string } | null };
};

type Props = {
  showHeart: boolean;
  project: ProjectCardProject;
  /** When provided, shows an edit (pencil) affordance on the card. */
  onEdit?: () => void;
  onPress?: () => void;
  showOwner?: boolean;
  compact?: boolean;
};

export const ProjectCard = ({
  showHeart,
  project,
  onEdit,
  onPress,
  showOwner = true,
  compact = false,
}: Props) => {
  const { onToggleProjectHeart } = useLikeProject();
  const { isLoggedIn } = useUser();

  return (
    <Pressable
      onPress={() => {
        if (onPress) {
          onPress();
          return;
        }
        router.navigate({
          pathname: "/(app)/project/[projectId]",
          params: { projectId: project.id },
        });
      }}
    >
      <View style={{ gap: compact ? 12 : 16 }}>
        <View
          style={{
            flexDirection: "row",
            gap: 4,
          }}
        >
          <ImageCardPart
            imageUrl={project.products[0]?.primaryImage?.url}
            sold={project.products[0]?.status === ProductStatusEnum.Sold}
            position="left"
          />
          <View
            style={{
              justifyContent: "space-between",
              gap: 4,
              flex: 1,
              position: "relative",
            }}
          >
            <ImageCardPart
              imageUrl={project.products[1]?.primaryImage?.url}
              sold={project.products[1]?.status === ProductStatusEnum.Sold}
              position="up"
            />
            <ImageCardPart
              imageUrl={project.products[2]?.primaryImage?.url}
              sold={project.products[2]?.status === ProductStatusEnum.Sold}
              position="down"
            />
            {showHeart && isLoggedIn && (
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
            )}
            {onEdit && (
              <Pressable
                style={({ pressed }) => ({
                  position: "absolute",
                  top: 8,
                  right: 8,
                  backgroundColor: "white",
                  borderRadius: 999,
                  padding: 6,
                  opacity: pressed ? 0.7 : 1,
                })}
                pointerEvents="box-only"
                onPress={onEdit}
              >
                <Icon icon="edit" />
              </Pressable>
            )}
          </View>
        </View>
        <View
          style={{
            flexDirection: "row",
            gap: showOwner ? 16 : 0,
            alignItems: "center",
          }}
        >
          {showOwner && (
            <Avatar
              imageUrl={project.user.profilePicture?.url}
              placeholder="PROJECT"
            />
          )}
          <View style={{ gap: 2, flex: 1 }}>
            <Label size={compact ? "medium" : "large"}>{project.title}</Label>
            <Body size="small" color="secondary">
              {
                project.products.filter(
                  (p) => p.status === ProductStatusEnum.Published,
                ).length
              }{" "}
              {showOwner ? "annonser till salu" : "annonser"}
            </Body>
          </View>
        </View>
      </View>
    </Pressable>
  );
};
