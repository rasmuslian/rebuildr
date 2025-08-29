import { usePathname } from "expo-router";
import { View } from "react-native";
import Trustly from "@assets/images/trustly.png";
import Swish from "@assets/images/swish.png";
import { Image } from "expo-image";
import { Body, Display } from "@components/typography/text";
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
import { Divider } from "@components/dividers/divider";
import { primitives } from "@constants/colors";
import { BankId } from "@components/bank-id/bank-id";
import { InstructionSteps } from "@components/instruction-steps/instruction-steps";

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
              borderColor={colors.textField.clicked}
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
          <InstructionSteps
            steps={[
              "Starta BankID-appen i din mobil",
              "Tryck på Scanna QR-kod",
              "Rikta kameran mot QR-koden",
            ]}
          />
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
