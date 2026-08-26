"use client";

import { InfoCircleOutlined } from "@ant-design/icons";
import { Tooltip } from "antd";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { twMerge } from "tailwind-merge";

import { CHART_COLORS } from "@/components/statistics/chart-theme";
import { ValueParts } from "@/components/statistics/format";
import DeltaChip from "@/components/ui/delta-chip";

type StatCardProps = {
  label: string;
  /** Pre-formatted value; unit is rendered smaller beside the number. */
  value: ValueParts;
  /** Swedish definition shown behind the info icon. */
  definition?: string;
  changePercent?: number | null;
  /** Sparkline values in chronological order; omit for compact tiles. */
  sparkline?: number[];
  /** Extra line under the value, e.g. "varav företag: 4". */
  footnote?: string;
  onClick?: () => void;
  loading?: boolean;
  size?: "primary" | "compact";
  className?: string;
};

const StatCard = ({
  label,
  value,
  definition,
  changePercent,
  sparkline,
  footnote,
  onClick,
  loading,
  size = "primary",
  className,
}: StatCardProps) => {
  const interactive = Boolean(onClick);
  const sparklineData = sparkline?.map((v, index) => ({ index, v }));
  //A trend needs at least three points and some variation; a flat series
  //renders as a solid block that suggests a shape which isn't there.
  const hasSparkline = Boolean(
    sparklineData &&
      sparklineData.length >= 3 &&
      new Set(sparklineData.map((point) => point.v)).size > 1,
  );
  const color = CHART_COLORS.primary;
  //Gradients live in the SVG's own defs, so each tile needs a unique id.
  const gradientId = `spark-${label.replace(/\W/g, "")}`;

  return (
    <div
      className={twMerge(
        "flex flex-col gap-1 overflow-hidden rounded-lg border border-gray-200 bg-white",
        //A shared minimum keeps a row of tiles level whether or not the
        //metric has a trend to show.
        size === "primary" ? "min-h-[9.5rem] p-4" : "px-4 py-3",
        interactive &&
          "hover:border-accent_300 cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent_400",
        className,
      )}
      onClick={onClick}
      onKeyDown={
        interactive
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
    >
      <div className="text-label-medium flex items-center gap-1 text-gray-600">
        <span>{label}</span>
        {definition && (
          <Tooltip title={definition}>
            <InfoCircleOutlined className="text-gray-400" />
          </Tooltip>
        )}
      </div>

      {loading ? (
        <div className="bg-neutrals_200 my-1 h-7 w-24 animate-pulse rounded" />
      ) : (
        <div className="flex items-baseline gap-1">
          <span
            className={twMerge(
              "tabular-nums",
              size === "primary" ? "text-headline-medium" : "text-headline-small",
            )}
          >
            {value.value}
          </span>
          {value.unit && (
            <span className="text-label-medium text-gray-500">{value.unit}</span>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {changePercent !== undefined && (
          <DeltaChip changePercent={changePercent} />
        )}
        {footnote && (
          <span className="text-label-small text-gray-500">{footnote}</span>
        )}
      </div>

      {/* Full-width strip at the bottom: the trend gets room to read as a
          shape instead of fighting the delta chip for horizontal space.
          Fewer than three points draw a straight line that says nothing, so
          the strip is left out entirely. */}
      {hasSparkline && (
        <div className="-mx-4 -mb-4 mt-auto h-12 pt-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={sparklineData}
              margin={{ top: 4, right: 0, bottom: 0, left: 0 }}
            >
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.2} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="v"
                stroke={color}
                strokeWidth={2}
                fill={`url(#${gradientId})`}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default StatCard;
