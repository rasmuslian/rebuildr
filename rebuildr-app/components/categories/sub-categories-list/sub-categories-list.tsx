import { useQuery } from "@apollo/client";
import React from "react";
import { SubCategoriesQuery, SubCategoriesQueryVariables } from "@/gql/graphql";
import { SUB_CATEGORIES } from "@/queries";
import { useScreenType } from "@hooks/useScreenType";
import { SubCategoriesListDesktop } from "./sub-categories-list.desktop";
import { SubCategoriesListMobile } from "./sub-categories-list.mobile";

type Props = {
  id: string;
};

export function SubCategoriesList({ id }: Props) {
  const { isDesktop } = useScreenType();

  const { data } = useQuery<SubCategoriesQuery, SubCategoriesQueryVariables>(
    SUB_CATEGORIES,
    {
      variables: {
        input: { id },
      },
    },
  );

  if (!data) {
    return null;
  }

  if (isDesktop) {
    return <SubCategoriesListDesktop category={data.category} />;
  }

  return <SubCategoriesListMobile category={data.category} />;
}
