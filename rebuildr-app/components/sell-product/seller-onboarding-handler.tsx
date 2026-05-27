import { BottomSheet } from "@components/bottom-sheet/bottom-sheet";
import OnboardSellerAccount from "@components/payout/onboard-seller-account";
import { useScreenType } from "@hooks/useScreenType";
import { useState } from "react";

type Props = {
  onFinish: () => void;
  onAbort: () => void;
};

export const SellerOnboardingHandler = ({ onFinish, onAbort }: Props) => {
  const [open, setOpen] = useState(true);
  const { isDesktop } = useScreenType();

  const Content = () => (
    <OnboardSellerAccount
      onExit={() => {
        onFinish();
      }}
      onAbort={() => {
        setOpen(false);
        onAbort();
      }}
    />
  );

  if (isDesktop) {
    return <Content />;
  }

  return (
    <BottomSheet
      name="Uppgifter säljare"
      open={open}
      onDismiss={onFinish}
      scrollable
      screenHeight
    >
      <Content />
    </BottomSheet>
  );
};
