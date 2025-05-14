import { productFilterVar } from "@/apollo/config";
import { OrderProductsEnum, ProductConditionEnum } from "@/gql/graphql";
import { useReactiveVar } from "@apollo/client";
import { Filter, initialFilterProduct } from "@context/filter-product-context";

export const useFilterProduct = () => {
  const filter = useReactiveVar(productFilterVar);

  const reset = () => {
    productFilterVar(initialFilterProduct);
  };

  const setSorting = (sorting: OrderProductsEnum) => {
    productFilterVar({ ...filter, sorting });
  };

  const toggleAllRootCategories = () => {
    //since its undefined it means all categories are already selected
    //make it so none are selected
    if (!filter.rootCategoryIds) {
      productFilterVar({ ...filter, rootCategoryIds: [], categoryIds: [] });
      return;
    }

    productFilterVar({ ...filter, rootCategoryIds: undefined });
  };
  const toggleRootCategory = (id: string) => {
    //we go from all selected to one. Reset categoryIds
    if (!filter.rootCategoryIds) {
      productFilterVar({
        ...filter,
        rootCategoryIds: [id],
        categoryIds: undefined,
      });
      return;
    }
    const currentCategory = filter.rootCategoryIds?.find(
      (categoryId) => categoryId === id,
    );
    if (!currentCategory) {
      productFilterVar({
        ...filter,
        rootCategoryIds: [...filter.rootCategoryIds, id],
      });
    } else {
      productFilterVar({
        ...filter,
        rootCategoryIds: filter.rootCategoryIds.filter(
          (categoryId) => categoryId !== id,
        ),
      });
    }
  };

  const toggleCategory = (id: string) => {
    if (!filter.categoryIds) {
      productFilterVar({ ...filter, categoryIds: [id] });
      return;
    }
    const currentCategory = filter.categoryIds?.find(
      (categoryId) => categoryId === id,
    );
    if (!currentCategory) {
      productFilterVar({
        ...filter,
        categoryIds: [...filter.categoryIds, id],
      });
    } else {
      productFilterVar({
        ...filter,
        categoryIds: filter.categoryIds.filter(
          (categoryId) => categoryId !== id,
        ),
      });
    }
  };
  const toggleAllCategories = () => {
    if (!filter.categoryIds) {
      productFilterVar({ ...filter, categoryIds: [] });
      return;
    }

    productFilterVar({ ...filter, categoryIds: undefined });
  };
  const setCategories = (ids: string[]) => {
    productFilterVar({ ...filter, categoryIds: ids });
  };

  const toggleBrand = (id: string) => {
    if (!filter.brandIds) {
      productFilterVar({ ...filter, brandIds: [id] });
      return;
    }

    const brandSelected = filter.brandIds.find((brandId) => brandId === id);
    if (!brandSelected) {
      productFilterVar({ ...filter, brandIds: [...filter.brandIds, id] });
    } else {
      productFilterVar({
        ...filter,
        brandIds: filter.brandIds.filter((brandId) => brandId !== id),
      });
    }
  };

  const toggleCondition = (condition: ProductConditionEnum) => {
    if (!filter.conditions) {
      productFilterVar({ ...filter, conditions: [condition] });
      return;
    }

    const conditionSelected = filter.conditions.find((c) => c === condition);
    if (!conditionSelected) {
      productFilterVar({
        ...filter,
        conditions: [...filter.conditions, condition],
      });
    } else {
      productFilterVar({
        ...filter,
        conditions: filter.conditions.filter((c) => c !== condition),
      });
    }
  };

  const toggleValue = (
    value: string,
    filterKey: keyof Pick<Filter, "categoryIds" | "brandIds" | "conditions">,
  ) => {
    if (!filter[filterKey]) {
      productFilterVar({ ...filter, [filterKey]: [value] });
      return;
    }

    const selected = filter[filterKey].find((v) => v === value);
    if (!selected) {
      productFilterVar({
        ...filter,
        [filterKey]: [...filter[filterKey], value],
      });
    } else {
      productFilterVar({
        ...filter,
        [filterKey]: filter[filterKey].filter((v) => v !== value),
      });
    }
  };

  const setPrice = (price1: number, price2: number) => {
    productFilterVar({
      ...filter,
      price: [
        price1 <= price2 ? price1 : price2,
        price1 <= price2 ? price2 : price1,
      ],
    });
  };

  const nrOfAppliedFilters = () => {
    let acc = 0;
    acc += filter.brandIds !== initialFilterProduct.brandIds ? 1 : 0;
    acc += filter.categoryIds !== initialFilterProduct.categoryIds ? 1 : 0;
    acc += filter.conditions !== initialFilterProduct.conditions ? 1 : 0;

    if (filter.sorting !== initialFilterProduct.sorting) {
      acc += 1;
    }

    if (
      filter.price[0] !== initialFilterProduct.price[0] ||
      filter.price[1] !== initialFilterProduct.price[1]
    ) {
      acc += 1;
    }

    return acc;
  };

  return {
    filter,
    reset,
    setSorting,
    toggleAllRootCategories,
    toggleRootCategory,
    toggleCategory,
    toggleAllCategories,
    setCategories,
    toggleBrand,
    toggleCondition,
    toggleValue,
    setPrice,
    nrOfAppliedFilters,
  };
};
