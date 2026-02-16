import { useQuery } from "@apollo/client";
import React from "react";
import { SubCategoriesQuery, SubCategoriesQueryVariables } from "@/gql/graphql";
import { SUB_CATEGORIES } from "@/queries";
import { useScreenType } from "@hooks/useScreenType";
import { SubCategoriesListDesktop } from "./sub-categories-list.desktop";
import { SubCategoriesListMobile } from "./sub-categories-list.mobile";
import { useEffect } from "react";
import { usePathname } from "expo-router";
import { useFilterProduct } from "@hooks/useFilterProduct";

type Props = {
  id: string;
};

export function SubCategoriesList({ id }: Props) {
  const pathName = usePathname();
  const { isDesktop } = useScreenType();
  const { filterBuilder } = useFilterProduct();

  const { data } = useQuery<SubCategoriesQuery, SubCategoriesQueryVariables>(
    SUB_CATEGORIES,
    {
      variables: {
        input: { id },
      },
    },
  );

  useEffect(() => {
    if (data) {
      filterBuilder
        .setCategories([...data.category.children, data.category])
        .apply();
    }
  }, [pathName, data]);

  if (!data) {
    return null;
  }

  if (isDesktop) {
    return <SubCategoriesListDesktop category={data.category} />;
  }

  return <SubCategoriesListMobile category={data.category} />;
}
