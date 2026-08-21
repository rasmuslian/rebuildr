import { productFilterVar } from "@/apollo/config";
import {
  Category,
  OrderProductsEnum,
  ProductConditionEnum,
} from "@/gql/graphql";
import { getItem, setItem } from "@/utils/async-storage";
import { useReactiveVar } from "@apollo/client";
import { useEffect } from "react";
import { Filter, initialFilterProduct } from "@context/filter-product-context";

const PRODUCT_FILTER_STORAGE_KEY = "product-filter";

let hasHydratedProductFilter = false;

export const useFilterProduct = () => {
  const filter = useReactiveVar(productFilterVar);
  const filterBuilder = new FilterBuilder(filter);

  useEffect(() => {
    if (hasHydratedProductFilter) {
      return;
    }

    hasHydratedProductFilter = true;

    hydrateProductFilter().catch(() => undefined);
  }, []);

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

  const toProductsQueryInput = () => {
    const categoryIds = [
      ...(filter.rootCategoryIds ?? []),
      ...(filter.categoryIds ?? []),
    ];

    return {
      searchString: filter.searchString,
      orderBy: filter.sorting,
      categoryIds:
        filter.rootCategoryIds !== undefined || filter.categoryIds !== undefined
          ? categoryIds
          : undefined,
      brandIds: filter.brandIds,
      conditions: filter.conditions,
      minPrice: filter.price?.[0],
      maxPrice: filter.price?.[1],
      giveaway: filter.giveaway,
      projectId: filter.projectId,
    };
  };

  return {
    filter,
    filterBuilder,
    nrOfAppliedFilters,
    toProductsQueryInput,
  };
};

class FilterBuilder {
  private filter: Filter;
  constructor(filter?: Filter) {
    this.filter = filter ?? initialFilterProduct;
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
    const nextFilter = { ...this.filter };

    this.filter = productFilterVar(nextFilter);
    setItem(PRODUCT_FILTER_STORAGE_KEY, nextFilter).catch(() => undefined);
  }

  setOrdering(sorting: OrderProductsEnum) {
    this.filter = { ...this.filter, sorting };
    return this;
  }

  toggleAllRootCategories() {
    //since its undefined it means all categories are already selected
    //make it so none are selected
    if (!this.filter.rootCategoryIds) {
      this.filter = { ...this.filter, rootCategoryIds: [], categoryIds: [] };
    } else {
      this.filter = { ...this.filter, rootCategoryIds: undefined };
    }

    return this;
  }

  toggleRootCategory(
    category: Pick<Category, "id"> & { children: Pick<Category, "id">[] },
  ) {
    //we go from all selected to one. Reset categoryIds
    if (!this.filter.rootCategoryIds) {
      //if categoryIds are already selected, deselect those that are not children to this root. leave undefined if it already is undefined
      const newCategoryIds = this.filter.categoryIds?.filter((id) =>
        category.children.some((child) => child.id === id),
      );
      this.filter = {
        ...this.filter,
        rootCategoryIds: [category.id],
        categoryIds: newCategoryIds,
      };
      return this;
    }
    const isSelected = this.filter.rootCategoryIds.some(
      (categoryId) => categoryId === category.id,
    );
    if (!isSelected) {
      this.filter = {
        ...this.filter,
        rootCategoryIds: [...this.filter.rootCategoryIds, category.id],
      };
      return this;
    } else {
      //Also remove all child categories of this root
      const newCategoryIds = this.filter.categoryIds?.filter(
        (id) => !category.children.some((c) => c.id === id),
      );
      this.filter = {
        ...this.filter,
        categoryIds: newCategoryIds,
        rootCategoryIds: this.filter.rootCategoryIds.filter(
          (categoryId) => categoryId !== category.id,
        ),
      };
      return this;
    }
  }

