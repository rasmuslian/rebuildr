import { Button } from "@components/buttons/button";
import { Body, Title } from "@components/typography/text";
import { useBuyModalContext } from "@context/buy-modal-context";
import { useScreenType } from "@hooks/useScreenType";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { createURL } from "expo-linking";
import { useState } from "react";
import { View } from "react-native";
import * as Sentry from "@sentry/react-native";

type StripCheckoutFormProps = {
  productId: string;
  purchaseId: string;
  clientSecret: string;
};

export const StripCheckoutForm = ({
  productId,
  purchaseId,
  clientSecret,
}: StripCheckoutFormProps) => {
  if (!process.env.EXPO_PUBLIC_STRIPE_PK) {
    console.error("Publishable key not set!");
    return null;
  }

  const stripePromise = loadStripe(process.env.EXPO_PUBLIC_STRIPE_PK);
  return (
    <>
      <View style={{ gap: 24 }}>
        <Title>Bearbetar köp...</Title>
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <CheckoutForm productId={productId} purchaseId={purchaseId} />
        </Elements>
      </View>
    </>
  );
};

type CheckoutFormProps = {
  productId: string;
  purchaseId: string;
};
const CheckoutForm = ({ productId, purchaseId }: CheckoutFormProps) => {
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const stripe = useStripe();
  const elements = useElements();
  const redirectPath = createURL(`/buy/${productId}/stripe`, {
    queryParams: { purchaseId },
  });
  const { isDesktop } = useScreenType();
  const { setContent } = useBuyModalContext();

  const handleSubmit = async (event: any) => {
    // We don't want to let default form submission happen here,
    // which would refresh the page.
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    const result = await (isDesktop
      ? //We don't want redirect on desktop since the purchase is happening in a slideInSheet
        stripe.confirmPayment({
          elements, //`Elements` instance that was used to create the Payment Element
          redirect: "if_required",
        })
      : stripe.confirmPayment({
          elements,
          confirmParams: {
            return_url: redirectPath,
          },
        }));

    if (result.error) {
      // Show error to your customer (for example, payment details incomplete)
      if (result.error.type === "card_error") {
        setErrorMessage(result.error.message);
      } else {
        setErrorMessage("Något gick fel");
      }
      Sentry.captureException(result.error.message, {
        data: { productId, purchaseId },
      });
    } else {
      if (isDesktop) {
        setContent({
          buyState: "stripe",
          productId,
          purchaseId,
        });
      }
      // Your customer will be redirected to your `return_url`. For some payment
      // methods like iDEAL, your customer will be redirected to an intermediate
      // site first to authorize the payment, then redirected to the `return_url`.
    }
  };

  return (
    <form>
      <PaymentElement
        options={{ layout: "accordion" }}
        onFocus={() => setErrorMessage(undefined)}
      />
      <Button
        label="Genomför köp"
        style={{ marginTop: 24 }}
        onPress={(e) => handleSubmit(e)}
      />
      {errorMessage && (
        <Body color="error" style={{ marginTop: 12 }}>
          {errorMessage}
        </Body>
      )}
    </form>
  );
};
