import {
  SellProductCreateDraftMutation,
  SellProductQueryQuery,
} from "@/gql/graphql";
import { gql, useMutation, useQuery } from "@apollo/client";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { router } from "expo-router";
import {
  EditProductScreen,
  PRODUCT_DETAILS_FRAGMENT,
} from "@components/product/edit-product-screen";
import { useHandleDraft } from "@hooks/sell-product/use-handle-draft";

const SELL_PRODUCT_CREATE_DRAFT = gql`
  mutation SellProductCreateDraft {
    createDraftProduct {
      ...ProductDetailsFragment
    }
  }
  ${PRODUCT_DETAILS_FRAGMENT}
`;

const SELL_PRODUCT_QUERY = gql`
  query SellProductQuery {
    getDraftedProduct {
      ...ProductDetailsFragment
    }
    me {
      id
      selectedPayoutMethod
    }
  }
  ${PRODUCT_DETAILS_FRAGMENT}
`;

export default function SellProduct() {
  const { setVisible } = useHandleDraft();
  const { data, refetch } = useQuery<SellProductQueryQuery>(
    SELL_PRODUCT_QUERY,
    {
      notifyOnNetworkStatusChange: true, //necessary for the onCompleted to trigger during refetch
      onCompleted: async (data) => {
        //User must have a payout method to be able to sell
        if (!data.me.selectedPayoutMethod) {
          router.replace("/sell-product/payout");
          return;
        }
        const product = data.getDraftedProduct;
        if (!product) {
          //if drafted product does not exist, create a draft
          createDraft({
            onCompleted: () => refetch(),
          });
        }
      },
      fetchPolicy: "network-only",
    },
  );

  const [createDraft] = useMutation<SellProductCreateDraftMutation>(
    SELL_PRODUCT_CREATE_DRAFT,
  );

  if (!data?.getDraftedProduct) {
    return <LoadingSpinner />;
  }

  return (
    <EditProductScreen
      product={data?.getDraftedProduct}
      title="Ny annons"
      nextUrl="/sell-product/project"
      onDismiss={() => setVisible(true)}
    />
  );
}
