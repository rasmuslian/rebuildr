import { Purchase } from "@/gql/graphql";
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
import { Button } from "@components/buttons/button";
import { shareUrl } from "@/utils/share-url";

type Props = {
  purchase: Pick<Purchase, "qrCodeUrl" | "qrCodeContent">;
  showUpload?: boolean;
};

export const ShippingCodeContent = ({
  purchase: { qrCodeUrl, qrCodeContent },
  showUpload,
}: Props) => {
  const colors = useThemeColor();
  const { isDesktop } = useScreenType();

  const onPressShare = async () => {
    const url = qrCodeUrl;
    if (!url) return;
    shareUrl(url, {
      dialogTitle: "Dela din QR-kod",
      copiedMessage: "QR-kod kopierad!",
    });
  };

  return (
    <View style={[{ gap: 24 }, isDesktop && { padding: 72 }]}>
      {showUpload && (
        <View style={{ position: "absolute", top: 20, right: 20 }}>
          <Button icon="upload" type="text" onPress={onPressShare} />
        </View>
      )}
      {qrCodeContent ? (
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
