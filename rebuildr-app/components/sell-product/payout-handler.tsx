import { UserType } from "@/gql/graphql";
import { gql, useQuery } from "@apollo/client";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { PayoutMethodBankgiro } from "@components/payout/payout-methods/bankgiro";
import { PayoutMethodPlusgiro } from "@components/payout/payout-methods/plusgiro";
import { PayoutMethodRix } from "@components/payout/payout-methods/rix";
import { PayoutMethodSwish } from "@components/payout/payout-methods/swish";
import { PayoutMethodTrustly } from "@components/payout/payout-methods/trustly";
import { PayoutVerify } from "@components/payout/payout-verify";
import { SelectPayoutMethod } from "@components/payout/select-payout-method";
import {
  PayoutMethodType,
  PayoutMethodOrganizationType,
} from "@constants/payouts";
import { usePathname } from "expo-router";
import { useEffect, useState } from "react";

const PAYOUT_HANDLER = gql`
  query PayoutHandler {
    me {
      id
      type
    }
  }
`;

type Props = {
  onFinish: () => void;
};

export const PayoutHandler = ({ onFinish }: Props) => {
  const pathname = usePathname();

  const [step, setStep] = useState<
    | "index"
    | "payout-method"
    | "swish"
    | "trustly"
    | "rix"
    | "bankgiro"
    | "plusgiro"
  >("index");

  const { data } = useQuery(PAYOUT_HANDLER);

  useEffect(() => {
    if (!data) {
      return;
    }

    //Make sure to skip route "index" in case user is Business
    if (data.me.type === UserType.Business) {
      setStep("payout-method");
    }
  }, [pathname, data]);

  const onSelectMethod = (
    method: PayoutMethodType | PayoutMethodOrganizationType,
  ) => {
    switch (method) {
      case "Swish":
        setStep("swish");
        break;
      case "Trustly":
        setStep("trustly");
        break;
      case "Bankkonto":
        setStep("rix");
        break;
      case "Bankgiro":
        setStep("bankgiro");
        break;
      case "Plusgiro":
        setStep("plusgiro");
        break;
    }
  };

  if (!data) {
    return <LoadingSpinner />;
  }

  switch (step) {
    case "index":
      return (
        <PayoutVerify
          title="Börja med att koppla ett utbetalningskonto"
          body="Du har inget utbetalningskonto kopplat. För att få betalt, verifiera dig med BankID och välj sedan Swish eller bankkonto via Trustly."
          showQRTitle="Verifiera dig med BankID"
          showQRBody="Du verkar inte ha kopplat något utbetalningskonto ännu. För att få betalt behöver du först verifiera dig med BankID."
          onVerifyComplete={() => setStep("payout-method")}
        />
      );
    case "payout-method":
      return <SelectPayoutMethod onSelectMethod={onSelectMethod} />;
    case "swish":
      return <PayoutMethodSwish onCompleted={onFinish} />;
    case "trustly":
      return (
        <PayoutMethodTrustly
          onCompleted={onFinish}
          onFailure={() => {
            console.timeLog("Failure setting up Trustly");
            setStep("payout-method");
          }}
        />
      );
    case "rix":
      return <PayoutMethodRix onCompleted={onFinish} />;
    case "bankgiro":
      return <PayoutMethodBankgiro onCompleted={onFinish} />;
    case "plusgiro":
      return <PayoutMethodPlusgiro onCompleted={onFinish} />;
  }

  return null;
};
