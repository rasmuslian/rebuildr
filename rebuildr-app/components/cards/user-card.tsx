import { View } from "react-native";
import { Body, Label, Title } from "@components/typography/text";
import { Icon } from "@icons/icon";
import { Badge } from "@components/badges/badge";
import { UserType } from "@/gql/graphql";
import { Avatar } from "@components/avatar/avatar";
import { formatRating } from "@/utils/formattings";

type Props = {
  userType?: UserType;
  profilePictureUrl?: string;
  username?: string | null;
  numberOfPublishedProducts: number;
  numberOfSoldProducts: number;
  rating?: number | null;
  reviewCount?: number;
  memberSinceYear?: number;
};

export const UserCard = ({
  userType,
  profilePictureUrl,
  username,
  numberOfPublishedProducts,
  numberOfSoldProducts,
  rating,
  reviewCount,
  memberSinceYear,
}: Props) => {
  const isBusiness = userType ? userType === UserType.Business : false;
  return (
    <View style={{ flexDirection: "row", gap: 16, alignItems: "center" }}>
      <Avatar
        placeholder={userType}
        imageUrl={profilePictureUrl}
        size="medium"
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
          {typeof rating === "number" && (
            <>
              <Icon icon="star" size={10} />
              <Body size="small">
                {formatRating(rating)}
                {typeof reviewCount === "number" && ` · ${reviewCount} omdömen`}
              </Body>
            </>
          )}
          {isBusiness && (
            <View>
              <Badge size="medium" text="Företag" />
            </View>
          )}
        </View>
        {memberSinceYear && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
              marginTop: 4,
            }}
          >
            <Label size="small" color="secondary">
              Medlem sedan {memberSinceYear}
            </Label>
          </View>
        )}
      </View>
    </View>
  );
};
