import {
  AccountPurchasesQuery,
  PurchasesPurchaseReceiptQuery,
  PurchasesPurchaseReceiptQueryVariables,
} from "@/gql/graphql";
import { ScrollView, useWindowDimensions, View } from "react-native";
import { PurchasesList } from "./purchases-list";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import TopBar from "@components/navigation/top-bar/top-bar";
import { useThemeColor } from "@hooks/useThemeColor";
import { useEffect, useRef, useState } from "react";
import { PurchaseReceipt } from "@components/purchase/purchase-receipt";
import { Header } from "@components/navigation/headers/header";
import { getProductBadgeProps } from "@/utils/getProductBadgeProps";
import { gql, useQuery } from "@apollo/client";
import { useLocalSearchParams } from "expo-router";

type Props = {
  myPurchases: AccountPurchasesQuery["myPurchases"];
};

export const PurchasesDesktop = ({ myPurchases }: Props) => {
  const ref = useRef<View>(null);
  const { purchaseId } = useLocalSearchParams<{
    purchaseId: string;
  }>();
  const [selectedPurchaseId, setSelectedPurchaseId] = useState<string | null>(
    null,
  );
  const [rightColumnWidth, setRightColumnWidth] = useState(0);

  const colors = useThemeColor();
  const { height: windowHeight } = useWindowDimensions();

  useEffect(() => {
    if (ref.current) {
      ref.current.measure((x, y, width, height, pageX, pageY) => {
        setRightColumnWidth(width);
      });
    }
  }, [ref]);

  useEffect(() => {
    if (!purchaseId) return;
    setSelectedPurchaseId(purchaseId);
  }, [purchaseId]);

  return (
    <ScreenLayout
      headerComponent={<TopBar theme="light" />}
      style={{ gap: 24 }}
      desktopFooter
    >
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          marginTop: -24,
          marginBottom: -32,
        }}
      >
        <View
          style={{
            flex: 1,
          }}
        >
          <View style={{ paddingRight: 48 }}>
            <Header title="Dina köp" showBackButton={false} />
          </View>
          <ScrollView
            showsHorizontalScrollIndicator={false}
            style={{ height: (windowHeight * 2) / 3 }}
            contentContainerStyle={{
              paddingVertical: 24,
              gap: 16,
              paddingRight: 48,
            }}
          >
            <PurchasesList
              myPurchases={myPurchases}
              onPurchasePress={setSelectedPurchaseId}
              selectedPurchaseId={selectedPurchaseId}
            />
          </ScrollView>
        </View>
        <View
          style={{
            flex: 2,
            borderLeftWidth: 1,
            borderLeftColor: colors.dividers.neutral,
            paddingTop: 8,
            paddingBottom: 48,
            paddingLeft: 48,
            minHeight: windowHeight - 72,
          }}
        >
          <View ref={ref}>
            {!!selectedPurchaseId && (
              <Purchase
                purchaseId={selectedPurchaseId}
                width={rightColumnWidth}
              />
            )}
          </View>
        </View>
      </View>
    </ScreenLayout>
  );
};

type PurchaseProps = {
  purchaseId: string;
  width: number;
};

const PURCHASES_PURCHASE_RECEIPT = gql`
  query PurchasesPurchaseReceipt($input: GetPurchaseInput!) {
    purchase(input: $input) {
      id
      status
      sellerRespondedAt
      transportationMethod
      product {
        id
        status
      }
    }
  }
`;

const Purchase = ({ purchaseId, width }: PurchaseProps) => {
  const { data } = useQuery<
    PurchasesPurchaseReceiptQuery,
    PurchasesPurchaseReceiptQueryVariables
  >(PURCHASES_PURCHASE_RECEIPT, { variables: { input: { id: purchaseId } } });
  return (
    <View style={{ gap: 8 }}>
      <Header
        title="Om köpet"
        showDivider={false}
        showBackButton={false}
        badge={
          data
            ? getProductBadgeProps(
                data.purchase.product.status,
                "buyer",
                data.purchase,
              )
            : undefined
        }
      />
      <PurchaseReceipt
        purchaseId={purchaseId}
        showDesktopCarousel
        carouselDesktopWidth={width}
      />
    </View>
  );
};
