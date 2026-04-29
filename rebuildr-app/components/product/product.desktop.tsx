import {
  ApproximatePlaceResponse,
  MapPinTypeEnum,
  Maybe,
  Product,
  ProductConditionEnum,
  ProductStatusEnum,
  ProductViewQuery,
  QuantityUnitEnum,
  UserType,
} from "@/gql/graphql";
import { printProductLabel } from "@/utils/products/print-product-label";
import { AdRowSectionDesktop } from "@components/ad-row-section/ad-row-section.desktop";
import { Button, ButtonProps } from "@components/buttons/button";
import { BuyersProtection } from "@components/buyers-protection/buyers-protection";
import { Divider } from "@components/dividers/divider";
import { CreateProductLabelModal } from "@components/modals/create-product-label-modal";
import TopBar from "@components/navigation/top-bar/top-bar";
import { Popup } from "@components/popup/popup";
import { ActionSection } from "@components/preview-product/action-section";
import { PurchaseQuantitySection } from "@components/preview-product/purchase-quantity-section";
import { AllImages } from "@components/preview-product/all-images";
import { AllImagesPopupContent } from "@components/preview-product/all-images-popup-content";
import { CO2Savings } from "@components/preview-product/CO2-savings";
import { ImageGallery } from "@components/preview-product/image-gallery";
import { InfoSection } from "@components/preview-product/info-section";
import { MainContent } from "@components/preview-product/main-content";
import { PickupPosition } from "@components/preview-product/pickup-position";
import { PickupPositionPopupContent } from "@components/preview-product/pickup-position-popup-content";
import { ProjectSection } from "@components/preview-product/project-section";
import RemoveProduct from "@components/preview-product/remove-product";
import { UserSection } from "@components/preview-product/user-section";
import { ReportProduct } from "@components/report/report-product";
import {
  SCREEN_TOP_MARGIN,
  ScreenLayout,
} from "@components/screen-layout/screen-layout";
import { SimilarProducts } from "@components/similar-products/similar-products";
import { LoginModalContext } from "@context/loginModalContext";
import { usePersistedState } from "@hooks/use-persisted-state";
import { useLikeProduct } from "@hooks/useLikeProduct";
import { useUser } from "@hooks/useUser";
import { router } from "expo-router";
import { useContext, useState } from "react";
import { useWindowDimensions, View } from "react-native";

type Props = {
  product: ProductViewQuery["product"];
  me:
    | {
        id: string;
        address?: string | null | undefined;
        type: UserType;
      }
    | undefined;
  approximatePlace?: ApproximatePlaceResponse | Maybe<ApproximatePlaceResponse>;
  isMyProduct: boolean;
  buyButtonDisabled: boolean;
  otherProducts: {
    id: string;
    title: string;
    status: ProductStatusEnum;
    likedByMe?: boolean | null;
    primaryQuantity?: number | null;
    primaryUnit?: QuantityUnitEnum | null;
    condition: ProductConditionEnum;
    price: number;
    soldByQuantity: Product["soldByQuantity"];
    primaryImage?: {
      id: string;
      url: string;
    } | null;
    seller: {
      id: string;
    };
  }[];
};

type StateType = {
  showCreateLabelModal: boolean;
};

const initialState: StateType = {
  showCreateLabelModal: true,
};

