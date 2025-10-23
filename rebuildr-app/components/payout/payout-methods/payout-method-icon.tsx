import Bankkonto from "@assets/images/bankkonto.png";
import { Image } from "expo-image";

export const PayoutMethodIcon = () => {
  return <Image source={Bankkonto.uri} style={{ width: 60, height: 60 }} />;
};
