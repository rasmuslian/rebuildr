import { useBuyModalContext } from "@context/buy-modal-context";
import { SlideInSheet } from "@components/slide-in-sheet/slide-in-sheet";
import { SuccessContent } from "@/app/(app)/buy/[productId]/success";
import { PaymentContent } from "@/app/(app)/buy/[productId]/payment";
import { StripeContent } from "@/app/(app)/buy/[productId]/stripe";
import { Buy } from "@/app/(app)/buy/[productId]";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { Header } from "@components/navigation/headers/header";
import { StripCheckoutForm } from "@components/payment/stripe-checkout-form";

export const BuyModal = () => {
  const { visible, setVisible, content, setContent } = useBuyModalContext();
  const {
    buyState,
    productId,
    purchaseId,
    quantity,
    transportation,
    stripeClientSecret,
  } = content || {};

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => {
      setContent(null);
    }, 500);
  };

  let contentChildren = null;
  switch (buyState) {
    case "summary":
      contentChildren = <Buy productId={productId!} quantity={quantity} />;
      break;
    case "success":
      contentChildren = <SuccessContent purchaseId={purchaseId!} />;
      break;
    case "payment":
      contentChildren = (
        <PaymentContent productId={productId!} {...transportation!} />
      );
      break;
    case "stripe":
      contentChildren = (
        <StripeContent productId={productId!} purchaseId={purchaseId!} />
      );
      break;
    case "stripeForm":
      contentChildren = (
        <ScreenLayout
          contentHorizontalPadding={0}
          headerComponent={
            <Header title="Bearbetar köp..." onBack={handleClose} />
          }
        >
          <StripCheckoutForm
            productId={productId!}
            purchaseId={purchaseId!}
            clientSecret={stripeClientSecret!}
          />
        </ScreenLayout>
      );
      break;
    default:
      contentChildren = null;
  }

  return (
    <SlideInSheet open={visible} onClose={handleClose}>
      {contentChildren}
    </SlideInSheet>
  );
};
