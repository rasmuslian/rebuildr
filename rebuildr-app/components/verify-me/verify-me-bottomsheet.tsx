import { BottomSheet } from "@components/bottom-sheet/bottom-sheet";
import { Button } from "@components/buttons/button";
import { Body, Display, Label } from "@components/typography/text";
import { borderRadius } from "@constants/sizes";
import { useThemeColor } from "@hooks/useThemeColor";
import { gql, useMutation, useQuery } from "@apollo/client";
import { useEffect, useRef, useState } from "react";
import { Linking, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import {
  InitBankIdVerifyMutation,
  CollectBankIdVerifyQuery,
  CollectBankIdVerifyQueryVariables,
  BankIdVerifyStatus,
} from "@/gql/graphql";

const INIT_BANK_ID_VERIFY = gql`
  mutation InitBankIdVerify {
    initBankIDVerify {
      orderRef
      autoStartToken
    }
  }
`;

const COLLECT_BANK_ID_VERIFY = gql`
  query CollectBankIdVerify($orderRef: String!) {
    collectBankIDVerify(orderRef: $orderRef) {
      status
      qrData
    }
  }
`;

type Props = {
  show: boolean;
  onDismiss: () => void;
  onResult: () => void;
};

type Step = "idle" | "waiting" | "qr" | "failed";

export const VerifyMeBottomSheet = ({ show, onDismiss, onResult }: Props) => {
  const colors = useThemeColor();
  const [step, setStep] = useState<Step>("idle");
  const [orderRef, setOrderRef] = useState<string | null>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);

  const [initBankIDVerify, { loading: initiating }] =
    useMutation<InitBankIdVerifyMutation>(INIT_BANK_ID_VERIFY);

  const isPolling = step === "waiting" || step === "qr";
  const { data: collectData } = useQuery<
    CollectBankIdVerifyQuery,
    CollectBankIdVerifyQueryVariables
  >(COLLECT_BANK_ID_VERIFY, {
    variables: { orderRef: orderRef! },
    skip: !orderRef || !isPolling,
    pollInterval: step === "qr" ? 1000 : 2000,
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    const status = collectData?.collectBankIDVerify?.status;
    if (!status) return;

    if (status === BankIdVerifyStatus.Complete) {
      setOrderRef(null);
      setStep("idle");
      onResult();
    } else if (status === BankIdVerifyStatus.Failed) {
      setOrderRef(null);
      setStep("failed");
    }
  }, [collectData?.collectBankIDVerify?.status]);

  useEffect(() => {
    if ((step !== "waiting" && step !== "qr") || typeof window === "undefined")
      return;

    if ("BroadcastChannel" in window) {
      channelRef.current = new BroadcastChannel("bankid");
      channelRef.current.onmessage = (e) => {
        if (e.data?.status === "complete") {
          setOrderRef(null);
          setStep("idle");
          onResult();
        }
      };
    }

    return () => {
      channelRef.current?.close();
      channelRef.current = null;
    };
  }, [step]);

  const handleSameDevice = async () => {
    try {
      const { data } = await initBankIDVerify();
      if (!data?.initBankIDVerify) return;

      const { orderRef: ref, autoStartToken } = data.initBankIDVerify;
      setOrderRef(ref);
      setStep("waiting");

      Linking.openURL(
        `bankid:///?autostarttoken=${autoStartToken}&redirect=null`,
      );
      // const redirectUrl = encodeURIComponent(window.location.href);
      // Linking.openURL(
      //   `bankid:///?autostarttoken=${autoStartToken}&redirect=${redirectUrl}`,
      // );
    } catch {
      setStep("failed");
    }
  };

  const handleOtherDevice = async () => {
    try {
      const { data } = await initBankIDVerify();
      if (!data?.initBankIDVerify) return;
      setOrderRef(data.initBankIDVerify.orderRef);
      setStep("qr");
    } catch {
      setStep("failed");
    }
  };

  const handleRetry = () => {
    setStep("idle");
    setOrderRef(null);
  };

  const handleDismiss = () => {
    setStep("idle");
    setOrderRef(null);
    onDismiss();
  };

  return (
    <BottomSheet
      title="BankID-verifiering"
      open={show}
      name="BankID"
      onDismiss={handleDismiss}
    >
      {step === "idle" && (
        <>
          <Display size="small" style={{ marginBottom: 24 }}>
            Verifiera dig för att slutföra köpet
          </Display>

          <Body size="medium" style={{ marginBottom: 32 }}>
            För att genomföra köp på RebuildR behöver du verifiera dig med
            BankID. Det gör att alla affärer sker mellan verifierade användare.
          </Body>

          <View
            style={{
              backgroundColor: colors.buttons.tonal.enabled,
              borderRadius: borderRadius.medium,
              padding: 16,
              gap: 16,
              marginBottom: 32,
            }}
          >
            <Label size="large">Det här händer när du verifierar dig</Label>
            <View>
              <Body size="small">
                • Säkrare handel mellan verifierade parter
              </Body>
              <Body size="small">• "Verifierad"-badge på din profil</Body>
              <Body size="small">• Personnummer hashas, ej i klartext</Body>
            </View>
          </View>

          <View style={{ gap: 8 }}>
            <Button
              label="Verifiera med BankID"
              loading={initiating}
              onPress={handleSameDevice}
            />
            <Button
              label="BankID på annan enhet"
              type="tonal"
              loading={initiating}
              onPress={handleOtherDevice}
            />
          </View>
        </>
      )}

      {step === "waiting" && (
        <>
          <Display size="small" style={{ marginBottom: 24 }}>
            Väntar på BankID
          </Display>

          <Body size="medium" style={{ marginBottom: 32 }}>
            Öppna BankID-appen på din enhet och följ instruktionerna där.
          </Body>

          <Button label="Avbryt" type="tonal" onPress={handleRetry} />
        </>
      )}

      {step === "qr" && (
        <>
          <Display size="small" style={{ marginBottom: 16 }}>
            BankID på annan enhet
          </Display>

          <Body size="medium" style={{ marginBottom: 24 }}>
            Öppna BankID-appen på din andra enhet, tryck på QR-ikonen och scanna
            koden nedan.
          </Body>

          <View style={{ alignItems: "center", marginBottom: 32 }}>
            {collectData?.collectBankIDVerify?.qrData ? (
              <QRCode
                value={collectData.collectBankIDVerify.qrData}
                size={200}
              />
            ) : (
              <View style={{ width: 200, height: 200 }} />
            )}
          </View>

          <Button label="Avbryt" type="tonal" onPress={handleRetry} />
        </>
      )}

      {step === "failed" && (
        <>
          <Display size="small" style={{ marginBottom: 24 }}>
            Verifieringen misslyckades
          </Display>

          <Body size="medium" style={{ marginBottom: 32 }}>
            Något gick fel. Försök igen eller kontakta support om problemet
            kvarstår.
          </Body>

          <View style={{ gap: 8 }}>
            <Button label="Försök igen" onPress={handleRetry} />
            <Button label="Avbryt" type="tonal" onPress={handleDismiss} />
          </View>
        </>
      )}
    </BottomSheet>
  );
};