export const ProductDesktop = ({
  product,
  me,
  approximatePlace,
  isMyProduct,
  buyButtonDisabled,
  otherProducts,
}: Props) => {
  const [state, setState] = usePersistedState("product-state", initialState);
  const { height: screenHeight } = useWindowDimensions();
  const { onToggleProductHeart } = useLikeProduct();
  const { setVisible } = useContext(LoginModalContext);
  const { isLoggedIn } = useUser();
  const [showReportSheet, setShowReportSheet] = useState(false);
  const [showRemoveProductsSheet, setShowRemoveProductsSheet] = useState(false);
  const [selectedQuantity, setSelectedQuantity] = useState<number | undefined>(
    product.soldByQuantity ? 1 : undefined,
  );
  const [showCreateProductLabel, setShowCreateProductLabel] = useState(false);
  const [rightColumnWidth, setRightColumnWidth] = useState<number>(0);
  const imageGalleryHeight = screenHeight - 72 - 48;
  const [showImagePopup, setShowImagePopup] = useState(false);
  const [showMapPopup, setShowMapPopup] = useState(false);

  const pickupEnabled =
    approximatePlace &&
    product.pickupEnabled &&
    product.status !== ProductStatusEnum.Sold;
  const location = pickupEnabled
    ? {
        lat: approximatePlace!.lat,
        lng: approximatePlace!.lng,
      }
    : null;

  const showAllImagesPopup = () => {
    setShowImagePopup(true);
  };

  const handleShowMapPopup = () => {
    if (!location || !approximatePlace) return;
    setShowMapPopup(true);
  };

  const ctas: ButtonProps[] = [];

  if (isMyProduct) {
    ctas.push({
      icon: "qrCode",
      label: "Skapa etikett",
      iconPosition: "right",
      onPress: () => {
        if (state.showCreateLabelModal) {
          setShowCreateProductLabel(true);
        } else {
          printProductLabel({ productId: product.id });
        }
      },
    });
  }

  if (!isMyProduct && isLoggedIn) {
    ctas.push({
      label: product.likedByMe ? "Favoritmarkerad" : "Favoritmarkera",
      icon: product.likedByMe ? "heartFilled" : "heart",
      iconPosition: "right",
      onPress: () => {
        onToggleProductHeart({
          productId: product.id,
          likedByMe: !!product.likedByMe,
        });
      },
    });
  }

  return (
    <>
      <ScreenLayout desktopFooter headerComponent={<TopBar theme="light" />}>
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
                displaySoldOverlay
              />
              <View
                style={{
                  position: "absolute",
                  top: 24,
                  left: 24,
                  flexDirection: "row",
                  gap: 8,
                }}
              >
                <Button
                  label="Visa alla bilder"
                  type="filled"
                  theme="dark"
                  showShadow
                  onPress={showAllImagesPopup}
                />
                {pickupEnabled && location && (
                  <Button
                    label="Visa på karta"
                    type="filled"
                    theme="dark"
                    showShadow
                    onPress={() => {
                      handleShowMapPopup();
                    }}
                  />
                )}
              </View>
            </View>
            <View
              style={{ flex: 1, gap: 24 }}
              onLayout={(e) => {
                const w = e.nativeEvent.layout.width;
                setRightColumnWidth(w);
              }}
            >
              <MainContent
                product={product}
                brand={product.brand}
                documents={product.documents}
                category={product.category}
                parentCategory={product.category?.parent}
                myAddress={me?.address}
                sellerIsMe={me && me.id === product.seller.id}
                actionSection={
                  <>
                    {product.soldByQuantity &&
                      !!product.primaryQuantity &&
                      selectedQuantity &&
                      !isMyProduct &&
                      product.primaryUnit && (
                        <PurchaseQuantitySection
                          pricePerUnit={product.price}
                          selectedQuantity={selectedQuantity}
                          totalQuantity={product.primaryQuantity}
                          primaryUnit={product.primaryUnit}
                          onQuantityChange={setSelectedQuantity}
                        />
                      )}
                    <ActionSection
                      productId={product.id}
                      quantity={selectedQuantity}
                      status={product.status}
                      isMyProduct={isMyProduct}
                      buyButtonDisabled={buyButtonDisabled}
                      onRemovePress={() => {
                        setShowRemoveProductsSheet(true);
                      }}
                    />
                    {ctas.length > 0 && <Divider />}
                    <View
                      style={{
                        flex: 1,
                        gap: 8,
                      }}
                    >
                      {ctas.map((cta, index) => (
                        <Button key={index} type="outlined" {...cta} />
                      ))}
                    </View>
                  </>
                }
              />
              <BuyersProtection />
              <AllImages
                images={product.images}
                imagesPerRow={3}
                parentWidth={rightColumnWidth}
                onAllImagesPress={showAllImagesPopup}
              />
              <Divider />
              {pickupEnabled && location && (
                <>
                  <PickupPosition
                    address={approximatePlace.address}
                    location={location}
                    distanceFromLocation={product.distanceFromLocation}
                  />
                  <Divider />
                </>
              )}
              <CO2Savings co2Saving={product.co2Saving} />
              <Divider />
              <InfoSection
                createdAt={product.createdAt}
                updatedAt={product.updatedAt}
                isMyProduct={isMyProduct}
                onReportPress={() => {
                  if (!isLoggedIn) {
                    setVisible(true);
                  } else {
                    setShowReportSheet(true);
                  }
                }}
              />
              <Divider />
              <UserSection product={product} />
              {product.project && (
                <>
                  <Divider />
                  <ProjectSection project={product.project} myId={me?.id} />
                </>
              )}
            </View>
          </View>
          {!!otherProducts.length && (
            <>
              <Divider />
              <AdRowSectionDesktop
                products={otherProducts.slice(0, 4)}
                me={me}
                title="Mer från samma säljaren"
                onPress={() => {
                  router.navigate({
                    pathname: "/account/profile",
                    params: { userId: product.seller.id },
                  });
                }}
                onToggleProductHeart={onToggleProductHeart}
              />
              <Divider />
            </>
          )}
          <SimilarProducts productId={product.id} />
        </View>
      </ScreenLayout>
      {!isMyProduct && (
        <ReportProduct
          productId={product.id}
          show={showReportSheet}
          onDismiss={() => setShowReportSheet(false)}
        />
      )}
      <RemoveProduct
        show={showRemoveProductsSheet}
        onDismiss={() => setShowRemoveProductsSheet(false)}
        canDelete={product.canDelete}
        productId={product.id}
      />
      <CreateProductLabelModal
        show={showCreateProductLabel}
        onDismiss={() => setShowCreateProductLabel(false)}
        onPressDontShowMore={() => {
          setShowCreateProductLabel(false);
          setState({ showCreateLabelModal: false });
        }}
        onPressPrintProductLabel={() =>
          printProductLabel({ productId: product.id })
        }
      />
      <Popup
        open={showImagePopup}
        onClose={() => setShowImagePopup(false)}
        type="full"
      >
        <AllImagesPopupContent images={product.images} />
      </Popup>
      <Popup
        open={showMapPopup}
        onClose={() => setShowMapPopup(false)}
        type="full"
      >
        {location && approximatePlace && (
          <PickupPositionPopupContent
            address={approximatePlace.address}
            location={location}
            markerType={MapPinTypeEnum.Product}
          />
        )}
      </Popup>
    </>
  );
};
