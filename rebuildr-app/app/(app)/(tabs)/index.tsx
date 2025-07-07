import {
  AuthenticateRockerMutation,
  AuthenticateRockerMutationVariables,
  AuthResponseStatusEnum,
} from "@/gql/graphql";
import { gql, useMutation } from "@apollo/client";
import { Button } from "@components/buttons/button";
import { Body } from "@components/typography/text";
import { useEffect, useState } from "react";
import { View } from "react-native";
import * as Crypto from "expo-crypto";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import QRCode from "react-native-qrcode-svg";
import { useThemeColor } from "@hooks/useThemeColor";
import TopBar from "@components/navigation/top-bar";

const AUTHENTICATE_ROCKER_MUTATION = gql`
  mutation AuthenticateRocker($input: AuthenticateRockerInput!) {
    authenticateRocker(input: $input) {
      status
      qrCode
      autoStartToken
    }
  }
`;

export default function Landing() {
  const [showQr, setShowQr] = useState(false);
  const colors = useThemeColor();

  let timer: NodeJS.Timeout | undefined = undefined;

  useEffect(() => {
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, []);

  return (
    <View
      style={{
        alignItems: "center",
        gap: 16,
        backgroundColor: colors.background.neutral,
        flex: 1,
      }}
    >
      <TopBar />

      {showQr && (
        <BankId
          borderColor={colors.background.primary}
          color={colors.text.primaryDark}
          onAuthenticationSuccess={() => {
            setShowQr(false);
          }}
        />
      )}
      {showQr && (
        <>
          <Body style={{ textAlign: "center" }}>Verifiera dig med BankID</Body>

          <View
            style={{
              borderTopWidth: 1,
              paddingTop: 24,
            }}
          >
            <Body size="large" style={{ marginBottom: 8 }}>
              Såhär gör du:
            </Body>
            <View style={{ marginBottom: 24, gap: 2 }}>
              <Body size="medium">1. Starta BankId-appen i din mobil</Body>
              <Body size="medium">2. Tryck på Scanna QR-kod</Body>
              <Body size="medium">
                3. Rikta kameran mot QR-koden här nedanför
              </Body>
            </View>
          </View>
          <Button label="Avbryt" onPress={() => setShowQr(false)} />
        </>
      )}
      <Button label="BankID på annan enhet" onPress={() => setShowQr(true)} />
    </View>
  );
}

interface Props {
  onAuthenticationSuccess: () => void;
  color: string;
  borderColor: string;
}

export const BankId = ({
  onAuthenticationSuccess,
  color,
  borderColor,
}: Props) => {
  const [qrCode, setQrCode] = useState("");
  const [authenticateRocker] = useMutation<
    AuthenticateRockerMutation,
    AuthenticateRockerMutationVariables
  >(AUTHENTICATE_ROCKER_MUTATION);

  useEffect(() => {
    const requestId = Crypto.randomUUID();
    const timer = setInterval(() => {
      const done = () => clearInterval(timer);

      authenticateRocker({
        variables: {
          input: {
            requestId,
          },
        },
        onCompleted: (data) => {
          if (
            data.authenticateRocker.status === AuthResponseStatusEnum.Success
          ) {
            onAuthenticationSuccess();
            done();
            return;
          }

          if (
            data.authenticateRocker.status === AuthResponseStatusEnum.Error ||
            !data.authenticateRocker.qrCode
          ) {
            done();
            return;
          }

          setQrCode(data.authenticateRocker.qrCode);
        },
        onError: () => {
          done();
        },
      });
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [authenticateRocker, onAuthenticationSuccess]);

  return (
    <>
      {qrCode ? (
        <View
          style={{
            borderRadius: 16,
            borderColor,
            padding: 16,
            borderWidth: 1,
          }}
        >
          <QRCode color={color} value={qrCode} size={200} />
        </View>
      ) : (
        <LoadingSpinner />
      )}
    </>
  );
};
