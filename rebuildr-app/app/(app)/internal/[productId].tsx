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
import { FilterChip } from "@components/chips/filterChip";
import { CollapsableText } from "@components/collapsable-text/collapsable-text";
import { Divider } from "@components/dividers/divider";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import TopBar from "@components/navigation/top-bar/top-bar";
import { Popup } from "@components/popup/popup";
import { AllImages } from "@components/preview-product/all-images";
import { AllImagesPopupContent } from "@components/preview-product/all-images-popup-content";
import { Breadcrumbs } from "@components/preview-product/breadcrumbs";
import { ImageCarousel } from "@components/preview-product/image-carousel";
import { ImageGallery } from "@components/preview-product/image-gallery";
import { QuantityStepper } from "@components/preview-product/quantity-stepper";
import {
  SCREEN_TOP_MARGIN,
  ScreenLayout,
} from "@components/screen-layout/screen-layout";
import {
  Body,
  Display,
  Headline,
  Label,
  Title,
} from "@components/typography/text";
import { primitives } from "@constants/colors";
import { conditions } from "@constants/conditions";
import { quantities } from "@constants/quantities";
import { useScreenType } from "@hooks/useScreenType";
import { useThemeColor } from "@hooks/useThemeColor";
import * as Linking from "expo-linking";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, useWindowDimensions, View } from "react-native";

export default function InternalAdDetailPage() {
  const { productId } = useLocalSearchParams<{ productId: string }>();
  const { isDesktop } = useScreenType();
  const { height: screenHeight } = useWindowDimensions();
  const [quantity, setQuantity] = useState(1);
  const [rightColumnWidth, setRightColumnWidth] = useState(0);
  const [showImagePopup, setShowImagePopup] = useState(false);

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
  useEffect(() => {
    if (product?.soldByQuantity && quantity > availableQuantity) {
      setQuantity(Math.max(1, availableQuantity));
    }
  }, [availableQuantity, product?.soldByQuantity, quantity]);
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
          quantity: product.soldByQuantity ? quantity : undefined,
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
      <ScreenLayout headerComponent={<InternalAdsTopBar />}>
        <Display size="small">Annonsen finns inte</Display>
      </ScreenLayout>
    );
  }

  const content = (
    <InternalAdContent
      product={product}
      activeReservations={activeReservations}
      availableQuantity={availableQuantity}
      quantity={quantity}
      setQuantity={setQuantity}
      reserving={reserving}
      canceling={canceling}
      markingSold={markingSold}
      currentUserId={data?.me.id ?? ""}
      canMarkSold={canMarkSold}
      onReserve={onReserve}
      onCancel={onCancel}
      onMarkSold={onMarkSold}
      showReserveButton={isDesktop}
    />
  );

  const secondaryContent = product.approximatePlace?.address ? (
    <>
      <Divider />
      <View style={{ gap: 8 }}>
        <Headline size="small">Plats för avhämtning</Headline>
        <Body size="medium">{product.approximatePlace.address}</Body>
      </View>
    </>
  ) : null;

  if (!isDesktop) {
    return (
      <ScreenLayout
        headerComponent={<InternalAdsTopBar />}
        footerBorder={product.status !== ProductStatusEnum.Sold}
        footerComponent={
          product.status !== ProductStatusEnum.Sold ? (
            <Button
              label="Reservera"
              onPress={onReserve}
              loading={reserving}
              disabled={availableQuantity <= 0}
            />
          ) : undefined
        }
        style={{ gap: 24, marginTop: 8 }}
      >
        <ImageCarousel
          images={product.images}
          status={product.status}
          productTitle={product.title}
        />
        {content}
        {!!product.images.length && (
          <>
            <Divider />
            <AllImages images={product.images} />
          </>
        )}
        {secondaryContent}
      </ScreenLayout>
    );
  }

  const imageGalleryHeight = screenHeight - 72 - 48;

  return (
    <>
      <ScreenLayout desktopFooter headerComponent={<InternalAdsTopBar />}>
        <View style={{ gap: 48 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-start",
              gap: 48,
              position: "relative",
            }}
          >
            <View
              style={{
                position: "sticky",
                top: SCREEN_TOP_MARGIN,
                flex: 3,
                height: imageGalleryHeight,
                marginRight: 16,
              }}
            >
              <ImageGallery
                images={product.images}
                status={product.status}
                productTitle={product.title}
                displaySoldOverlay
              />
              {!!product.images.length && (
                <View style={{ position: "absolute", top: 24, left: 24 }}>
                  <Button
                    label="Visa alla bilder"
                    type="filled"
                    theme="dark"
                    showShadow
                    onPress={() => setShowImagePopup(true)}
                  />
                </View>
              )}
            </View>

            <View
              style={{ flex: 1, gap: 24 }}
              onLayout={(event) => {
                setRightColumnWidth(event.nativeEvent.layout.width);
              }}
            >
              {content}
              {!!product.images.length && (
                <AllImages
                  images={product.images}
                  imagesPerRow={3}
                  parentWidth={rightColumnWidth}
                  onAllImagesPress={() => setShowImagePopup(true)}
                />
              )}
              {secondaryContent}
            </View>
          </View>
        </View>
      </ScreenLayout>
      <Popup
        open={showImagePopup}
        onClose={() => setShowImagePopup(false)}
        type="full"
      >
        <AllImagesPopupContent images={product.images} />
      </Popup>
    </>
  );
}

