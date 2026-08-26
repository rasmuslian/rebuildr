"use client";

import { useQuery } from "@tanstack/react-query";
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
  formatChartDate,
  gridProps,
  GroupBy,
  tooltipFormatter,
  tooltipProps,
} from "@/components/statistics/chart-theme";
import { formatNumber } from "@/components/statistics/format";
import { getProductStatistics } from "@/queries/product/product-statistics";
import ChartCard from "@/components/ui/chart-card";

interface ProductStatisticsChartProps {
  from: string;
  to: string;
  groupBy: GroupBy;
}

const ProductStatisticsChart = ({
  from,
  to,
  groupBy,
}: ProductStatisticsChartProps) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["product-statistics", groupBy, from, to],
    queryFn: () =>
      getProductStatistics(
        groupBy.toLowerCase() as "day" | "week" | "month",
        from,
        to,
      ),
  });

  const chartData =
    data?.data.map((point) => ({
      date: formatChartDate(point.date, groupBy),
      count: point.count,
    })) ?? [];

  return (
    <ChartCard
      title="Annonser skapade över tid"
      loading={isLoading}
      error={isError}
      isEmpty={!chartData.length}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={CHART_MARGIN}>
          <CartesianGrid {...gridProps} />
          <XAxis dataKey="date" {...axisProps} />
          <YAxis allowDecimals={false} {...axisProps} width={48} />
          <Tooltip
            {...tooltipProps}
            formatter={tooltipFormatter(formatNumber, "Annonser")}
          />
          <Bar dataKey="count" fill={CHART_COLORS.primary} {...barProps} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default ProductStatisticsChart;
