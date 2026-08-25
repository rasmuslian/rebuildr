import {
  CancelInternalAdReservationMutation,
  CancelInternalAdReservationMutationVariables,
  InternalAdDetailQuery,
  InternalAdDetailQueryVariables,
  MarkInternalAdSoldMutation,
  MarkInternalAdSoldMutationVariables,
  ProductAvailabilityEnum,
  ProductStatusEnum,
  ReserveInternalAdMutation,
  ReserveInternalAdMutationVariables,
  SetInternalAdPublicAvailabilityMutation,
  SetInternalAdPublicAvailabilityMutationVariables,
} from "@/gql/graphql";
import {
  CANCEL_INTERNAL_AD_RESERVATION,
  INTERNAL_AD_DETAIL,
  MARK_INTERNAL_AD_SOLD,
  SET_INTERNAL_AD_PUBLIC_AVAILABILITY,
  RESERVE_INTERNAL_AD,
} from "@/queries/internal-ads";
import { gql, useMutation, useQuery } from "@apollo/client";
import { Button } from "@components/buttons/button";
import { FilterChip } from "@components/chips/filterChip";
import { TextInput } from "@components/forms/textInput";
import { SelectInput } from "@components/forms/selectInput";
import { CollapsableText } from "@components/collapsable-text/collapsable-text";
import { Divider } from "@components/dividers/divider";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { InternalTopBar } from "@components/navigation/internal-top-bar/internal-top-bar";
import { Popup } from "@components/popup/popup";
import { SlideInSheet } from "@components/slide-in-sheet/slide-in-sheet";
import { AllImages } from "@components/preview-product/all-images";
import { AllImagesPopupContent } from "@components/preview-product/all-images-popup-content";
import { Breadcrumbs } from "@components/preview-product/breadcrumbs";
import { ImageCarousel } from "@components/preview-product/image-carousel";
import { ImageGallery } from "@components/preview-product/image-gallery";
import { QuantityStepper } from "@components/preview-product/quantity-stepper";
import { AvailabilityBadge } from "@components/product/availability-badge";
import RemoveProduct from "@components/preview-product/remove-product";
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
import { borderRadius } from "@constants/sizes";
import { useScreenType } from "@hooks/useScreenType";
import { useThemeColor } from "@hooks/useThemeColor";
import * as Linking from "expo-linking";
import { router, useLocalSearchParams } from "expo-router";
import { Suspense, useEffect, useMemo, useState } from "react";
import { Pressable, useWindowDimensions, View } from "react-native";
import { Delivery } from "@components/upsert-product/delivery";
import { Pickup } from "@components/upsert-product/pickup";
import { Shipping } from "@components/upsert-product/shipping";
import { ProductFields } from "@components/upsert-product/types";

const ORGANIZATION_MEMBERS = gql` query OrganizationMembersForReservation { organizationMembers { id name email } } `;

const UPDATE_PUBLIC_TRANSPORT = gql`
  mutation UpdateInternalAdPublicTransport($input: UpdateProductInput!) {
    updateProduct(input: $input) {
      product {
        id
      }
    }
  }
`;

