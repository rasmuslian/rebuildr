import {
  PollStripeQuery,
  PollStripeQueryVariables,
  PurchaseStatusEnum,
} from "@/gql/graphql";
import { gql, useQuery } from "@apollo/client";
import { Header } from "@components/navigation/headers/header";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { Title } from "@components/typography/text";
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
  useQuery<PollStripeQuery, PollStripeQueryVariables>(POLL_STRIPE, {
    variables: { input: { id: purchaseId } },
    pollInterval: 1000,
    notifyOnNetworkStatusChange: true,
    onCompleted: (data) => {
      if (data.purchase.status === PurchaseStatusEnum.PaymentAccepted) {
        router.replace({
          pathname: "/buy/[productId]/success",
          params: { productId, purchaseId },
        });
      }
    },
  });

  return (
    <ScreenLayout headerComponent={<Header title="Bekräfta köp" />}>
      <Title>Bearbetar betalning...</Title>
    </ScreenLayout>
  );
}
