import { Divider } from "@components/dividers/divider";
import { BrandFilter } from "./brand-filter";
import { CategoryFilter } from "./category-filter";
import { ConditionFilter } from "./condition-filter";
import { PriceFilter } from "./price-filter";
import { RootCategoryFilter } from "./root-category-filter";
import { SortingFilter } from "./sorting-filter";

export const FilterProduct = () => {
  return (
    <>
      <SortingFilter />
      <Divider />
      <RootCategoryFilter />
      <Divider />
      <CategoryFilter />
      <Divider />
      <BrandFilter />
      <Divider />
      <ConditionFilter />
      <Divider />
      <PriceFilter />
    </>
  );
};
