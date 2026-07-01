import {
  CancelInternalAdReservationMutation,
  CancelInternalAdReservationMutationVariables,
  InternalAdDetailQuery,
  InternalAdDetailQueryVariables,
  MarkInternalAdSoldMutation,
  MarkInternalAdSoldMutationVariables,
  OrganizationMemberRoleEnum,
  ProductStatusEnum,
  ReserveInternalAdMutation,
  ReserveInternalAdMutationVariables,
} from "@/gql/graphql";
import {
  CANCEL_INTERNAL_AD_RESERVATION,
  INTERNAL_AD_DETAIL,
  MARK_INTERNAL_AD_SOLD,
  RESERVE_INTERNAL_AD,
} from "@/queries/internal-ads";
import { useMutation, useQuery } from "@apollo/client";
import { Button } from "@components/buttons/button";
import { TextInput } from "@components/forms/textInput";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import TopBar from "@components/navigation/top-bar/top-bar";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { Body, Display, Label, Title } from "@components/typography/text";
import { primitives } from "@constants/colors";
import { borderRadius } from "@constants/sizes";
import { useScreenType } from "@hooks/useScreenType";
import { useThemeColor } from "@hooks/useThemeColor";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { View } from "react-native";

export default function InternalAdDetailPage() {
  const { productId } = useLocalSearchParams<{ productId: string }>();
  const colors = useThemeColor();
  const { isDesktop } = useScreenType();
  const [quantity, setQuantity] = useState("1");

  const { data, loading, refetch } = useQuery<
    InternalAdDetailQuery,
    InternalAdDetailQueryVariables
  >(INTERNAL_AD_DETAIL, {
    variables: { productId },
  });

  const [reserveInternalAd, { loading: reserving }] = useMutation<
    ReserveInternalAdMutation,
    ReserveInternalAdMutationVariables
  >(RESERVE_INTERNAL_AD);
  const [cancelReservation, { loading: canceling }] = useMutation<
    CancelInternalAdReservationMutation,
    CancelInternalAdReservationMutationVariables
  >(CANCEL_INTERNAL_AD_RESERVATION);
  const [markSold, { loading: markingSold }] = useMutation<
    MarkInternalAdSoldMutation,
    MarkInternalAdSoldMutationVariables
  >(MARK_INTERNAL_AD_SOLD);

  const product = data?.internalAd;
  const activeReservations = useMemo(
    () =>
      product?.internalReservations.filter(
        (reservation) => !reservation.canceledAt && !reservation.soldAt,
      ) ?? [],
    [product?.internalReservations],
  );
  const reservedQuantity = activeReservations.reduce(
    (sum, reservation) => sum + (reservation.quantity ?? 0),
    0,
  );
  const availableQuantity = product?.soldByQuantity
    ? Math.max(0, (product.primaryQuantity ?? 0) - reservedQuantity)
    : activeReservations.length
      ? 0
      : 1;
  const isAdmin =
    data?.internalAdsOrganizationContext?.role ===
    OrganizationMemberRoleEnum.Admin;
  const canMarkSold = isAdmin || data?.me.id === product?.createdByUserId;

  const onReserve = async () => {
    if (!product) return;
    await reserveInternalAd({
      variables: {
        input: {
          productId: product.id,
          quantity: product.soldByQuantity ? parseInt(quantity, 10) : undefined,
        },
      },
    });
    await refetch();
  };

  const onCancel = async (reservationId: string) => {
    await cancelReservation({ variables: { reservationId } });
    await refetch();
  };

  const onMarkSold = async (reservationId?: string) => {
    if (!product) return;
    await markSold({
      variables: { input: { productId: product.id, reservationId } },
    });
    await refetch();
  };

  if (loading) return <LoadingSpinner />;
  if (!product) {
    return (
      <View style={{ flex: 1, backgroundColor: primitives.accent100 }}>
        <TopBar theme="light" showSearchBar={false} />
        <ScreenLayout style={{ backgroundColor: primitives.accent100 }}>
          <Display size="small">Annonsen finns inte</Display>
        </ScreenLayout>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: primitives.accent100 }}>
      <TopBar theme="light" showSearchBar={false} />
      <ScreenLayout
        desktopFooter
        contentHorizontalPadding={isDesktop ? 75 : 16}
        style={{ backgroundColor: primitives.accent100, gap: 24 }}
      >
        <Button
          label="Tillbaka till Internlagret"
          type="text"
          onPress={() => router.navigate("/internal-ads")}
          style={{ alignSelf: "flex-start" }}
        />
        <View
          style={{
            flexDirection: isDesktop ? "row" : "column",
            gap: 24,
            alignItems: "flex-start",
          }}
        >
          <View style={{ flex: 1, width: "100%", gap: 12 }}>
            <Image
              source={{ uri: product.images[0]?.url }}
              style={{
                aspectRatio: 1,
                borderRadius: borderRadius.medium,
                backgroundColor: colors.buttons.tonal.enabled,
              }}
            />
            {product.images.length > 1 && (
              <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
                {product.images.slice(1).map((image) => (
                  <Image
                    key={image.id}
                    source={{ uri: image.url }}
                    style={{
                      width: 84,
                      height: 84,
                      borderRadius: borderRadius.small,
                      backgroundColor: colors.buttons.tonal.enabled,
                    }}
                  />
                ))}
              </View>
            )}
          </View>

          <View
            style={{
              flex: 1,
              width: "100%",
              backgroundColor: colors.background.neutral,
              borderRadius: borderRadius.medium,
              padding: 16,
              gap: 20,
            }}
          >
            <View style={{ gap: 8 }}>
              <Label size="medium" color="secondary">
                {product.category?.parent?.name
                  ? `${product.category.parent.name} / ${product.category.name}`
                  : product.category?.name}
              </Label>
              <Display size="small" heading={1}>
                {product.title}
              </Display>
              <Body size="large" color="secondary">
                {product.description}
              </Body>
              {!!product.additionalInfo && (
                <Body size="medium">{product.additionalInfo}</Body>
              )}
            </View>

            <View style={{ gap: 6 }}>
              <Title size="medium">Lagerstatus</Title>
              <Body size="medium" color="secondary">
                {product.status === ProductStatusEnum.Sold
                  ? "Såld"
                  : product.soldByQuantity
                    ? `${availableQuantity} av ${product.primaryQuantity ?? 0} kvar`
                    : activeReservations.length
                      ? "Reserverad"
                      : "Tillgänglig"}
              </Body>
              {product.approximatePlace?.address && (
                <Body size="small" color="secondary">
                  Plats: {product.approximatePlace.address}
                </Body>
              )}
            </View>

            {product.status !== ProductStatusEnum.Sold && (
              <View style={{ gap: 8 }}>
                {product.soldByQuantity && (
                  <TextInput
                    inputType="numeric"
                    value={quantity}
                    onChange={setQuantity}
                    placeholder="Antal"
                  />
                )}
                <Button
                  label="Reservera"
                  onPress={onReserve}
                  loading={reserving}
                  disabled={availableQuantity <= 0}
                />
              </View>
            )}

            <View style={{ gap: 12 }}>
              <Title size="medium">Reservationer</Title>
              {activeReservations.length ? (
                activeReservations.map((reservation) => (
                  <View key={reservation.id} style={{ gap: 8 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        gap: 12,
                      }}
                    >
                      <Body size="medium">
                        {reservation.reservedByUser.name ??
                          reservation.reservedByUser.username ??
                          reservation.reservedByUser.email}
                        {reservation.quantity
                          ? ` · ${reservation.quantity}`
                          : ""}
                      </Body>
                      <Label size="medium">
                        {new Date(reservation.reservedAt).toLocaleDateString(
                          "sv-SE",
                        )}
                      </Label>
                    </View>
                    <View
                      style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}
                    >
                      <Button
                        label="Avboka"
                        type="tonal"
                        onPress={() => onCancel(reservation.id)}
                        loading={canceling}
                      />
                      {canMarkSold && (
                        <Button
                          label="Markera såld"
                          onPress={() => onMarkSold(reservation.id)}
                          loading={markingSold}
                        />
                      )}
                    </View>
                  </View>
                ))
              ) : (
                <Body size="medium" color="secondary">
                  Inga aktiva reservationer.
                </Body>
              )}
            </View>

            {canMarkSold && product.status !== ProductStatusEnum.Sold && (
              <Button
                label="Markera hela annonsen som såld"
                type="tonal"
                onPress={() => onMarkSold()}
                loading={markingSold}
              />
            )}
          </View>
        </View>
      </ScreenLayout>
    </View>
  );
}