export default function InternalAdDetailPage() {
  const { productId } = useLocalSearchParams<{ productId: string }>();
  const { isDesktop } = useScreenType();
  const { height: screenHeight } = useWindowDimensions();
  const [quantity, setQuantity] = useState(1);
  const [rightColumnWidth, setRightColumnWidth] = useState(0);
  const [showImagePopup, setShowImagePopup] = useState(false);
  const [showRemoveProduct, setShowRemoveProduct] = useState(false);
  const [showPublicPricePrompt, setShowPublicPricePrompt] = useState(false);
  const [publicPrice, setPublicPrice] = useState("");
  const [publicPriceError, setPublicPriceError] = useState<string>();
  const [publicPublishError, setPublicPublishError] = useState<string>();
  const [publicTransport, setPublicTransport] = useState<ProductFields>();
  const [reservationMemberId, setReservationMemberId] = useState<string>();
  const { data: membersData } = useQuery<{ organizationMembers: { id: string; name: string; email: string }[] }>(ORGANIZATION_MEMBERS);

  const { data, loading, refetch } = useQuery<any>(INTERNAL_AD_DETAIL, {
    variables: { productId },
  });

  const [reserveInternalAd, { loading: reserving }] = useMutation(RESERVE_INTERNAL_AD);
  const [cancelReservation, { loading: canceling }] = useMutation<
    CancelInternalAdReservationMutation,
    CancelInternalAdReservationMutationVariables
  >(CANCEL_INTERNAL_AD_RESERVATION);
  const [markSold, { loading: markingSold }] = useMutation<
    MarkInternalAdSoldMutation,
    MarkInternalAdSoldMutationVariables
  >(MARK_INTERNAL_AD_SOLD);
  const [setInternalAdPublicAvailability, { loading: makingPublic }] =
    useMutation<
      SetInternalAdPublicAvailabilityMutation,
      SetInternalAdPublicAvailabilityMutationVariables
    >(SET_INTERNAL_AD_PUBLIC_AVAILABILITY);
  const [updatePublicTransport, { loading: savingPublicTransport }] =
    useMutation(UPDATE_PUBLIC_TRANSPORT);

  const product = data?.internalAd;
  const activeReservations = useMemo(
    () =>
      product?.internalReservations.filter(
        (reservation: any) => !reservation.canceledAt && !reservation.soldAt,
      ) ?? [],
    [product?.internalReservations],
  );
  const reservedQuantity = activeReservations.reduce(
    (sum: number, reservation: any) => sum + (reservation.quantity ?? 0),
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
  const canMarkSold = true;
  const canPublishExternally =
    data?.internalAdsOrganizationContext?.canReceivePayout ?? false;

  const updatePublicAvailability = async (price?: number) => {
    if (!product) return;
    await setInternalAdPublicAvailability({
      variables: {
        productId: product.id,
        publiclyAvailable: !product.publiclyAvailable,
        price,
      },
    });
    await refetch();
  };

  const onSetPublicAvailability = async () => {
    if (!product) return;
    if (!product.publiclyAvailable) {
      setPublicTransport(toPublicTransportFields(product));
      const suggestedPrice =
        product.priceSuggestionMin !== null &&
        product.priceSuggestionMin !== undefined &&
        product.priceSuggestionMax !== null &&
        product.priceSuggestionMax !== undefined
          ? Math.round(
              (product.priceSuggestionMin + product.priceSuggestionMax) / 2,
            )
          : product.price;
      setPublicPrice(
        (product.publicPriceConfirmed
          ? product.price / 100
          : suggestedPrice
        ).toString(),
      );
      setPublicPriceError(undefined);
      setPublicPublishError(undefined);
      setShowPublicPricePrompt(true);
      return;
    }
    await updatePublicAvailability();
  };

  const onConfirmPublicPrice = async () => {
    if (!/^\d+$/.test(publicPrice)) {
      setPublicPriceError("Ange ett pris på minst 0 kr.");
      setPublicPublishError(undefined);
      return;
    }
    if (!product || !publicTransport) return;
    const hasTransport =
      publicTransport.pickupEnabled ||
      publicTransport.deliveryEnabled ||
      publicTransport.shippingPrices.length > 0;
    const needsAddress =
      publicTransport.pickupEnabled || publicTransport.deliveryEnabled;
    if (
      !hasTransport ||
      (needsAddress && (!publicTransport.address || !publicTransport.location))
    ) {
      setPublicPublishError(
        "Välj minst ett fraktalternativ och ange adress för avhämtning eller hemtransport.",
      );
      return;
    }
    setPublicPriceError(undefined);
    setPublicPublishError(undefined);
    try {
      if (hasPublicTransportChanges(product, publicTransport)) {
        await updatePublicTransport({
          variables: {
            input: {
              id: product.id,
              pickupEnabled: publicTransport.pickupEnabled,
              deliveryEnabled: publicTransport.deliveryEnabled,
              deliveryPrice: publicTransport.deliveryPrice,
              deliveryRadius: publicTransport.deliveryRadius,
              location: publicTransport.location,
              shippingPriceIds: publicTransport.shippingPrices.map(
                (price) => price.id,
              ),
            },
          },
        });
      }
      await updatePublicAvailability(Number(publicPrice));
      setShowPublicPricePrompt(false);
    } catch {
      // Keep the sheet open so the user can correct missing transport details.
      setPublicPublishError(
        "Kunde inte publicera annonsen. Kontrollera pris och fraktalternativ.",
      );
    }
  };

  const onEdit = () => {
    router.navigate({
      pathname: "/internal",
      params: {
        action: "edit",
        productId,
        t: Date.now().toString(),
      },
    });
  };

  const onReserve = async () => {
    if (!product) return;
    await reserveInternalAd({
      variables: {
        input: {
          productId: product.id,
          quantity: product.soldByQuantity ? quantity : undefined,
          organizationMemberId: reservationMemberId,
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
      <ScreenLayout headerComponent={<InternalAdsTopBar />} headerFullWidth>
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
      makingPublic={makingPublic}
      canPublishExternally={canPublishExternally}
      currentUserId={data?.me.id ?? ""}
      canMarkSold={canMarkSold}
      onSetPublicAvailability={onSetPublicAvailability}
      onEdit={onEdit}
      onRemove={() => setShowRemoveProduct(true)}
      onReserve={onReserve}
      onCancel={onCancel}
      onMarkSold={onMarkSold}
      showReserveButton={isDesktop}
      reservationMemberId={reservationMemberId}
      setReservationMemberId={setReservationMemberId}
      members={membersData?.organizationMembers ?? []}
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
        headerFullWidth
        footerBorder={product.status !== ProductStatusEnum.Sold}
        footerComponent={
          product.status !== ProductStatusEnum.Sold ? (
            <Button
              label="Reservera"
              onPress={onReserve}
              loading={reserving}
              disabled={availableQuantity <= 0 || !reservationMemberId}
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
        <RemoveProduct
          productId={product.id}
          show={showRemoveProduct}
          canDelete
          onDismiss={() => setShowRemoveProduct(false)}
        />
        <PublicPricePrompt
          open={showPublicPricePrompt}
          price={publicPrice}
          transport={publicTransport}
          priceError={publicPriceError}
          error={publicPublishError}
          loading={makingPublic || savingPublicTransport}
          onChange={setPublicPrice}
          onTransportChange={(transport) => setPublicTransport(transport)}
          onConfirm={onConfirmPublicPrice}
          onClose={() => setShowPublicPricePrompt(false)}
        />
      </ScreenLayout>
    );
  }

  const imageGalleryHeight = screenHeight - 72 - 48;

  return (
    <>
      <ScreenLayout
        desktopFooter
        headerComponent={<InternalAdsTopBar />}
        headerFullWidth
      >
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
      <RemoveProduct
        productId={product.id}
        show={showRemoveProduct}
        canDelete
        onDismiss={() => setShowRemoveProduct(false)}
      />
      <PublicPricePrompt
        open={showPublicPricePrompt}
        price={publicPrice}
        transport={publicTransport}
        priceError={publicPriceError}
        error={publicPublishError}
        loading={makingPublic || savingPublicTransport}
        onChange={setPublicPrice}
        onTransportChange={(transport) => setPublicTransport(transport)}
        onConfirm={onConfirmPublicPrice}
        onClose={() => setShowPublicPricePrompt(false)}
      />
    </>
  );
}

type PublicPricePromptProps = {
  open: boolean;
  price: string;
  transport?: ProductFields;
  priceError?: string;
  error?: string;
  loading: boolean;
  onChange: (price: string) => void;
  onTransportChange: (transport: ProductFields) => void;
  onConfirm: () => Promise<void>;
  onClose: () => void;
};

const PublicPricePrompt = ({
  open,
  price,
  transport,
  priceError,
  error,
  loading,
  onChange,
  onTransportChange,
  onConfirm,
  onClose,
}: PublicPricePromptProps) => {
  const [shippingSelected, setShippingSelected] = useState(
    !!transport?.shippingPrices.length,
  );
  useEffect(() => {
    setShippingSelected(!!transport?.shippingPrices.length);
  }, [transport?.shippingPrices.length]);
  const updateTransport = (update: Partial<ProductFields>) => {
    if (transport) onTransportChange({ ...transport, ...update });
  };

  return (
    <SlideInSheet
      open={open}
      onClose={onClose}
      title="Publicera på marknadsplatsen"
      style={{ gap: 24 }}
      bottomMargin={36}
      footer={
        <View
          style={{
            flexDirection: "row",
            gap: 8,
            marginTop: 16,
            paddingBottom: 8,
          }}
        >
          <Button
            label="Avbryt"
            type="outlined"
            onPress={onClose}
            style={{ flex: 1 }}
          />
          <Button
            label="Spara och publicera"
            onPress={onConfirm}
            loading={loading}
            style={{ flex: 1 }}
          />
        </View>
      }
    >
      <View style={{ gap: 24 }}>
        <Body size="medium" color="secondary">
          Bekräfta pris och välj minst ett fraktalternativ för den publika
          annonsen.
        </Body>
        <View style={{ gap: 4 }}>
          <Label size="medium">Pris</Label>
          <TextInput
            inputType="numeric"
            value={price}
            onChange={onChange}
            placeholder="0"
            error={!!priceError}
          />
        </View>
        {transport && (
          <Suspense fallback={<LoadingSpinner />}>
            <View style={{ gap: 16 }}>
              <Pickup
                product={transport}
                update={updateTransport}
                canEdit
                onEditing={() => undefined}
                onEditComplete={() => undefined}
              />
              <Shipping
                product={transport}
                update={updateTransport}
                shippingSelected={shippingSelected}
                onShippingSelected={setShippingSelected}
                onShippingValid={() => undefined}
              />
              <Delivery
                product={transport}
                update={updateTransport}
                canEdit
                onEditing={() => undefined}
                onEditComplete={() => undefined}
              />
            </View>
          </Suspense>
        )}
        {!!priceError && (
          <Body size="small" color="error">
            {priceError}
          </Body>
        )}
        {!!error && (
          <Body size="small" color="error">
            {error}
          </Body>
        )}
      </View>
    </SlideInSheet>
  );
};

const toPublicTransportFields = (
  product: NonNullable<InternalAdDetailQuery["internalAd"]>,
): ProductFields =>
  ({
    address: product.address ?? undefined,
    location: product.location ?? undefined,
    approximatePlace: product.approximatePlace ?? undefined,
    pickupEnabled: product.pickupEnabled,
    deliveryEnabled: product.deliveryEnabled,
    deliveryRadius: product.deliveryRadius ?? undefined,
    deliveryPrice: product.deliveryPrice ?? undefined,
    shippingPrices: product.shippingPrices ?? [],
  }) as ProductFields;

const hasPublicTransportChanges = (
  product: NonNullable<InternalAdDetailQuery["internalAd"]>,
  transport: ProductFields,
) =>
  product.pickupEnabled !== transport.pickupEnabled ||
  product.deliveryEnabled !== transport.deliveryEnabled ||
  (product.deliveryPrice ?? undefined) !== transport.deliveryPrice ||
  (product.deliveryRadius ?? undefined) !== transport.deliveryRadius ||
  product.location?.lat !== transport.location?.lat ||
  product.location?.lng !== transport.location?.lng ||
  (product.shippingPrices ?? []).length !== transport.shippingPrices.length ||
  (product.shippingPrices ?? []).some(
    (shippingPrice) =>
      !transport.shippingPrices.some((item) => item.id === shippingPrice.id),
  );

const InternalAdsTopBar = () => <InternalTopBar />;

type InternalAd = NonNullable<InternalAdDetailQuery["internalAd"]>;
type InternalReservation = any;

type InternalAdContentProps = {
  product: InternalAd;
  activeReservations: InternalReservation[];
  availableQuantity: number;
  quantity: number;
  setQuantity: (quantity: number) => void;
  reserving: boolean;
  canceling: boolean;
  markingSold: boolean;
  makingPublic: boolean;
  canPublishExternally: boolean;
  currentUserId: string;
  canMarkSold: boolean;
  onSetPublicAvailability: () => Promise<void>;
  onEdit: () => void;
  onRemove: () => void;
  onReserve: () => Promise<void>;
  onCancel: (reservationId: string) => Promise<void>;
  onMarkSold: (reservationId?: string) => Promise<void>;
  showReserveButton: boolean;
  reservationMemberId?: string;
  setReservationMemberId: (id: string) => void;
  members: { id: string; name: string; email: string }[];
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
  makingPublic,
  canPublishExternally,
  currentUserId,
  canMarkSold,
  onSetPublicAvailability,
  onEdit,
  onRemove,
  onReserve,
  onCancel,
  onMarkSold,
  showReserveButton,
  reservationMemberId,
  setReservationMemberId,
  members,
}: InternalAdContentProps) => {
  // Older cached listings may not have availability yet; treat them as
  // available so the rollout remains backwards compatible.
  const stockStatus =
    product.status === ProductStatusEnum.Sold
      ? "Såld"
      : product.availability === ProductAvailabilityEnum.Upcoming
        ? "Kommande"
        : product.soldByQuantity
          ? "Tillgänglig"
          : activeReservations.length
            ? "Reserverad"
            : "Tillgänglig";

  return (
    <View style={{ gap: 24 }}>
      <View style={{ gap: 8 }}>
        <Body size="medium" color="secondary">
          Återbanken
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
        <AvailabilityBadge
          availability={product.availability}
          estimatedAvailableAt={product.estimatedAvailableAt}
          availabilityPrecision={product.availabilityPrecision}
          style={{ marginTop: 8 }}
        />
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

      {canMarkSold && (
        <View style={{ flexDirection: "row", gap: 8 }}>
          <Button
            label="Ta bort"
            type="tonal"
            onPress={onRemove}
            style={{ flex: 1 }}
          />
          <Button label="Redigera" onPress={onEdit} style={{ flex: 1 }} />
        </View>
      )}

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
          <SelectInput
            value={reservationMemberId}
            options={members.map((member) => ({ value: member.id, label: member.name }))}
            onSelect={setReservationMemberId}
            placeholder="Välj vem som reserverar"
          />
          {showReserveButton && (
            <Button
              label="Reservera"
              onPress={onReserve}
              loading={reserving}
              disabled={availableQuantity <= 0 || !reservationMemberId}
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

      {canMarkSold && product.status !== ProductStatusEnum.Sold && (
        <PublicAvailabilityCard
          publiclyAvailable={product.publiclyAvailable}
          canPublishExternally={canPublishExternally}
          loading={makingPublic}
          onPress={onSetPublicAvailability}
        />
      )}

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
          {!!(product as any).createdByOrganizationMemberName && (
            <ContactDetail
              label="Upplagd av"
              name={(product as any).createdByOrganizationMemberName}
              email={(product as any).createdByOrganizationMemberEmail ?? undefined}
            />
          )}
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

type PublicAvailabilityCardProps = {
  publiclyAvailable: boolean;
  canPublishExternally: boolean;
  loading: boolean;
  onPress: () => Promise<void>;
};

const PublicAvailabilityCard = ({
  publiclyAvailable,
  canPublishExternally,
  loading,
  onPress,
}: PublicAvailabilityCardProps) => (
  <View
    style={{
      gap: 16,
      padding: 16,
      backgroundColor: primitives.secondary200,
      borderRadius: borderRadius.medium,
    }}
  >
    <View style={{ gap: 4 }}>
      <Headline size="small">Publisera externt</Headline>
      <Body size="medium" color="secondary">
        Gör annonsen synlig för alla på RebuildR, utanför ert interna lager.
      </Body>
    </View>
    {publiclyAvailable ? (
      <Button
        label="Avpublicera externt"
        type="outlined"
        onPress={onPress}
        loading={loading}
      />
    ) : canPublishExternally ? (
      <Button
        label="Publicera externt på RebuildR"
        onPress={onPress}
        loading={loading}
      />
    ) : (
      <Body size="medium" color="secondary">
        Admin måste lägga till utbetalningskonto. Kontakta din admin.
      </Body>
    )}
  </View>
);

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
          canMarkSold;

        return (
          <View key={reservation.id} style={{ gap: 8 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <View style={{ gap: 2 }}>
                <Body size="medium">
                  {reservation.reservedByOrganizationMemberName ?? "Okänd"}
                  {reservation.quantity
                    ? ` · ${reservation.quantity}${unit ? ` ${reservation.quantity === 1 ? quantities[unit].singular : quantities[unit].plural}` : ""}`
                    : ""}
                </Body>
                {!!reservation.reservedByOrganizationMemberEmail && (
                  <Pressable
                    accessibilityRole="link"
                    onPress={() =>
                      Linking.openURL(
                        `mailto:${reservation.reservedByOrganizationMemberEmail}`,
                      )
                    }
                  >
                    <Body size="small" isLink>
                      {reservation.reservedByOrganizationMemberEmail}
                    </Body>
                  </Pressable>
                )}
              </View>
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

const ContactDetail = ({
  label,
  name,
  email,
}: {
  label: string;
  name: string;
  email?: string;
}) => (
  <View style={{ gap: 4 }}>
    <Label size="medium">{label}</Label>
    <Body size="medium">{name}</Body>
    {!!email && (
      <Pressable
        accessibilityRole="link"
        onPress={() => Linking.openURL(`mailto:${email}`)}
      >
        <Body size="medium" isLink>
          {email}
        </Body>
      </Pressable>
    )}
  </View>
);
