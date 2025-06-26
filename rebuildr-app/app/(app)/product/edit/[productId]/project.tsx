import {
  EditProductProjectQuery,
  EditProductProjectQueryVariables,
} from "@/gql/graphql";
import { gql, useQuery } from "@apollo/client";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import {
  PRODUCT_PROJECT_FRAGMENT,
  ProjectScreen,
} from "@components/product/project-screen";
import { useLocalSearchParams } from "expo-router";

const EDIT_PRODUCT_PROJECT = gql`
  query EditProductProject($input: GetProductInput!) {
    myProjects {
      id
      title
    }
    product(input: $input) {
      ...ProductProjectFragment
    }
  }
  ${PRODUCT_PROJECT_FRAGMENT}
`;

export default function Project() {
  const { productId } = useLocalSearchParams<{ productId: string }>();
  const { data, refetch } = useQuery<
    EditProductProjectQuery,
    EditProductProjectQueryVariables
  >(EDIT_PRODUCT_PROJECT, { variables: { input: { id: productId } } });

  if (!data) {
    return <LoadingSpinner />;
  }

  return (
    <ProjectScreen
      product={data.product}
      projects={data.myProjects}
      title="Redigera annons"
      refetchProduct={() => refetch}
      nextUrl={{
        pathname: "/product/edit/[productId]/transportation",
        params: { productId },
      }}
    />
  );
}
