import { View } from "react-native";
import { Image } from "expo-image";
import PlaceholderProfile from "@assets/images/placeholder-profile.png";
import PlaceholderProfileBusiness from "@assets/images/placeholder-profile-business.png";
import { Body, Title } from "@components/typography/text";
import { Icon } from "@icons/icon";
import { Badge } from "@components/badges/badge";

type Props = {
  isBusiness?: boolean;
  username?: string | null;
  numberOfPublishedProducts: number;
  numberOfSoldProducts: number;
  rating?: number | null;
};

export const UserCard = ({
  isBusiness,
  username,
  numberOfPublishedProducts,
  numberOfSoldProducts,
  rating,
}: Props) => {
  return (
    <View style={{ flexDirection: "row", gap: 16 }}>
      <Image
        source={
          isBusiness ? PlaceholderProfileBusiness.uri : PlaceholderProfile.uri
        }
        style={{ width: 64, height: 64 }}
      />
      <View>
        <Title size="medium" style={{ marginBottom: 4 }}>
          {username}
        </Title>
        <Body size="small">
          {numberOfPublishedProducts} annonser • {numberOfSoldProducts} sålda
        </Body>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
          <Icon icon="star" size={10} />
          <Body size="small">{rating ?? 3}</Body>
          {isBusiness && (
            <View>
              <Badge size="medium" text="Företag" />
            </View>
          )}
        </View>
      </View>
    </View>
  );
};
