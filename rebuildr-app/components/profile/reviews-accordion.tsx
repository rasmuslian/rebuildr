import { UserType } from "@/gql/graphql";
import { Body, Title } from "@components/typography/text";
import { borderRadius } from "@constants/sizes";
import { useThemeColor } from "@hooks/useThemeColor";
import { Icon } from "@icons/icon";
import { useState } from "react";
import { View } from "react-native";
import dayjs from "dayjs";
import { Button } from "@components/buttons/button";
import { Avatar } from "@components/avatar/avatar";
import { AccordionSection } from "@components/sections/accordion-section";

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
  emptyDescription: string;
};

export const ReviewsAccordion = ({
  reviews,
  title,
  emptyDescription,
}: Props) => {
  const [segments, setSegments] = useState(1);
  const segmentSize = 8;

  const colors = useThemeColor();
  const noReviews = reviews.length === 0;

  return (
    <View style={{ gap: 16 }}>
      <AccordionSection initialOpen title={title} hideGap={noReviews}>
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
                <Avatar
                  placeholder={review.reviewer.type}
                  imageUrl={review.reviewer.profilePicture?.url}
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
          {noReviews && (
            <Body
              size="medium"
              style={{
                color: colors.text.secondary,
              }}
            >
              {emptyDescription}
            </Body>
          )}
        </View>
      </AccordionSection>
    </View>
  );
};
