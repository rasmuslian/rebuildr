import { View } from "react-native";
import { Image } from "expo-image";
import PlaceholderProfile from "@assets/images/placeholder-profile.png";
import PlaceholderProfileBusiness from "@assets/images/placeholder-profile-business.png";
import { Body, Title } from "@components/typography/text";
import { Icon } from "@icons/icon";
import { Badge } from "@components/badges/badge";
import { UserType } from "@/gql/graphql";

type Props = {
  userType?: UserType;
  profilePictureUrl?: string;
  username?: string | null;
  numberOfPublishedProducts: number;
  numberOfSoldProducts: number;
  rating?: number | null;
};

export const UserCard = ({
  userType,
  profilePictureUrl,
  username,
  numberOfPublishedProducts,
  numberOfSoldProducts,
  rating,
}: Props) => {
  const isBusiness = userType ? userType === UserType.Business : false;
  return (
    <View style={{ flexDirection: "row", gap: 16 }}>
      <Image
        source={
          profilePictureUrl
            ? profilePictureUrl
            : isBusiness
              ? PlaceholderProfileBusiness.uri
              : PlaceholderProfile.uri
        }
        style={{ width: 64, height: 64, borderRadius: 38 }}
      />
      <View>
        <Title size="medium" style={{ marginBottom: 4 }}>
          {username}
        </Title>
        <Body size="small">
          {numberOfPublishedProducts} annonser • {numberOfSoldProducts} sålda
        </Body>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 2,
            marginTop: 4,
          }}
        >
          {!!rating && <Icon icon="star" size={10} />}
          <Body size="small">{rating}</Body>
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
