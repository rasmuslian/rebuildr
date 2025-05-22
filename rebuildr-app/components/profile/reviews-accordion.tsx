import { UserType } from "@/gql/graphql";
import { Body, Headline, Title } from "@components/typography/text";
import { borderRadius } from "@constants/sizes";
import { useThemeColor } from "@hooks/useThemeColor";
import { Icon } from "@icons/icon";
import { useState } from "react";
import { View } from "react-native";
import { Pressable } from "react-native-gesture-handler";
import { Image } from "expo-image";
import PlaceholderProfile from "@assets/images/placeholder-profile.png";
import PlaceholderProfileBusiness from "@assets/images/placeholder-profile-business.png";
import dayjs from "dayjs";
import { Button } from "@components/buttons/button";

type Props = {
  reviews: {
    stars: number;
    review: string;
    createdAt: Date;
    reviewer: {
      username?: string | null;
      profilePicture?: { url: string } | null;
      type: UserType;
    };
  }[];
  title: string;
};

export const ReviewsAccordion = ({ reviews, title }: Props) => {
  const [open, setOpen] = useState(true);
  const [segments, setSegments] = useState(1);
  const segmentSize = 8;

  const colors = useThemeColor();

  return (
    <View style={{ gap: 16 }}>
      <Pressable onPress={() => setOpen(!open)}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Headline size="small">{title}</Headline>
          <Icon icon={open ? "chevronUp" : "chevronDown"} />
        </View>
      </Pressable>
      {open && (
        <View style={{ gap: 16 }}>
          {reviews.slice(0, segmentSize * segments).map((review, i) => (
            <View
              key={i}
              style={{
                borderRadius: borderRadius.medium,
                backgroundColor: colors.buttons.tonal.enabled,
                padding: 16,
                gap: 12,
              }}
            >
              <View
                style={{ flexDirection: "row", gap: 8, alignItems: "center" }}
              >
                <Image
                  source={
                    review.reviewer.profilePicture?.url
                      ? review.reviewer.profilePicture.url
                      : review.reviewer.type === UserType.Business
                        ? PlaceholderProfileBusiness.uri
                        : PlaceholderProfile.uri
                  }
                  style={{ width: 40, height: 40, borderRadius: 38 }}
                />
                <View style={{ gap: 2 }}>
                  <Title size="small">{review.reviewer.username}</Title>
                  <Body size="small">
                    {dayjs(review.createdAt).format("DD MMM, YYYY")}
                  </Body>
                </View>
              </View>
              <View
                style={{ flexDirection: "row", gap: 3, alignItems: "center" }}
              >
                {[...Array(review.stars)].map((_, i) => (
                  <Icon key={i} icon="star" color="link" size={10} />
                ))}
              </View>
              <Body size="small">{review.review}</Body>
            </View>
          ))}
          {reviews.length > segments * segmentSize && (
            <Button
              label="Läs in fler"
              onPress={() => setSegments(segments + 1)}
            />
          )}
        </View>
      )}
    </View>
  );
};
