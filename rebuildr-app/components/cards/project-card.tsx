import { Body, Label } from "@components/typography/text";
import { View, Pressable } from "react-native";
import { Image } from "expo-image";
import { borderRadius } from "@constants/sizes";
import { Avatar } from "@components/avatar/avatar";
import { Icon } from "@icons/icon";
import { useLikeProject } from "@hooks/useLikeProject";
import { useUser } from "@hooks/useUser";
import { router } from "expo-router";
import { ProductStatusEnum } from "@/gql/graphql";
import { ProductImageOverlay } from "@components/product/product-image-overlay";
import { primitives } from "@constants/colors";

type Props = {
  showHeart: boolean;
  project: {
    id: string;
    title: string;
    projectPicture?: { url: string } | null;
    products: {
      id: string;
      primaryImage?: { url: string } | null;
      status: ProductStatusEnum;
    }[];
    likedByMe?: boolean | null;
    user: { profilePicture?: { url: string } | null };
  };
};

export const ProjectCard = ({ showHeart, project }: Props) => {
  const { onToggleProjectHeart } = useLikeProject();
  const { isLoggedIn } = useUser();

  return (
    <Pressable
      onPress={() => {
        router.navigate({
          pathname: "/(app)/project/[projectId]",
          params: { projectId: project.id },
        });
      }}
    >
      <View style={{ gap: 16 }}>
        <View
          style={{
            flexDirection: "row",
            gap: 4,
          }}
        >
          <Product product={project.products[0]} position="left" />
          <View
            style={{
              justifyContent: "space-between",
              gap: 4,
              flex: 1,
              position: "relative",
            }}
          >
            <Product product={project.products[1]} position="up" />
            <Product product={project.products[2]} position="down" />
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
            placeholder="PROJECT"
          />
          <View style={{ gap: 2 }}>
            <Label size="large">{project.title}</Label>
            <Body size="small">
              {
                project.products.filter(
                  (p) => p.status === ProductStatusEnum.Published,
                ).length
              }{" "}
              annonser till salu
            </Body>
          </View>
        </View>
      </View>
    </Pressable>
  );
};

type ProductProps = {
  product?: Props["project"]["products"][number];
  position: "left" | "up" | "down";
};
const Product = ({ product, position }: ProductProps) => {
  let borderStyle = {};
  if (position === "down") {
    borderStyle = { borderBottomRightRadius: borderRadius.medium };
  }
  if (position === "up") {
    borderStyle = { borderTopRightRadius: borderRadius.medium };
  }
  if (position === "left") {
    borderStyle = {
      borderTopLeftRadius: borderRadius.medium,
      borderBottomLeftRadius: borderRadius.medium,
    };
  }
  return (
    <View
      style={{
        flex: position === "left" ? 2 : 1,
        ...borderStyle,
      }}
    >
      {product?.primaryImage?.url ? (
        <Image
          source={
            product?.primaryImage?.url
              ? {
                  uri: product.primaryImage.url,
                }
              : undefined
          }
          style={{
            aspectRatio: 1,
            height: "100%",
            ...borderStyle,
          }}
        />
      ) : (
        <View
          style={{
            aspectRatio: 1,
            height: "100%",
            backgroundColor: primitives.neutrals200,
            ...borderStyle,
          }}
        />
      )}
      {product?.status === ProductStatusEnum.Sold && (
        <ProductImageOverlay text="Såld" style={borderStyle} />
      )}
    </View>
  );
};
