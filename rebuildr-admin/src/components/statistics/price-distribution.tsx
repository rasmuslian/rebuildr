"use client";

import { useQuery } from "@tanstack/react-query";
import { Segmented } from "antd";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  axisProps,
  barProps,
  CHART_COLORS,
  CHART_MARGIN,
  gridProps,
  tooltipFormatter,
  tooltipProps,
} from "@/components/statistics/chart-theme";
import { formatNumber } from "@/components/statistics/format";
import ChartCard from "@/components/ui/chart-card";
import {
  getPriceDistribution,
  PriceBucket,
} from "@/queries/statistics/insights";

const CONDITIONS = [
  { label: "Alla skick", value: "" },
  { label: "Nytt", value: "NEW" },
  { label: "Mycket bra", value: "VERY_GOOD" },
  { label: "Bra", value: "GOOD" },
] as const;

const compact = new Intl.NumberFormat("sv-SE", {
  notation: "compact",
  maximumFractionDigits: 0,
});

const bucketLabel = (bucket: PriceBucket) =>
  bucket.toSek === null
    ? `${compact.format(bucket.fromSek)}+ kr`
    : `${compact.format(bucket.fromSek)}–${compact.format(bucket.toSek)}`;

interface PriceDistributionProps {
  from: string;
  to: string;
}

/**
 * Where the listings sit price-wise. Giveaways are left out server-side —
 * a stack of zero-price rows would swamp the first bucket.
 */
const PriceDistribution = ({ from, to }: PriceDistributionProps) => {
  const [condition, setCondition] = useState<string>("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["price-distribution", from, to, condition],
    queryFn: () =>
      getPriceDistribution({
        from,
        to,
        condition: condition === "" ? undefined : condition,
      }),
  });

  const chartData = (data ?? []).map((bucket) => ({
    name: bucketLabel(bucket),
    count: bucket.count,
  }));

  const hasValues = chartData.some((entry) => entry.count > 0);

  return (
    <ChartCard
      title="Prisfördelning"
      subtitle="Publicerade annonser per prisintervall (kr, gratisannonser exkluderade)"
      loading={isLoading}
      error={isError}
      isEmpty={!hasValues}
      toolbar={
        <Segmented
          size="small"
          value={condition}
          onChange={(value) => setCondition(value as string)}
          options={[...CONDITIONS]}
        />
      }
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={CHART_MARGIN}>
          <CartesianGrid {...gridProps} />
          <XAxis dataKey="name" {...axisProps} />
          <YAxis allowDecimals={false} {...axisProps} width={48} />
          <Tooltip
            {...tooltipProps}
            formatter={tooltipFormatter(formatNumber, "Annonser")}
          />
          <Bar dataKey="count" fill={CHART_COLORS.blue} {...barProps} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default PriceDistribution;
