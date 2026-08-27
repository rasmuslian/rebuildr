import { Product } from 'src/entities/product.entity';

type ReportingProduct = Pick<
  Product,
  | 'co2SavingBuyer'
  | 'co2SavingSeller'
  | 'initialPrimaryQuantity'
  | 'price'
  | 'priceSuggestionMax'
  | 'priceSuggestionMin'
  | 'primaryQuantity'
  | 'publicPriceConfirmed'
  | 'soldByQuantity'
  | 'weight'
>;

export const getProductMarketValueOre = (product: ReportingProduct) => {
  if (
    product.priceSuggestionMin !== null &&
    product.priceSuggestionMin !== undefined &&
    product.priceSuggestionMax !== null &&
    product.priceSuggestionMax !== undefined
  ) {
    return Math.round(
      ((product.priceSuggestionMin + product.priceSuggestionMax) / 2) * 100,
    );
  }
  return product.publicPriceConfirmed ? product.price : 0;
};

export const allocateProductReportingValues = (
  product: ReportingProduct,
  quantity?: number | null,
) => {
  const allocatedQuantity = product.soldByQuantity ? quantity ?? 0 : 1;
  const initialQuantity = product.soldByQuantity
    ? product.initialPrimaryQuantity ??
      product.primaryQuantity ??
      allocatedQuantity
    : 1;
  const factor =
    initialQuantity > 0
      ? Math.min(1, Math.max(0, allocatedQuantity / initialQuantity))
      : 0;

  return {
    weight: (product.weight ?? 0) * factor,
    co2SavingBuyer: (product.co2SavingBuyer ?? 0) * factor,
    co2SavingSeller: (product.co2SavingSeller ?? 0) * factor,
    marketValue: Math.round(getProductMarketValueOre(product) * factor),
  };
};
