import { ArrowDownOutlined, ArrowUpOutlined } from "@ant-design/icons";
import { twMerge } from "tailwind-merge";

type DeltaChipProps = {
  /** Percent change against the previous period; null when it cannot be computed. */
  changePercent?: number | null;
  className?: string;
};

const percentFormatter = new Intl.NumberFormat("sv-SE", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

/**
 * Compact period-over-period indicator. The arrow carries the direction so the
 * chip never relies on colour alone, and the "vs föregående period" wording
 * lives in the tile's tooltip rather than inside the chip.
 */
const DeltaChip = ({ changePercent, className }: DeltaChipProps) => {
  if (changePercent === null || changePercent === undefined) {
    return (
      <span className={twMerge("text-label-medium text-gray-500", className)}>
        –
      </span>
    );
  }

  const isFlat = Math.abs(changePercent) < 0.05;
  const isUp = changePercent > 0;
  const tone = isFlat
    ? "bg-neutrals_200 text-neutrals_700"
    : isUp
      ? "bg-primary_100 text-primary_800"
      : "bg-semantic_error_100 text-semantic_error_700";

  return (
    <span
      className={twMerge(
        "text-label-medium inline-flex items-center gap-1 rounded-full px-2 py-0.5",
        tone,
        className,
      )}
    >
      {!isFlat && (isUp ? <ArrowUpOutlined /> : <ArrowDownOutlined />)}
      {percentFormatter.format(Math.abs(changePercent))} %
    </span>
  );
};

export default DeltaChip;
