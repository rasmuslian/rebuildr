import { PayoutMethodType } from "@constants/payouts";
import Swish from "@assets/images/swish.png";
import Trustly from "@assets/images/trustly.png";
import Bankkonto from "@assets/images/bankkonto.png";
import Bankgiro from "@assets/images/bankgiro.png";
import Plusgiro from "@assets/images/plusgiro.png";
import { Image } from "expo-image";

type Props = {
  method: PayoutMethodType;
};

export const PayoutMethodIcon = ({ method }: Props) => {
  const getIcon = (method: PayoutMethodType) => {
    switch (method) {
      case "Swish":
        return Swish;
      case "Trustly":
        return Trustly;
      case "Bankkonto":
        return Bankkonto;
      case "Bankgiro":
        return Bankgiro;
      case "Plusgiro":
        return Plusgiro;
      default:
        return null;
    }
  };

  return (
    <Image source={getIcon(method).uri} style={{ width: 60, height: 60 }} />
  );
};
