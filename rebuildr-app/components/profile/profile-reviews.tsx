import { View } from "react-native";
import React from "react";
import { ProfileQuery } from "@/gql/graphql";
import { Icon } from "@icons/icon";
import { Body, Display } from "@components/typography/text";
import { ReviewsAccordion } from "./reviews-accordion";
import { borderRadius } from "@constants/sizes";
import { Divider } from "@components/dividers/divider";
import { EmptyStateCard } from "@components/cards/empty-state-card";
import { useThemeColor } from "@hooks/useThemeColor";
import { useScreenType } from "@hooks/useScreenType";
import { AccordionSection } from "@components/sections/accordion-section";
import { formatRating } from "@/utils/formattings";

type Props = {
  isMyProfile: boolean;
  profileQuery: ProfileQuery;
};

export default function ProfileReviews({ isMyProfile, profileQuery }: Props) {
  const { isDesktop, isMobile } = useScreenType();
  const user = profileQuery.user;
  const colors = useThemeColor();

  const salesReviewed = user.reviewed.filter(
    (review) => review.purchase.buyerId !== user.id,
  );
  const buysReviewed = user.reviewed.filter(
    (review) => review.purchase.buyerId === user.id,
  );
  const noReviewsText = isMyProfile
    ? "Inga omdömen än"
    : "Inga omdömen här just nu";
  const noSalesText = isMyProfile
    ? "Du har inte fått några omdömen ännu. När någon genomför ett köp kan de lämna en recension som hamnar här!"
    : "Den här säljaren har inte fått några omdömen ännu. När någon genomför ett köp kan de lämna en recension här!";
  const noBuysText = isMyProfile
    ? "Du har inte fått några omdömen ännu. När du genomför ett köp kan säljaren lämna en recension som hamnar här!"
    : "Den här köparen har inte fått några omdömen ännu. När någon genomför ett köp kan säljaren lämna en recension här!";

  const emptyReviewsContent = () => {
    if (isMobile) {
      return (
        <EmptyStateCard header={noReviewsText} description={noSalesText} />
      );
    }
    return (
      <View style={{ gap: 24 }}>
        <AccordionSection initialOpen title="Från andra köpare">
          <EmptyStateCard header={noReviewsText} description={noSalesText} />
        </AccordionSection>
        <Divider />
        <AccordionSection initialOpen title="Från andra säljare">
          <EmptyStateCard header={noReviewsText} description={noBuysText} />
        </AccordionSection>
      </View>
    );
  };

  return (
    <View
      style={
        isDesktop
          ? { flexDirection: "row", gap: 48, marginTop: 16 }
          : { flexDirection: "column", gap: 16, marginTop: 16 }
      }
    >
      <View
        style={
          isDesktop
            ? { flex: 1, paddingVertical: 16, gap: 48, flexDirection: "row" }
            : { paddingVertical: 16, gap: 48, flexDirection: "row" }
        }
      >
        <View style={{ paddingRight: 12 }}>
          <Display size="large" style={{ marginBottom: 14 }}>
            {formatRating(user.rating ?? 0)}
          </Display>
          <View style={{ flexDirection: "row", gap: 3 }}>
            {[...Array(5)].map((_, i) => {
              const size = 10;
              const rating = user.rating ?? 0;
              const fillPercent = Math.min(1, Math.max(0, rating - i));

              return (
                <View key={i}>
                  <Icon icon="star" size={10} color="disabled" />
                  <View
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: size * fillPercent,
                      height: size,
                      overflow: "hidden",
                    }}
                  >
                    <Icon icon="star" size={10} color="link" />
                  </View>
                </View>
              );
            })}
          </View>
          <Body size="small" style={{ marginTop: 4 }}>
            {user.reviewed.length} recensioner
          </Body>
        </View>
        <View style={{ gap: 4, flex: 1 }}>
          {[...Array(5)].map((_, i) => {
            const nrOfThisRating = user.reviewed.reduce(
              (acc, curr) => acc + (curr.stars === 5 - i ? 1 : 0),
              0,
            );
            const fillPercent = user.reviewed.length
              ? nrOfThisRating / user.reviewed.length
              : 0;
            return (
              <View
                key={i}
                style={{
                  flexDirection: "row",
                  gap: 8,
                  alignItems: "center",
                }}
              >
                <Body size="small">{5 - i}</Body>
                <View
                  style={{
                    borderRadius: borderRadius.small,
                    backgroundColor: colors.buttons.tonal.hovered,
                    height: 8,
                    flex: 1,
                  }}
                >
                  <View
                    style={{
                      borderRadius: borderRadius.small,
                      position: "absolute",
                      width: `${fillPercent * 100}%`,
                      height: "100%",
                      backgroundColor: colors.buttons.filled.enabled,
                    }}
                  />
                </View>
              </View>
            );
          })}
        </View>
      </View>
      {!isDesktop && <Divider />}
      {user.reviewed.length > 0 ? (
        <View style={isDesktop ? { flex: 2, gap: 24 } : { gap: 24 }}>
          <ReviewsAccordion
            title="Från andra köpare"
            reviews={salesReviewed}
            emptyDescription="Inga omdömen från köpare ännu"
            emptyCardSection={
              isDesktop ? (
                <View style={{ paddingTop: 16 }}>
                  <EmptyStateCard
                    header={noReviewsText}
                    description={noSalesText}
                  />
                </View>
              ) : undefined
            }
          />
          <Divider />
          <ReviewsAccordion
            title="Från andra säljare"
            reviews={buysReviewed}
            emptyDescription="Inga omdömen från säljare ännu"
            emptyCardSection={
              isDesktop ? (
                <View style={{ paddingTop: 16 }}>
                  <EmptyStateCard
                    header={noReviewsText}
                    description={noBuysText}
                  />
                </View>
              ) : undefined
            }
          />
        </View>
      ) : (
        <View style={isDesktop ? { flex: 2 } : {}}>
          {emptyReviewsContent()}
        </View>
      )}
    </View>
  );
}