const InternalAdsTopBar = () => {
  const colors = useThemeColor();

  return (
    <TopBar
      theme="light"
      showSearchBar={false}
      sellButtonLabel="Ny intern annons"
      onSellButtonPress={() =>
        router.navigate({
          pathname: "/internal",
          params: { action: "create", t: Date.now().toString() },
        })
      }
      backgroundColor={primitives.accent100}
      foregroundColor={colors.logo.vector}
      showBottomBorder={false}
      categoriesButtonBackgroundColor={primitives.neutrals100}
    />
  );
};

type InternalAd = NonNullable<InternalAdDetailQuery["internalAd"]>;
type InternalReservation = InternalAd["internalReservations"][number];

type InternalAdContentProps = {
  product: InternalAd;
  activeReservations: InternalReservation[];
  availableQuantity: number;
  quantity: number;
  setQuantity: (quantity: number) => void;
  reserving: boolean;
  canceling: boolean;
  markingSold: boolean;
  currentUserId: string;
  canMarkSold: boolean;
  onReserve: () => Promise<void>;
  onCancel: (reservationId: string) => Promise<void>;
  onMarkSold: (reservationId?: string) => Promise<void>;
  showReserveButton: boolean;
};

const InternalAdContent = ({
  product,
  activeReservations,
  availableQuantity,
  quantity,
  setQuantity,
  reserving,
  canceling,
  markingSold,
  currentUserId,
  canMarkSold,
  onReserve,
  onCancel,
  onMarkSold,
  showReserveButton,
}: InternalAdContentProps) => {
  const stockStatus =
    product.status === ProductStatusEnum.Sold
      ? "Såld"
      : product.soldByQuantity
        ? "Tillgänglig"
        : activeReservations.length
          ? "Reserverad"
          : "Tillgänglig";

  return (
    <View style={{ gap: 24 }}>
      <View style={{ gap: 8 }}>
        <Body size="medium" color="secondary">
          Internlagret
        </Body>
        <Breadcrumbs
          parentCategory={product.category?.parent}
          category={product.category}
        />
      </View>

      <View>
        <Title size="large" heading={1}>
          {product.title}
        </Title>
        <Body size="large" color="secondary">
          {product.primaryQuantity ?? 0}{" "}
          {product.primaryUnit ? quantities[product.primaryUnit].plural : "st"}{" "}
          • {conditions[product.condition].name}
        </Body>
      </View>

      <View>
        <Headline size="large" style={{ marginBottom: 8 }}>
          {stockStatus}
        </Headline>
        {product.status !== ProductStatusEnum.Sold &&
          product.soldByQuantity && (
            <Body size="medium" color="secondary">
              {availableQuantity} av {product.primaryQuantity ?? 0} kvar
            </Body>
          )}
      </View>

      <Divider />

      <View style={{ gap: 16 }}>
        <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
          {!!product.primaryQuantity && product.primaryUnit && (
            <ProductChip
              text="Antal"
              boldText={`${product.primaryQuantity} ${quantities[product.primaryUnit].plural}`}
            />
          )}
          {!!product.secondaryQuantity && product.secondaryUnit && (
            <ProductChip
              text="Ytterligare antal"
              boldText={`${product.secondaryQuantity} ${quantities[product.secondaryUnit].plural}`}
            />
          )}
          <ProductChip
            text="Skick"
            boldText={conditions[product.condition].name}
          />
          {!!product.brand?.name && (
            <ProductChip text="Varumärke" boldText={product.brand.name} />
          )}
        </View>

        {!!product.description && (
          <CollapsableText
            text={product.description}
            readLess="Läs mindre"
            readMore="Läs hela beskrivningen"
          />
        )}
      </View>

      {product.status !== ProductStatusEnum.Sold && (
        <View style={{ gap: 8 }}>
          {product.soldByQuantity && (
            <QuantityStepper
              value={quantity}
              onChange={setQuantity}
              max={availableQuantity}
              unit={product.primaryUnit ?? undefined}
            />
          )}
          {showReserveButton && (
            <Button
              label="Reservera"
              onPress={onReserve}
              loading={reserving}
              disabled={availableQuantity <= 0}
            />
          )}
        </View>
      )}

      <Reservations
        reservations={activeReservations}
        currentUserId={currentUserId}
        canMarkSold={canMarkSold}
        canceling={canceling}
        markingSold={markingSold}
        onCancel={onCancel}
        onMarkSold={onMarkSold}
        unit={product.primaryUnit ?? undefined}
      />

      {canMarkSold &&
        product.soldByQuantity &&
        product.status !== ProductStatusEnum.Sold && (
          <Button
            label="Markera hela annonsen som såld"
            type="tonal"
            onPress={() => onMarkSold()}
            loading={markingSold}
          />
        )}

      <Divider />

      <View>
        <Headline size="small">Specifikation</Headline>
        <View style={{ gap: 16, marginTop: 16 }}>
          {!!product.brand?.name && (
            <Detail label="Varumärke" value={product.brand.name} />
          )}
          {!!product.internalReferenceNumber && (
            <Detail
              label="Internt id/referensnummer"
              value={product.internalReferenceNumber}
            />
          )}
          <Detail
            label="Antal och enhet"
            value={`${product.primaryQuantity ?? 0} ${product.primaryUnit ? quantities[product.primaryUnit].plural : "st"}`}
          />
          {!!product.secondaryQuantity && product.secondaryUnit && (
            <Detail
              label="Ytterligare antal"
              value={`${product.secondaryQuantity} ${quantities[product.secondaryUnit].plural}`}
            />
          )}
          <Detail label="Skick" value={conditions[product.condition].name} />
          {!!product.additionalInfo && (
            <View style={{ gap: 4 }}>
              <Label size="medium">Bra att veta</Label>
              <CollapsableText
                text={product.additionalInfo}
                readLess="Läs mindre"
                readMore="Läs hela"
              />
            </View>
          )}
          {!!product.documents.length && (
            <View style={{ gap: 8 }}>
              <Label size="medium">Dokument</Label>
              {product.documents.map((document) => (
                <Pressable
                  key={document.id}
                  onPress={() => Linking.openURL(document.url)}
                >
                  <Body size="medium" isLink>
                    {document.name ?? "Öppna dokument"}
                  </Body>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

type ReservationsProps = {
  reservations: InternalReservation[];
  currentUserId: string;
  canMarkSold: boolean;
  canceling: boolean;
  markingSold: boolean;
  onCancel: (reservationId: string) => Promise<void>;
  onMarkSold: (reservationId?: string) => Promise<void>;
  unit?: InternalAd["primaryUnit"];
};

const Reservations = ({
  reservations,
  currentUserId,
  canMarkSold,
  canceling,
  markingSold,
  onCancel,
  onMarkSold,
  unit,
}: ReservationsProps) => (
  <View style={{ gap: 12 }}>
    <Headline size="small">Reservationer</Headline>
    {reservations.length ? (
      reservations.map((reservation) => {
        const canCancel =
          reservation.reservedByUserId === currentUserId || canMarkSold;

        return (
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
                  ? ` · ${reservation.quantity}${unit ? ` ${reservation.quantity === 1 ? quantities[unit].singular : quantities[unit].plural}` : ""}`
                  : ""}
              </Body>
              <Label size="medium">
                {new Date(reservation.reservedAt).toLocaleDateString("sv-SE")}
              </Label>
            </View>
            {canCancel && (
              <View style={{ flexDirection: "row", gap: 8 }}>
                <Button
                  label="Avboka"
                  type="tonal"
                  onPress={() => onCancel(reservation.id)}
                  loading={canceling}
                  style={{ flex: 1 }}
                />
                {canMarkSold && (
                  <Button
                    label="Markera såld"
                    onPress={() => onMarkSold(reservation.id)}
                    loading={markingSold}
                    style={{ flex: 1 }}
                  />
                )}
              </View>
            )}
          </View>
        );
      })
    ) : (
      <Body size="medium" color="secondary">
        Inga aktiva reservationer.
      </Body>
    )}
  </View>
);

type ProductChipProps = {
  text: string;
  boldText: string;
};

const ProductChip = ({ text, boldText }: ProductChipProps) => (
  <FilterChip
    label={
      <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
        <Body size="medium">{text}:</Body>
        <Label size="large">{boldText}</Label>
      </View>
    }
    style={{ backgroundColor: "#F6F6F6", height: 0, paddingVertical: 15 }}
  />
);

type DetailProps = {
  label: string;
  value: string;
};

const Detail = ({ label, value }: DetailProps) => (
  <View style={{ gap: 4 }}>
    <Label size="medium">{label}</Label>
    <Body size="medium">{value}</Body>
  </View>
);
