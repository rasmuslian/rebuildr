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
import { getUserStatistics } from "@/queries/statistics/user-statistics";
import ChartCard from "@/components/ui/chart-card";

interface UserStatisticsChartProps {
  from: string;
  to: string;
  groupBy: GroupBy;
}

const UserStatisticsChart = ({ from, to, groupBy }: UserStatisticsChartProps) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["user-statistics", groupBy, from, to],
    queryFn: () =>
      getUserStatistics(
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
      title="Nya användare över tid"
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
            formatter={tooltipFormatter(formatNumber, "Användare")}
          />
          <Bar dataKey="count" fill={CHART_COLORS.teal} {...barProps} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default UserStatisticsChart;
