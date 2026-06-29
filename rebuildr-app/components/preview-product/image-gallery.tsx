import { Product, ProductStatusEnum } from "@/gql/graphql";
import { View } from "react-native";
import { ProductImageOverlay } from "@components/product/product-image-overlay";
import { ImageCardPart } from "@components/cards/image-card-part";

type Props = {
  images: { url: string }[];
  status: Product["status"];
  displaySoldOverlay?: boolean;
  productTitle?: string;
};

export const ImageGallery = ({
  images,
  status,
  displaySoldOverlay,
  productTitle,
}: Props) => {
  if (images.length === 0) {
    return null;
  }

  const altFor = (n: number) =>
    productTitle
      ? `${productTitle} – återbrukat byggmaterial på RebuildR (bild ${n})`
      : undefined;

  if (images.length < 3) {
    return (
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          gap: 8,
          aspectRatio: 1.09,
        }}
      >
        <ImageCardPart
          imageUrl={images[0]?.url}
          sold={false}
          position="full"
          imageAspectRatio={0}
          alt={altFor(1)}
        />
        {status === ProductStatusEnum.Sold && displaySoldOverlay && (
          <ProductImageOverlay text="Såld" />
        )}
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        flexDirection: "row",
        gap: 8,
        aspectRatio: 1.09,
      }}
    >
      <ImageCardPart
        imageUrl={images[0]?.url}
        sold={false}
        position="left"
        imageAspectRatio={0}
        alt={altFor(1)}
      />
      <View style={{ flex: 1, justifyContent: "space-between", gap: 8 }}>
        <ImageCardPart
          imageUrl={images[1]?.url}
          sold={false}
          position="up"
          imageAspectRatio={0}
          alt={altFor(2)}
        />
        <ImageCardPart
          imageUrl={images[2]?.url}
          sold={false}
          position="down"
          imageAspectRatio={0}
          alt={altFor(3)}
        />
      </View>
      {status === ProductStatusEnum.Sold && displaySoldOverlay && (
        <ProductImageOverlay text="Såld" />
      )}
    </View>
  );
};
