import { Button } from "@components/buttons/button";
import { Divider } from "@components/dividers/divider";
import { Body, Display } from "@components/typography/text";
import { ComponentProps } from "react";
import { View } from "react-native";
import { Image } from "expo-image";
import VisaPaymentOption from "@assets/images/visa-payment-option.png";
import MastercardPaymentOption from "@assets/images/mastercard-payment-option.png";
import AmExPaymentOption from "@assets/images/american-express-payment-option.png";

type Props = {
  text: string;
  price: number;
  mainButton: ComponentProps<typeof Button>;
  secondaryButton?: ComponentProps<typeof Button>;
  bottomText: string;
};
export const Summary = ({
  text,
  price,
  mainButton,
  secondaryButton,
  bottomText,
}: Props) => {
  return (
    <View style={{ gap: 16 }}>
      <Divider />
      <View style={{ gap: 16, alignItems: "center", marginTop: 8 }}>
        <Body size="medium">{text}</Body>

        <Display size="medium">{price} kr</Display>
        <View style={{ alignSelf: "stretch" }}>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {secondaryButton && <Button {...secondaryButton} />}
            <Button {...mainButton} style={{ flex: 1 }} />
          </View>
        </View>
      </View>
      {price > 0 && (
        <View
          style={{
            flexDirection: "row",
            gap: 8,
            alignItems: "center",
            alignSelf: "center",
          }}
        >
          {/* 
          //Hide Swish until Stripe supports it
          <Image
            source={SwishPaymentOption.uri}
            style={{ width: 60, height: 18 }}
          /> */}
          <Image
            source={VisaPaymentOption.uri}
            style={{ width: 40, height: 16 }}
          />
          <Image
            source={MastercardPaymentOption.uri}
            style={{ width: 30, height: 18 }}
          />
          <Image
            source={AmExPaymentOption.uri}
            style={{ width: 60, height: 13 }}
          />
        </View>
      )}
      <Body size="medium" style={{ textAlign: "center" }}>
        {bottomText}
      </Body>
    </View>
  );
};
