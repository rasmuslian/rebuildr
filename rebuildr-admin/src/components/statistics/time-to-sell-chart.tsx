"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  axisProps,
  CHART_COLORS,
  CHART_MARGIN,
  formatChartDate,
  gridProps,
  GroupBy,
  lineProps,
  tooltipProps,
} from "@/components/statistics/chart-theme";
import ChartCard from "@/components/ui/chart-card";
import { getTimeToSell } from "@/queries/statistics/insights";

const oneDecimal = new Intl.NumberFormat("sv-SE", {
  maximumFractionDigits: 1,
});

interface TimeToSellChartProps {
  from: string;
  to: string;
  groupBy: GroupBy;
}

/**
 * Median days from publication to sale, with the middle half of listings
 * shaded behind it. The median rather than a mean: a few listings that sit
 * for months would drag an average away from the typical experience.
 */
const TimeToSellChart = ({ from, to, groupBy }: TimeToSellChartProps) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["time-to-sell", from, to, groupBy],
    queryFn: () => getTimeToSell({ from, to, groupBy }),
  });

  const chartData = (data ?? []).map((point) => ({
    date: formatChartDate(point.date, groupBy),
    median: Number(point.medianDays.toFixed(1)),
    //Stacked areas draw the p25–p75 band: an invisible base plus its height.
    bandBase: Number(point.p25Days.toFixed(1)),
    bandHeight: Number((point.p75Days - point.p25Days).toFixed(1)),
    count: point.count,
  }));

  return (
    <ChartCard
      title="Tid till försäljning"
      subtitle="Median antal dagar från publicering till genomfört köp"
      hint="Linjen visar mediantiden: hälften av annonserna såldes snabbare, hälften långsammare. Det skuggade fältet (”mittersta hälften”) visar spannet där de mellersta 50 % av annonserna hamnade — smalt fält = jämn säljtid, brett fält = stor spridning."
      loading={isLoading}
      error={isError}
      isEmpty={!chartData.length}
    >
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={CHART_MARGIN}>
          <CartesianGrid {...gridProps} />
          <XAxis dataKey="date" {...axisProps} />
          <YAxis
            {...axisProps}
            width={48}
            tickFormatter={(value: number) => `${value} d`}
          />
          <Tooltip
            {...tooltipProps}
            formatter={(value: unknown, name: unknown) => {
              const days = `${oneDecimal.format(Number(value ?? 0))} dagar`;
              if (name === "median") return [days, "Median"];
              if (name === "bandHeight") return [days, "Spann (25–75 %)"];
              return [days, String(name)];
            }}
          />
          <Legend
            formatter={(value) =>
              value === "median" ? "Median" : "Mittersta hälften"
            }
          />
          <Area
            dataKey="bandBase"
            stackId="band"
            stroke="none"
            fill="transparent"
            legendType="none"
            tooltipType="none"
            isAnimationActive={false}
          />
          <Area
            dataKey="bandHeight"
            stackId="band"
            stroke="none"
            fill={CHART_COLORS.primary}
            fillOpacity={0.12}
            isAnimationActive={false}
          />
          <Line
            dataKey="median"
            stroke={CHART_COLORS.primary}
            {...lineProps}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default TimeToSellChart;
