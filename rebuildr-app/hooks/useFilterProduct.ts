import { productFilterVar } from "@/apollo/config";
import { Category, OrderProductsEnum } from "@/gql/graphql";
import { useReactiveVar } from "@apollo/client";
import { PermanentSectionType } from "@constants/permanent-sections";
import {
  Filter,
  FilterProductCameFromEnum,
  initialFilterProduct,
} from "@context/filter-product-context";

export const useFilterProduct = () => {
  const filter = useReactiveVar(productFilterVar);

  const reset = () => {
    productFilterVar(initialFilterProduct);
  };

  //Presets are selectedCategoryId and sourceSection
  //Most regular filter adjustments should reset the presets
  const resetPresets = (): Filter => {
    return {
      ...filter,
      selectedCategoryId: undefined,
      sourceSection: undefined,
    };
  };

  const setSorting = (sorting: OrderProductsEnum, reset?: boolean) => {
    if (reset) {
      productFilterVar({ ...initialFilterProduct, sorting });
    } else {
      productFilterVar({ ...resetPresets(), sorting });
    }
  };

  const toggleAllRootCategories = () => {
    const filter = resetPresets();
    //since its undefined it means all categories are already selected
    //make it so none are selected
    if (!filter.rootCategoryIds) {
      productFilterVar({
        ...filter,
        rootCategoryIds: [],
        categoryIds: [],
      });
      return;
    }

    productFilterVar({
      ...filter,
      rootCategoryIds: undefined,
    });
  };

  const toggleRootCategory = (
    category: Pick<Category, "id"> & { children: Pick<Category, "id">[] },
  ) => {
    const filter = resetPresets();
    //we go from all selected to one. Reset categoryIds
    if (!filter.rootCategoryIds) {
      //if categoryIds are already selected, deselect those that are not children to this root. leave undefined if it already is undefined
      const newCategoryIds = filter.categoryIds?.filter((id) =>
        category.children.some((child) => child.id === id),
      );
      productFilterVar({
        ...filter,
        rootCategoryIds: [category.id],
        categoryIds: newCategoryIds,
      });
      return;
    }
    const isSelected = filter.rootCategoryIds.some(
      (categoryId) => categoryId === category.id,
    );
    if (!isSelected) {
      productFilterVar({
        ...filter,
        rootCategoryIds: [...filter.rootCategoryIds, category.id],
      });
    } else {
      //Also remove all child categories of this root
      const newCategoryIds = filter.categoryIds?.filter(
        (id) => !category.children.some((c) => c.id === id),
      );
      productFilterVar({
        ...filter,
        categoryIds: newCategoryIds,
        rootCategoryIds: filter.rootCategoryIds.filter(
          (categoryId) => categoryId !== category.id,
        ),
      });
    }
  };

  const toggleAllCategories = () => {
    const filter = resetPresets();
    if (!filter.categoryIds) {
      productFilterVar({
        ...filter,
        categoryIds: [],
      });
      return;
    }

    productFilterVar({
      ...filter,
      categoryIds: undefined,
    });
  };

  const separateRootAndCategories = (
    categories: Pick<Category, "id" | "parentId">[],
  ) => {
    const rootCategoryIds = categories.reduce(
      (acc: string[], curr) => [...acc, curr.parentId ?? curr.id],
      [],
    );
    const categoryIds = categories
      .filter((c) => !!c.parentId)
      .map((c) => c.id) as string[];

    return { rootCategoryIds, categoryIds };
  };

  const setCategories = (input: {
    categories: Pick<Category, "id" | "parentId">[];
    selectedCategoryId?: string;
    cameFrom?: FilterProductCameFromEnum;
  }) => {
    const filter = resetPresets();
    const { categories, selectedCategoryId, cameFrom } = input;
    const { rootCategoryIds, categoryIds } =
      separateRootAndCategories(categories);
    productFilterVar({
      ...filter,
      categoryIds,
      rootCategoryIds,
      selectedCategoryId: selectedCategoryId ?? undefined,
      cameFrom,
    });
  };

  const toggleValue = (
    value: string,
    filterKey: keyof Pick<Filter, "categoryIds" | "brandIds" | "conditions">,
  ) => {
    const filter = resetPresets();
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
    const filter = resetPresets();
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

  const resetAndSetSearchString = (searchString: string) => {
    productFilterVar({
      ...initialFilterProduct,
      searchString,
    });
  };

  const setSourceSection = (
    sectionData:
      | {
          section: PermanentSectionType;
          data: any;
        }
      | {
          section: "forTheSeason";
          data: Pick<Category, "id" | "parentId">[];
        }
      | {
          section: "nearYou";
          data: OrderProductsEnum.Distance;
        }
      | {
          section: "newArrivals";
          data: OrderProductsEnum.Latest;
        }
      | {
          section: "trendingNow";
          data: Pick<Category, "id" | "parentId">[];
        },
  ) => {
    const filter = resetPresets();
    switch (sectionData.section) {
      //Both cases have same logic, allow fallthrough
      case "nearYou":
      case "newArrivals":
        productFilterVar({
          ...filter,
          sorting: sectionData.data,
          sourceSection: sectionData.section,
        });
        break;
      //Both cases have same logic, allow fallthrough
      case "forTheSeason":
      case "trendingNow":
        {
          const { rootCategoryIds, categoryIds } = separateRootAndCategories(
            sectionData.data,
          );
          productFilterVar({
            ...filter,
            categoryIds,
            rootCategoryIds,
            sourceSection: sectionData.section,
          });
        }
        break;
    }
  };

  return {
    filter,
    reset,
    setSorting,
    toggleAllRootCategories,
    toggleRootCategory,
    toggleAllCategories,
    setCategories,
    toggleValue,
    setPrice,
    nrOfAppliedFilters,
    resetAndSetSearchString,
    setSourceSection,
  };
};
