import { router } from "expo-router";
import { gql, useQuery } from "@apollo/client";
import { ProjectGetMyProjectsQuery } from "@/gql/graphql";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import {
  PRODUCT_PROJECT_FRAGMENT,
  ProjectScreen,
} from "@components/product/project-screen";

const PROJECT_GET_MY_PROJECTS = gql`
  query ProjectGetMyProjects {
    myProjects {
      id
      title
    }
    getDraftedProduct {
      ...ProductProjectFragment
    }
  }
  ${PRODUCT_PROJECT_FRAGMENT}
`;

export default function Project() {
  const { data, refetch } = useQuery<ProjectGetMyProjectsQuery>(
    PROJECT_GET_MY_PROJECTS,
    {
      onCompleted(data) {
        if (!data.getDraftedProduct) {
          console.error("No draft found");
          router.replace("/");
        }
      },
    },
  );

  if (!data?.getDraftedProduct) {
    return <LoadingSpinner />;
  }

  return (
    <ProjectScreen
      product={data.getDraftedProduct}
      projects={data?.myProjects}
      title="Ny annons"
      nextUrl="/sell-product/transportation"
      refetchProduct={refetch}
    />
  );
}
