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
  const filterBuilder = new FilterBuilder(filter);

  const nrOfAppliedFilters = () => {
    let acc = 0;
    acc += filter.brandIds !== initialFilterProduct.brandIds ? 1 : 0;
    acc +=
      filter.rootCategoryIds !== initialFilterProduct.rootCategoryIds ? 1 : 0;
    acc += filter.categoryIds !== initialFilterProduct.categoryIds ? 1 : 0;
    acc += filter.conditions !== initialFilterProduct.conditions ? 1 : 0;

    if (filter.sorting !== initialFilterProduct.sorting) {
      acc += 1;
    }

    if (filter.price || filter.giveaway) {
      acc += 1;
    }

    return acc;
  };

  return {
    filter,
    filterBuilder,
    nrOfAppliedFilters,
  };
};

class FilterBuilder {
  private filter: Filter;
  constructor(filter?: Filter) {
    this.filter = filter ?? initialFilterProduct;
  }
  //Presets are selectedCategoryId and sourceSection
  //Most regular filter adjustments should reset the presets
  private resetPresets() {
    this.filter = {
      ...this.filter,
      selectedCategoryId: undefined,
      sourceSection: undefined,
    };
    return this.filter;
  }

  private separateRootAndCategories = (
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

  reset() {
    this.filter = initialFilterProduct;
    return this;
  }

  apply() {
    this.filter = productFilterVar({ ...this.filter });
  }

  setOrdering(sorting: OrderProductsEnum) {
    this.filter = { ...this.resetPresets(), sorting };
    return this;
  }

  toggleAllRootCategories() {
    const filter = this.resetPresets();
    //since its undefined it means all categories are already selected
    //make it so none are selected
    if (!filter.rootCategoryIds) {
      this.filter = { ...filter, rootCategoryIds: [], categoryIds: [] };
    } else {
      this.filter = { ...filter, rootCategoryIds: undefined };
    }

    return this;
  }

  toggleRootCategory(
    category: Pick<Category, "id"> & { children: Pick<Category, "id">[] },
  ) {
    const filter = this.resetPresets();
    //we go from all selected to one. Reset categoryIds
    if (!filter.rootCategoryIds) {
      //if categoryIds are already selected, deselect those that are not children to this root. leave undefined if it already is undefined
      const newCategoryIds = filter.categoryIds?.filter((id) =>
        category.children.some((child) => child.id === id),
      );
      this.filter = {
        ...filter,
        rootCategoryIds: [category.id],
        categoryIds: newCategoryIds,
      };
      return this;
    }
    const isSelected = filter.rootCategoryIds.some(
      (categoryId) => categoryId === category.id,
    );
    if (!isSelected) {
      this.filter = {
        ...filter,
        rootCategoryIds: [...filter.rootCategoryIds, category.id],
      };
      return this;
    } else {
      //Also remove all child categories of this root
      const newCategoryIds = filter.categoryIds?.filter(
        (id) => !category.children.some((c) => c.id === id),
      );
      this.filter = {
        ...filter,
        categoryIds: newCategoryIds,
        rootCategoryIds: filter.rootCategoryIds.filter(
          (categoryId) => categoryId !== category.id,
        ),
      };
      return this;
    }
  }

  toggleAllCategories() {
    const filter = this.resetPresets();
    if (!filter.categoryIds) {
      this.filter = {
        ...filter,
        categoryIds: [],
      };
    } else {
      this.filter = {
        ...filter,
        categoryIds: undefined,
      };
    }
    return this;
  }

  setCategories(categories: Pick<Category, "id" | "parentId">[]) {
    const filter = this.resetPresets();
    const { rootCategoryIds, categoryIds } =
      this.separateRootAndCategories(categories);
    this.filter = {
      ...filter,
      categoryIds,
      rootCategoryIds,
    };
    return this;
  }

  setSelectedCategoryId(id: string) {
    const filter = this.resetPresets();
    this.filter = {
      ...filter,
      selectedCategoryId: id,
    };
    return this;
  }

  setCameFrom(cameFrom: FilterProductCameFromEnum) {
    this.filter = {
      ...this.filter,
      cameFrom,
    };
    return this;
  }

  toggleValue(
    value: string,
    filterKey: keyof Pick<Filter, "categoryIds" | "brandIds" | "conditions">,
  ) {
    const filter = this.resetPresets();
    if (!filter[filterKey]) {
      this.filter = { ...filter, [filterKey]: [value] };
      return this;
    }

    const selected = filter[filterKey].find((v) => v === value);
    if (!selected) {
      this.filter = {
        ...filter,
        [filterKey]: [...filter[filterKey], value],
      };
    } else {
      this.filter = {
        ...filter,
        [filterKey]: filter[filterKey].filter((v) => v !== value),
      };
    }
    return this;
  }

  setPrice(price1: number, price2: number) {
    const filter = this.resetPresets();
    this.filter = {
      ...filter,
      price: [
        price1 <= price2 ? price1 : price2,
        price1 <= price2 ? price2 : price1,
      ],
      giveaway: false,
    };
    return this;
  }
  setGiveaway(v: boolean) {
    const filter = this.resetPresets();
    this.filter = {
      ...filter,
      giveaway: v,
    };
    return this;
  }

  setSearchString(searchString: string) {
    const filter = this.resetPresets();
    this.filter = {
      ...filter,
      searchString,
    };
    return this;
  }

  setSourceSection(section: PermanentSectionType) {
    const filter = this.resetPresets();
    this.filter = {
      ...filter,
      sourceSection: section,
    };
    return this;
  }
}
