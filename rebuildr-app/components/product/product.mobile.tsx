import {
  ApproximatePlaceResponse,
  Maybe,
  ProductConditionEnum,
  ProductStatusEnum,
  ProductViewQuery,
  QuantityUnitEnum,
  UserType,
} from "@/gql/graphql";
import { Divider } from "@components/dividers/divider";
import { AllImages } from "@components/preview-product/all-images";
import { ImageCarousel } from "@components/preview-product/image-carousel";
import { MainContent } from "@components/preview-product/main-content";
import { PickupPosition } from "@components/preview-product/pickup-position";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { router, useLocalSearchParams } from "expo-router";
import { ButtonProps } from "@components/buttons/button";
import { AdGrid } from "@components/ad/ad-grid";
import { Header } from "@components/navigation/headers/header";
import { HoriztalListSection } from "@components/sections/horizontal-list-section";
import { useContext, useState } from "react";
import { useLikeProduct } from "@hooks/useLikeProduct";
import { BuyersProtection } from "@components/buyers-protection/buyers-protection";
import { CreateProductLabelModal } from "@components/modals/create-product-label-modal";
import { usePersistedState } from "@hooks/use-persisted-state";
import { useUser } from "@hooks/useUser";

import { ReportProductBottomSheet } from "@components/report/report-product-bottom-sheet";
import { LoginModalContext } from "@context/loginModalContext";
import { SimilarProducts } from "@components/similar-products/similar-products";
import { printProductLabel } from "@/utils/products/print-product-label";
import { ProjectSection } from "@components/preview-product/project-section";
import { UserSection } from "@components/preview-product/user-section";
import { InfoSection } from "@components/preview-product/info-section";
import { ActionSection } from "@components/preview-product/action-section";
import RemoveProduct from "@components/preview-product/remove-product";
import { CO2Savings } from "@components/preview-product/CO2-savings";

type Props = {
  product: ProductViewQuery["product"];
  me:
    | {
        __typename?: "User" | undefined;
        id: string;
        address?: string | null | undefined;
        type: UserType;
      }
    | undefined;
  approximatePlace?: ApproximatePlaceResponse | Maybe<ApproximatePlaceResponse>;
  isMyProduct: boolean;
  otherProducts: {
    __typename?: "Product" | undefined;
    id: string;
    title: string;
    status: ProductStatusEnum;
    likedByMe?: boolean | null;
    primaryQuantity?: number | null;
    primaryUnit?: QuantityUnitEnum | null;
    condition: ProductConditionEnum;
    price: number;
    primaryImage?: {
      __typename?: "File";
      id: string;
      url: string;
    } | null;
  }[];
  buyButtonDisabled: boolean;
};

type StateType = {
  showCreateLabelModal: boolean;
};

const initialState: StateType = {
  showCreateLabelModal: true,
};

export const ProductMobile = ({
  product,
  me,
  approximatePlace,
  isMyProduct,
  otherProducts,
  buyButtonDisabled,
}: Props) => {
  const [state, setState] = usePersistedState("product-state", initialState);
  const [showReportSheet, setShowReportSheet] = useState(false);
  const { onToggleProductHeart } = useLikeProduct();
  const { isLoggedIn } = useUser();
  const [showRemoveProductsSheet, setShowRemoveProductsSheet] = useState(false);
  const [showCreateProductLabel, setShowCreateProductLabel] = useState(false);
  const { productId } = useLocalSearchParams<{ productId: string }>();
  const { setVisible } = useContext(LoginModalContext);

  const ctas: ButtonProps[] = [];

  if (isMyProduct) {
    ctas.push({
      icon: "qrCode",
      label: "Skapa etikett",
      type: "tonal",
      iconPosition: "right",
      onPress: () => {
        if (state.showCreateLabelModal) {
          setShowCreateProductLabel(true);
        } else {
          printProductLabel({ productId });
        }
      },
    });
  }

  if (!isMyProduct && isLoggedIn) {
    ctas.push({
      icon: product.likedByMe ? "heart2Filled" : "heart2",
      onPress: () => {
        onToggleProductHeart({
          productId,
          likedByMe: !!product.likedByMe,
        });
      },
    });
  }

  return (
    <>
      <ScreenLayout
        headerComponent={
          <Header showDivider={false} ctas={ctas} ctaRowMarginRight={0} />
        }
        footerBorder
        footerComponent={
          <ActionSection
            productId={productId}
            status={product.status}
            sellerId={product.seller.id}
            isMyProduct={isMyProduct}
            buyButtonDisabled={buyButtonDisabled}
            onRemovePress={() => {
              setShowRemoveProductsSheet(true);
            }}
          />
        }
        style={{ gap: 24, marginTop: 8 }}
      >
        <ImageCarousel images={product.images} status={product.status} />
        <MainContent
          product={product}
          brand={product.brand}
          documents={product.documents}
          category={product.category}
          parentCategory={product.category?.parent}
          myAddress={me?.address}
          sellerIsMe={me && me.id === product.seller.id}
        />
        <Divider />
        <AllImages images={product.images} />
        {approximatePlace &&
          product.pickupEnabled &&
          product.status !== ProductStatusEnum.Sold && (
            <>
              <Divider />
              <PickupPosition
                address={approximatePlace.address}
                location={{
                  lat: approximatePlace.lat,
                  lng: approximatePlace.lng,
                }}
                distanceFromLocation={product.distanceFromLocation}
              />
            </>
          )}
        <Divider />
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
        <BuyersProtection />
        <UserSection product={product} />
        <Divider />
        {product.project && (
          <>
            <ProjectSection project={product.project} myId={me?.id} />
            <Divider />
          </>
        )}
        {!!otherProducts.length && (
          <HoriztalListSection
            title="Mer från samma säljare"
            data={otherProducts}
            onPress={() => {
              router.navigate({
                pathname: "/account/profile",
                params: { userId: product.seller.id },
              });
            }}
            renderItem={({ item }) => (
              <AdGrid
                id={item.id}
                imageUri={item.primaryImage?.url}
                liked={!!item.likedByMe}
                heart
                quantity={item.primaryQuantity}
                quantityUnit={item.primaryUnit}
                condition={item.condition}
                title={item.title}
                price={item.price}
                status={item.status}
                onHeartPress={() => {
                  onToggleProductHeart({
                    productId: item.id,
                    likedByMe: !!item.likedByMe,
                  });
                }}
              />
            )}
            visibleItems={3}
          />
        )}
        <SimilarProducts productId={productId} />
      </ScreenLayout>
      <RemoveProduct
        show={showRemoveProductsSheet}
        onDismiss={() => setShowRemoveProductsSheet(false)}
        canDelete={product.canDelete}
        productId={productId}
      />
      {!isMyProduct && (
        <ReportProductBottomSheet
          productId={productId}
          show={showReportSheet}
          onDismiss={() => setShowReportSheet(false)}
        />
      )}

      <CreateProductLabelModal
        show={showCreateProductLabel}
        onDismiss={() => setShowCreateProductLabel(false)}
        onPressDontShowMore={() => {
          setShowCreateProductLabel(false);
          setState({ showCreateLabelModal: false });
        }}
        onPressPrintProductLabel={() => printProductLabel({ productId })}
      />
    </>
  );
};
