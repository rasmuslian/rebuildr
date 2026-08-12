type GridColumnOptions = {
  targetWidth?: number;
  gap?: number;
  minColumns?: number;
  maxColumns?: number;
};

// Given the width available to a grid, return how many ~targetWidth-wide columns fit,
// clamped to [minColumns, maxColumns]. Keeps cards a consistent size at any viewport.
export const getGridColumns = (
  availableWidth: number,
  {
    targetWidth = 240,
    gap = 24,
    minColumns = 2,
    maxColumns = 6,
  }: GridColumnOptions = {},
): number => {
  if (availableWidth <= 0) return minColumns;
  const columns = Math.floor((availableWidth + gap) / (targetWidth + gap));
  return Math.min(maxColumns, Math.max(minColumns, columns));
};
