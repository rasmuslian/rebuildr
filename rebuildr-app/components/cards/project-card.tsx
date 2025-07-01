import { Body, Label } from "@components/typography/text";
import { View } from "react-native";
import { Image } from "expo-image";
import { borderRadius } from "@constants/sizes";
import { useThemeColor } from "@hooks/useThemeColor";
import PlaceholderProject from "@assets/images/placeholder-project.png";
import { Pressable } from "react-native-gesture-handler";
import { Button } from "@components/buttons/button";
import { gql, useMutation } from "@apollo/client";
import {
  ProjectLikeMutation,
  ProjectLikeMutationVariables,
} from "@/gql/graphql";
import { Avatar } from "@components/avatar/avatar";

type Props = {
  project: {
    id: string;
    title: string;
    projectPicture?: { url: string } | null;
    products: { primaryImage?: { url: string } | null }[];
    likedByMe?: boolean | null;
    user: { profilePicture?: { url: string } | null };
  };
};

const PROJECT_LIKE_MUTATION = gql`
  mutation ProjectLike($input: SetLikeProjectInput!) {
    setLikeProject(input: $input) {
      id
      likedByMe
    }
  }
`;

export const ProjectCard = ({ project }: Props) => {
  const colors = useThemeColor();

  const [setLikeProduct] = useMutation<
    ProjectLikeMutation,
    ProjectLikeMutationVariables
  >(PROJECT_LIKE_MUTATION);

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
            source={{
              uri: project.products[0]?.primaryImage?.url,
            }}
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
              source={{
                uri: project.products[1]?.primaryImage?.url,
              }}
              style={{
                aspectRatio: 1,
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
                aspectRatio: 1,
                flex: 1,
                backgroundColor: colors.background.primary,
                borderBottomRightRadius: borderRadius.medium,
              }}
            />
            <Button
              style={{ position: "absolute", top: 0, right: 0 }}
              icon={project.likedByMe ? "heartFilled" : "heart"}
              type="text"
              onPress={() =>
                setLikeProduct({
                  variables: {
                    input: {
                      id: project.id,
                      like: !project.likedByMe,
                    },
                  },
                })
              }
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
          <Avatar
            imageUrl={
              project.user.profilePicture?.url ?? PlaceholderProject.uri
            }
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
