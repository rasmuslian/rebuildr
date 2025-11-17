import { BottomSheet } from "@components/bottom-sheet/bottom-sheet";
import PayoutStripe from "@components/payout/payout-stripe";
import { useState } from "react";

type Props = {
  onFinish: () => void;
  onAbort: () => void;
};

export const PayoutHandler = ({ onFinish, onAbort }: Props) => {
  const [open, setOpen] = useState(true);
  return (
    <BottomSheet
      name="Uppgifter säljare"
      open={open}
      onDismiss={() => {
        onFinish();
      }}
      scrollable
      screenHeight
    >
      <PayoutStripe
        onExit={() => {
          onFinish();
        }}
        onAbort={() => {
          setOpen(false);
          onAbort();
        }}
      />
    </BottomSheet>
  );
};
