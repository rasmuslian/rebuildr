import { gql, useMutation, useQuery } from "@apollo/client";
import { useEffect, useRef, useState } from "react";
import { Linking } from "react-native";
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

export type BankIdVerifyStep = "idle" | "waiting" | "qr" | "failed";

type Props = {
  onResult: () => void;
};

export const useBankIdVerify = ({ onResult }: Props) => {
  const [step, setStep] = useState<BankIdVerifyStep>("idle");
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

  const reset = () => {
    setStep("idle");
    setOrderRef(null);
  };

  return {
    step,
    qrData: collectData?.collectBankIDVerify?.qrData ?? null,
    initiating,
    handleSameDevice,
    handleOtherDevice,
    handleRetry: reset,
    reset,
  };
};
