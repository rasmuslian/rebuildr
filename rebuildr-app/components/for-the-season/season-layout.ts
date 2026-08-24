// Chip widths are estimated rather than measured: the chips must be laid out in
// the same pass that renders them, and measuring every label first would cost a
// visible reflow. The estimate only has to be good enough to decide how many
// rows are needed and whether they fit without scrolling.
// The per-character figure tracks the label size — raise it if the label grows,
// or rows will be judged narrower than they render and chips fall off the edge.
const APPROX_CHAR_WIDTH = 9;
const CHIP_HORIZONTAL_PADDING = 32;

export const MAX_CHIP_WIDTH = 280;

export type SeasonChip = { name: string };

export type SeasonLayoutInput<T extends SeasonChip> = {
  categories: T[];
  containerWidth: number;
  isDesktop: boolean;
};

export type SeasonLayout<T extends SeasonChip> = {
  rows: T[][];
  chipSize: number;
  gap: number;
  widestRowWidth: number;
  fitsWithoutScroll: boolean;
};

export const chipSizeFor = (isDesktop: boolean) => (isDesktop ? 56 : 44);
export const gapFor = (isDesktop: boolean) => (isDesktop ? 12 : 8);

export const estimateChipWidth = (name: string, chipSize: number) =>
  APPROX_CHAR_WIDTH * name.length + CHIP_HORIZONTAL_PADDING + chipSize;

export const estimateRowWidth = (
  row: SeasonChip[],
  chipSize: number,
  gap: number,
) =>
  row.reduce((acc, curr) => acc + estimateChipWidth(curr.name, chipSize), 0) +
  gap * Math.max(row.length - 1, 0);

/**
 * Splits the chips across two rows of roughly equal width, then decides whether
 * the result fits the container. A container width of 0 means layout has not
 * been measured yet, so the caller should assume scrolling until it has.
 */
export const buildSeasonLayout = <T extends SeasonChip>({
  categories,
  containerWidth,
  isDesktop,
}: SeasonLayoutInput<T>): SeasonLayout<T> => {
  const chipSize = chipSizeFor(isDesktop);
  const gap = gapFor(isDesktop);
  const rowWidth = (row: T[]) => estimateRowWidth(row, chipSize, gap);

  const balanced = categories.reduce<T[][]>(
    (acc, curr) =>
      rowWidth(acc[0]) > rowWidth(acc[1])
        ? [acc[0], [...acc[1], curr]]
        : [[...acc[0], curr], acc[1]],
    [[], []],
  );

  const fitsSingleRow =
    containerWidth > 0 && rowWidth(categories) <= containerWidth;
  const candidates: T[][] = fitsSingleRow ? [categories] : balanced;
  const rows = candidates.filter((row) => row.length > 0);

  const widestRowWidth = rows.length ? Math.max(...rows.map(rowWidth)) : 0;

  return {
    rows,
    chipSize,
    gap,
    widestRowWidth,
    fitsWithoutScroll:
      isDesktop && containerWidth > 0 && widestRowWidth <= containerWidth,
  };
};
