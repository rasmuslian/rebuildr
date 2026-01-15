import { minimumPayout, provisionBase } from 'src/constants/pricing';

export const minimumProductPrice = () => {
  return minimumPayout * (1 + provisionBase);
};
