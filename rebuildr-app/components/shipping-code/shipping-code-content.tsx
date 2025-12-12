import { ShippingCodeQuery, ShippingCodeQueryVariables } from "@/gql/graphql";
import { gql, useQuery } from "@apollo/client";
import { Divider } from "@components/dividers/divider";
import { InstructionSteps } from "@components/instruction-steps/instruction-steps";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { Display } from "@components/typography/text";
import { primitives } from "@constants/colors";
import { borderRadius } from "@constants/sizes";
import { useScreenType } from "@hooks/useScreenType";
import { useThemeColor } from "@hooks/useThemeColor";
import { View } from "react-native";
import QRCode from "react-native-qrcode-svg";

const SHIPPING_CODE = gql`
  query ShippingCode($input: GetPurchaseInput!) {
    purchase(input: $input) {
      id
      qrCodeUrl
      qrCodeContent
    }
  }
`;

type Props = {
  purchaseId: string;
};

export const ShippingCodeContent = ({ purchaseId }: Props) => {
  const colors = useThemeColor();
  const { isDesktop } = useScreenType();
  const { data } = useQuery<ShippingCodeQuery, ShippingCodeQueryVariables>(
    SHIPPING_CODE,
    {
      variables: { input: { id: purchaseId } },
    },
  );
  const qrCodeContent = data?.purchase.qrCodeContent;

  return (
    <View style={[{ gap: 24 }, isDesktop && { padding: 72 }]}>
      {data && qrCodeContent ? (
        <View
          style={{
            flex: 1,
            padding: 16,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              borderRadius: borderRadius.medium,
              borderColor: colors.textField.clicked,
              padding: 16,
              borderWidth: 1,
            }}
          >
            <QRCode
              color={primitives.accent700}
              value={qrCodeContent}
              size={165}
            />
          </View>
        </View>
      ) : (
        <LoadingSpinner />
      )}
      <Display size="small" style={{ textAlign: "center" }}>
        Visa QR-koden och skicka paketet
      </Display>

      <Divider />

      <InstructionSteps
        steps={[
          "Visa din QR-kod hos valfritt Postnord-ombud",
          "Ombudet skriver ut fraktsedeln åt dig",
          "Paketet skickas",
        ]}
      />
    </View>
  );
};
