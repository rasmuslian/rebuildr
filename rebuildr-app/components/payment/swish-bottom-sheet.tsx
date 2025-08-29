import {
  PollSwishQuery,
  PollSwishQueryVariables,
  PurchaseStatusEnum,
} from "@/gql/graphql";
import { gql, useQuery } from "@apollo/client";
import { BottomSheet } from "@components/bottom-sheet/bottom-sheet";
import { Divider } from "@components/dividers/divider";
import { Display, Body } from "@components/typography/text";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useThemeColor } from "@hooks/useThemeColor";
import { router } from "expo-router";
import { useRef, useEffect } from "react";
import { View } from "react-native";
import { Image } from "expo-image";
import SwishImage from "@assets/images/swish-no-border.png";
import { Button } from "@components/buttons/button";
import { InstructionSteps } from "@components/instruction-steps/instruction-steps";

const POLL_SWISH = gql`
  query PollSwish($input: GetPurchaseInput!) {
    purchase(input: $input) {
      id
      status
    }
  }
`;

type SwishBottomSheetProps = {
  price: number;
  productId: string;
  purchaseId: string;
  show: boolean;
  onDismiss: () => void;
};

export const SwishBottomSheet = ({
  price,
  productId,
  purchaseId,
  show,
  onDismiss,
}: SwishBottomSheetProps) => {
  const colors = useThemeColor();
  const ref = useRef<BottomSheetModal>(null);
  useQuery<PollSwishQuery, PollSwishQueryVariables>(POLL_SWISH, {
    variables: { input: { id: purchaseId } },
    pollInterval: 1000,
    notifyOnNetworkStatusChange: true,
    onCompleted: (data) => {
      if (data.purchase.status === PurchaseStatusEnum.PaymentAccepted) {
        ref.current?.dismiss();
        onDismiss();
        router.replace({
          pathname: "/buy/[productId]/success",
          params: { productId, purchaseId },
        });
      }
    },
  });

  useEffect(() => {
    if (show) {
      ref.current?.present();
    } else {
      ref.current?.dismiss();
    }
  }, [show]);

  return (
    <BottomSheet name="Swish" title="Bekräfta köp" ref={ref} screenHeight>
      <>
        <View style={{ gap: 24 }}>
          <View
            style={{
              paddingVertical: 24,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Image
              source={SwishImage.uri}
              style={{ width: 187, height: 187 }}
            />
          </View>
          <View>
            <Display size="small" style={{ textAlign: "center" }}>
              Nästan klart!
            </Display>
            <Display size="small" style={{ textAlign: "center" }}>
              Öppna Swish för att betala
            </Display>
          </View>

          <Divider />
          <InstructionSteps
            steps={[
              "Öppna din Swish-app",
              <Body size="medium">
                Dubbelkolla att det står <Body size="medium">{price} kr</Body>{" "}
                och att mottagaren är Rocker
              </Body>,
              "Godkänn betalningen i Swis",
            ]}
          />
        </View>

        <Button
          label="Avbryt"
          onPress={() => onDismiss()}
          style={{ marginTop: 82 }}
        />
      </>
    </BottomSheet>
  );
};
