import {
  AuthResponseStatusEnum,
  VerifyAuthenticateRockerMutationVariables,
  VerifyBottomSheetMutation,
} from "@/gql/graphql";
import { gql, useMutation } from "@apollo/client";
import { BottomSheet } from "@components/bottom-sheet/bottom-sheet";
import { Button } from "@components/buttons/button";
import { Divider } from "@components/dividers/divider";
import { Display, Body } from "@components/typography/text";
import { primitives } from "@constants/colors";
import { useThemeColor } from "@hooks/useThemeColor";
import { ReactElement, useEffect, useState } from "react";
import { Linking, View } from "react-native";
import { BankId } from "./bank-id";
import * as Crypto from "expo-crypto";
import { usePathname } from "expo-router";
import { InstructionSteps } from "@components/instruction-steps/instruction-steps";

const VERIFY_BOTTOM_SHEET = gql`
  mutation VerifyBottomSheet($input: AuthenticateRockerInput!) {
    authenticateRocker(input: $input) {
      status
      qrCode
      autoStartToken
    }
  }
`;

type Props = {
  title: string;
  text: ReactElement | string;
  qrTitle: string;
  qrText?: ReactElement | string;
  show: boolean;
  onDismiss?: () => void;
  onVerifyComplete: () => void;
};
export const VerifyBottomSheet = ({
  title,
  text,
  qrTitle,
  qrText,
  show,
  onDismiss,
  onVerifyComplete,
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
    VerifyBottomSheetMutation,
    VerifyAuthenticateRockerMutationVariables
  >(VERIFY_BOTTOM_SHEET);

  let timer: NodeJS.Timeout | undefined = undefined;

  useEffect(() => {
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, []);

  useEffect(() => {
    if (!show && timer) {
      clearInterval(timer);
    }
  }, [show]);

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

  const renderInitial = () => {
    return (
      <>
        <View style={{ gap: 24 }}>
          <Display size="small" style={{ textAlign: "center" }}>
            {title}
          </Display>
          {typeof text === "string" ? (
            <Body size="medium" style={{ textAlign: "center" }}>
              {text}
            </Body>
          ) : (
            text
          )}

          {authenticateError && <Body color="error">Något gick fel</Body>}
        </View>

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
      </>
    );
  };

  const renderQr = () => {
    return (
      <>
        <View style={{ gap: 24 }}>
          <View
            style={{
              paddingVertical: 24,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <BankId
              borderColor={colors.textField.clicked}
              color={primitives.accent700}
              onAuthenticationSuccess={() => {
                setShowQr(false);
                onVerifyComplete();
              }}
            />
          </View>
          <Display size="small" style={{ textAlign: "center" }}>
            {qrTitle}
          </Display>
          {typeof qrText === "string" ? (
            <Body size="medium" style={{ textAlign: "center" }}>
              {qrText}
            </Body>
          ) : (
            qrText
          )}
          <Divider />

          <InstructionSteps
            steps={[
              "Starta BankID-appen i din mobil",
              "Tryck på Scanna QR-kod",
              "Rikta kameran mot QR-koden",
            ]}
          />

          {authenticateError && <Body color="error">Något gick fel</Body>}
        </View>

        <Button
          label="Avbryt"
          onPress={() => setShowQr(false)}
          style={{ marginTop: 82 }}
        />
      </>
    );
  };

  return (
    <BottomSheet
      name="Verify"
      title={showQr ? "BankID på annan enhet" : "Verifiera dig med BankID"}
      onDismiss={onDismiss}
      open={show}
    >
      <View style={{ justifyContent: "space-between", flex: 1 }}>
        {showQr ? renderQr() : renderInitial()}
      </View>
    </BottomSheet>
  );
};