  toggleAllCategories() {
    if (!this.filter.categoryIds) {
      this.filter = {
        ...this.filter,
        categoryIds: [],
      };
    } else {
      this.filter = {
        ...this.filter,
        categoryIds: undefined,
      };
    }
    return this;
  }

  setCategories(categories: Pick<Category, "id" | "parentId">[]) {
    const { rootCategoryIds, categoryIds } =
      this.separateRootAndCategories(categories);

    this.filter = {
      ...this.filter,
      categoryIds,
      rootCategoryIds,
    };

    return this;
  }

  toggleValue(
    value: string,
    filterKey: keyof Pick<Filter, "categoryIds" | "brandIds" | "conditions">,
  ) {
    if (!this.filter[filterKey]) {
      this.filter = { ...this.filter, [filterKey]: [value] };
      return this;
    }

    const selected = this.filter[filterKey].find((v) => v === value);
    if (!selected) {
      this.filter = {
        ...this.filter,
        [filterKey]: [...this.filter[filterKey], value],
      };
    } else {
      this.filter = {
        ...this.filter,
        [filterKey]: this.filter[filterKey].filter((v) => v !== value),
      };
    }
    return this;
  }

  setPrice(price1: number, price2: number) {
    this.filter = {
      ...this.filter,
      price: [
        price1 <= price2 ? price1 : price2,
        price1 <= price2 ? price2 : price1,
      ],
      giveaway: false,
    };
    return this;
  }
  setGiveaway(v: boolean) {
    this.filter = {
      ...this.filter,
      giveaway: v,
    };
    return this;
  }

  setSearchString(searchString: string) {
    this.filter = {
      ...this.filter,
      searchString,
    };
    return this;
  }

  setProjectId(projectId: string) {
    this.filter = {
      ...this.filter,
      projectId,
    };
    return this;
  }
}

const isStringArray = (value: unknown): value is string[] => {
  return (
    Array.isArray(value) && value.every((item) => typeof item === "string")
  );
};

const isConditionArray = (value: unknown): value is ProductConditionEnum[] => {
  return (
    Array.isArray(value) &&
    value.every((item) =>
      Object.values(ProductConditionEnum).includes(
        item as ProductConditionEnum,
      ),
    )
  );
};

const isPriceRange = (value: unknown): value is [number, number] => {
  return (
    Array.isArray(value) &&
    value.length === 2 &&
    value.every((item) => typeof item === "number")
  );
};

const normalizeStoredFilter = (value: unknown): Filter | undefined => {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const storedFilter = value as Partial<Filter>;

  return {
    sorting: Object.values(OrderProductsEnum).includes(
      storedFilter.sorting as OrderProductsEnum,
    )
      ? (storedFilter.sorting as OrderProductsEnum)
      : initialFilterProduct.sorting,
    rootCategoryIds: isStringArray(storedFilter.rootCategoryIds)
      ? storedFilter.rootCategoryIds
      : undefined,
    categoryIds: isStringArray(storedFilter.categoryIds)
      ? storedFilter.categoryIds
      : undefined,
    brandIds: isStringArray(storedFilter.brandIds)
      ? storedFilter.brandIds
      : undefined,
    conditions: isConditionArray(storedFilter.conditions)
      ? storedFilter.conditions
      : undefined,
    price: isPriceRange(storedFilter.price) ? storedFilter.price : undefined,
    giveaway:
      typeof storedFilter.giveaway === "boolean"
        ? storedFilter.giveaway
        : initialFilterProduct.giveaway,
    searchString:
      typeof storedFilter.searchString === "string"
        ? storedFilter.searchString
        : undefined,
    projectId:
      typeof storedFilter.projectId === "string"
        ? storedFilter.projectId
        : undefined,
  };
};

const hydrateProductFilter = async () => {
  const storedFilter = normalizeStoredFilter(
    await getItem(PRODUCT_FILTER_STORAGE_KEY),
  );

  if (!storedFilter) {
    return;
  }

  productFilterVar(storedFilter);
};
