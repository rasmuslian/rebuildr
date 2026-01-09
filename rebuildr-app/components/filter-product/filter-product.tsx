import { Divider } from "@components/dividers/divider";
import { BrandFilter } from "./brand-filter";
import { CategoryFilter } from "./category-filter";
import { ConditionFilter } from "./condition-filter";
import { PriceFilter } from "./price-filter";
import { RootCategoryFilter } from "./root-category-filter";
import { SortingFilter } from "./sorting-filter";
import { Headline } from "@components/typography/text";

export const FilterProduct = () => {
  return (
    <>
      <SortingFilter />
      <Divider />
      <Headline size="small" style={{ marginBottom: 16 }}>
        Filtrering
      </Headline>
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
