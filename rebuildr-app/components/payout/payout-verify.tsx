import { usePathname } from "expo-router";
import { View } from "react-native";
import Trustly from "@assets/images/trustly.png";
import Swish from "@assets/images/swish.png";
import { Image } from "expo-image";
import { Body, Display, Headline } from "@components/typography/text";
import { Button } from "@components/buttons/button";
import { gql, useMutation } from "@apollo/client";
import { useThemeColor } from "@hooks/useThemeColor";
import { useEffect, useState } from "react";
import * as Crypto from "expo-crypto";
import {
  VerifyAuthenticateRockerMutation,
  VerifyAuthenticateRockerMutationVariables,
  AuthResponseStatusEnum,
} from "@/gql/graphql";
import * as Linking from "expo-linking";
import QRCode from "react-native-qrcode-svg";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { Divider } from "@components/dividers/divider";
import { Check } from "@components/controls/check";
import { primitives } from "@constants/colors";

const VERIFY_AUTHENTICATE_ROCKER_MUTATION = gql`
  mutation VerifyAuthenticateRocker($input: AuthenticateRockerInput!) {
    authenticateRocker(input: $input) {
      status
      qrCode
      autoStartToken
    }
  }
`;

type Props = {
  onVerifyComplete: () => void;
  title: string;
  body: string;
  showQRTitle: string;
  showQRBody: string;
};

export const PayoutVerify = ({
  onVerifyComplete,
  title,
  body,
  showQRTitle,
  showQRBody,
}: Props) => {
  const [showQr, setShowQr] = useState(false);
  const pathToHere = usePathname();
  const colors = useThemeColor();
  const [
    authenticateRocker,
    {
      loading: authenticateLoading,
      data: authenticateData,
      error: authenticateError,
    },
  ] = useMutation<
    VerifyAuthenticateRockerMutation,
    VerifyAuthenticateRockerMutationVariables
  >(VERIFY_AUTHENTICATE_ROCKER_MUTATION);

  let timer: NodeJS.Timeout | undefined = undefined;

  useEffect(() => {
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, []);

  const onOpenBankId = () => {
    if (authenticateLoading) {
      return;
    }
    const requestId = Crypto.randomUUID();
    authenticateRocker({
      variables: {
        input: {
          requestId,
        },
      },
      onCompleted: (data) => {
        timer = setInterval(async () => {
          const done = () => clearInterval(timer);

          const { data: authenticationRes, errors } = await authenticateRocker({
            variables: {
              input: {
                requestId,
              },
            },
            onError: () => {
              done();
            },
          });

          if (
            authenticationRes?.authenticateRocker.status ===
            AuthResponseStatusEnum.Success
          ) {
            done();
            onVerifyComplete();
          }
          if (
            authenticationRes?.authenticateRocker.status ===
              AuthResponseStatusEnum.Error ||
            errors
          ) {
            done();
          }
        }, 1000);
        Linking.openURL(
          `bankid:///?autostarttoken=${data.authenticateRocker.autoStartToken}&redirect=rebuildr://${pathToHere}`,
        );
      },
      onError: () => {
        clearInterval(timer);
      },
    });
  };

  return (
    <View style={{ justifyContent: "space-between", flex: 1 }}>
      <View style={{ gap: 24 }}>
        <View
          style={{
            paddingVertical: 24,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {showQr ? (
            <BankId
              borderColor={colors.background.primary}
              color={primitives.accent700}
              onAuthenticationSuccess={() => {
                setShowQr(false);
                onVerifyComplete();
              }}
            />
          ) : (
            <View style={{ flexDirection: "row", paddingVertical: 24 }}>
              <Image source={Trustly.uri} style={{ width: 111, height: 111 }} />
              <Image
                source={Swish.uri}
                style={{ marginLeft: -30, width: 111, height: 111 }}
              />
            </View>
          )}
        </View>
        <Display size="small" style={{ textAlign: "center" }}>
          {showQr ? showQRTitle : title}
        </Display>
        <Body size="medium" style={{ textAlign: "center" }}>
          {showQr ? showQRBody : body}
        </Body>
        {showQr && <Divider />}
        {showQr && (
          <View style={{ gap: 16 }}>
            <Headline size="small">Såhär gör du:</Headline>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <Check
                checkColor="primaryDark"
                selected
                color={primitives.primary200}
              />
              <Body size="medium">Starta BankID-appen i din mobil</Body>
            </View>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <Check
                selected
                color={primitives.primary200}
                checkColor="primaryDark"
              />
              <Body size="medium">Tryck på Scanna QR-kod</Body>
            </View>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <Check
                checkColor="primaryDark"
                selected
                color={primitives.primary200}
              />
              <Body size="medium">Rikta kameran mot QR-koden </Body>
            </View>
          </View>
        )}
        {authenticateError && <Body color="error">Något gick fel</Body>}
      </View>
      {showQr ? (
        <Button
          label="Avbryt"
          onPress={() => setShowQr(false)}
          style={{ marginTop: 82 }}
        />
      ) : (
        <View style={{ gap: 8, paddingTop: 24 }}>
          <Button
            label="Verifiera med BankID"
            onPress={() => onOpenBankId()}
            loading={
              authenticateLoading ||
              authenticateData?.authenticateRocker?.status ===
                AuthResponseStatusEnum.Pending
            }
          />
          <Button
            label="BankID på annan enhet"
            type="tonal"
            onPress={() => setShowQr(true)}
          />
        </View>
      )}
    </View>
  );
};

interface BankIdProps {
  onAuthenticationSuccess: () => void;
  color: string;
  borderColor: string;
}

export const BankId = ({
  onAuthenticationSuccess,
  color,
  borderColor,
}: BankIdProps) => {
  const [qrCode, setQrCode] = useState("");
  const [authenticateRocker, { error }] = useMutation<
    VerifyAuthenticateRockerMutation,
    VerifyAuthenticateRockerMutationVariables
  >(VERIFY_AUTHENTICATE_ROCKER_MUTATION);

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
      {error && <Body color="error">Något gick fel</Body>}
    </>
  );
};
