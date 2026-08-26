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
import { formatCo2 } from "@/components/statistics/format";
import ChartCard from "@/components/ui/chart-card";
import { getCo2Savings } from "@/queries/statistics/co2-savings";

interface Co2SavingsChartProps {
  from: string;
  to: string;
  groupBy: GroupBy;
}

const Co2SavingsChart = ({ from, to, groupBy }: Co2SavingsChartProps) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["co2-savings", groupBy, from, to],
    queryFn: () =>
      getCo2Savings(
        groupBy.toLowerCase() as "day" | "week" | "month",
        from,
        to,
      ),
  });

  const chartData =
    data?.data.map((point) => ({
      date: formatChartDate(point.date, groupBy),
      co2Kg: Number(point.co2Kg.toFixed(1)),
    })) ?? [];

  return (
    <ChartCard
      title="CO₂-besparing över tid"
      subtitle="Uppskattad klimatbesparing från genomförda köp"
      hint="Samma definition som CO₂-nyckeltalet: summeras per period så trenden stämmer med kortet högst upp."
      loading={isLoading}
      error={isError}
      isEmpty={!chartData.length}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={CHART_MARGIN}>
          <CartesianGrid {...gridProps} />
          <XAxis dataKey="date" {...axisProps} />
          <YAxis
            {...axisProps}
            width={56}
            tickFormatter={(value: number) => formatCo2(value)}
          />
          <Tooltip
            {...tooltipProps}
            formatter={tooltipFormatter(formatCo2, "CO₂")}
          />
          <Bar dataKey="co2Kg" fill={CHART_COLORS.teal} {...barProps} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default Co2SavingsChart;
