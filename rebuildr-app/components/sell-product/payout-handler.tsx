import { BottomSheet } from "@components/bottom-sheet/bottom-sheet";
import PayoutStripe from "@components/payout/payout-stripe";
import { useScreenType } from "@hooks/useScreenType";
import { useState } from "react";

type Props = {
  onFinish: () => void;
  onAbort: () => void;
};

export const PayoutHandler = ({ onFinish, onAbort }: Props) => {
  const [open, setOpen] = useState(true);
  const { isDesktop } = useScreenType();

  const Content = () => (
    <PayoutStripe
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
