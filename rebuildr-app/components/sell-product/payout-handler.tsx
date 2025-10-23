import PayoutStripe from "@components/payout/payout-stripe";

type Props = {
  onFinish: () => void;
  onAbort: () => void;
};

export const PayoutHandler = ({ onFinish, onAbort }: Props) => {
  return <PayoutStripe onExit={onFinish} onAbort={onAbort} />;
};
