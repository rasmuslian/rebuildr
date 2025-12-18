import { BottomSheet } from "@components/bottom-sheet/bottom-sheet";
import { StripCheckoutForm } from "./stripe-checkout-form";

/**
 * Component was created using following docs: https://docs.stripe.com/sdks/stripejs-react?ui=elements
 */

type Props = {
  productId: string;
  purchaseId: string;
  show: boolean;
  onDismiss: () => void;
  clientSecret: string; //'clientSecret' is retrieved from Server when creating a Purchase
};

export const StripeBottomSheet = ({
  productId,
  purchaseId,
  show,
  onDismiss,
  clientSecret,
}: Props) => {
  if (!process.env.EXPO_PUBLIC_STRIPE_PK) {
    console.error("Publishable key not set!");
    return null;
  }

  return (
    <BottomSheet
      name="Stripe"
      title="Bekräfta köp"
      open={show}
      screenHeight
      onDismiss={onDismiss}
      scrollable
    >
      <StripCheckoutForm
        productId={productId}
        purchaseId={purchaseId}
        clientSecret={clientSecret}
      />
    </BottomSheet>
  );
};
