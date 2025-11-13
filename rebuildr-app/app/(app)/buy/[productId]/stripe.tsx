import {
  PollStripeQuery,
  PollStripeQueryVariables,
  PurchaseStatusEnum,
} from "@/gql/graphql";
import { gql, useQuery } from "@apollo/client";
import { Header } from "@components/navigation/headers/header";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { Title } from "@components/typography/text";
import { useBuyModalContext } from "@context/buy-modal-context";
import { useScreenType } from "@hooks/useScreenType";
import { router, useLocalSearchParams } from "expo-router";

const POLL_STRIPE = gql`
  query PollStripe($input: GetPurchaseInput!) {
    purchase(input: $input) {
      id
      status
    }
  }
`;

export default function Stripe() {
  const { purchaseId, productId } = useLocalSearchParams<{
    purchaseId: string;
    productId: string;
  }>();
  return <StripeContent purchaseId={purchaseId} productId={productId} />;
}

export const StripeContent = ({
  purchaseId,
  productId,
}: {
  purchaseId: string;
  productId: string;
}) => {
  const { isDesktop } = useScreenType();
  const { setVisible, setContent } = useBuyModalContext();
  const handleClose = () => {
    setVisible(false);
    setTimeout(() => {
      setContent(null);
    }, 500);
  };

  useQuery<PollStripeQuery, PollStripeQueryVariables>(POLL_STRIPE, {
    variables: { input: { id: purchaseId } },
    pollInterval: 1000,
    notifyOnNetworkStatusChange: true,
    onCompleted: (data) => {
      if (data.purchase.status === PurchaseStatusEnum.PaymentAccepted) {
        if (isDesktop) {
          setContent({
            buyState: "success",
            productId,
            purchaseId,
          });
          setVisible(true);
        } else {
          router.replace({
            pathname: "/buy/[productId]/success",
            params: { productId, purchaseId },
          });
        }
      }
    },
  });

  return (
    <ScreenLayout
      contentHorizontalPadding={isDesktop ? 0 : undefined}
      headerComponent={
        <Header
          title="Bekräfta köp"
          onBack={isDesktop ? handleClose : undefined}
        />
      }
    >
      <Title>Bearbetar betalning...</Title>
    </ScreenLayout>
  );
};
