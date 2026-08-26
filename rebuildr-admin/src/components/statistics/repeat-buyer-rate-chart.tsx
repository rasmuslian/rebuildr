"use client";

import { useQuery } from "@tanstack/react-query";
import {
  CartesianGrid,
  Line,
  LineChart,
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
  tooltipFormatter,
  tooltipProps,
} from "@/components/statistics/chart-theme";
import { formatPercent } from "@/components/statistics/format";
import ChartCard from "@/components/ui/chart-card";
import { getRepeatBuyerRate } from "@/queries/statistics/repeat-buyer-rate";

interface RepeatBuyerRateChartProps {
  from: string;
  to: string;
  groupBy: GroupBy;
}

const RepeatBuyerRateChart = ({
  from,
  to,
  groupBy,
}: RepeatBuyerRateChartProps) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["repeat-buyer-rate", groupBy, from, to],
    queryFn: () =>
      getRepeatBuyerRate(
        groupBy.toLowerCase() as "day" | "week" | "month",
        from,
        to,
      ),
  });

  const chartData =
    data?.data.map((point) => ({
      date: formatChartDate(point.date, groupBy),
      percent: Number(point.percent.toFixed(1)),
    })) ?? [];

  return (
    <ChartCard
      title="Andel återkommande köpare"
      subtitle="Andel av köpen som gjordes av en tidigare köpare"
      hint="Ett köp räknas som återkommande om köparen har genomfört minst ett köp tidigare. Högre andel = starkare lojalitet."
      loading={isLoading}
      error={isError}
      isEmpty={!chartData.length}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={CHART_MARGIN}>
          <CartesianGrid {...gridProps} />
          <XAxis dataKey="date" {...axisProps} />
          <YAxis
            {...axisProps}
            width={48}
            domain={[0, 100]}
            tickFormatter={(value: number) => `${value} %`}
          />
          <Tooltip
            {...tooltipProps}
            formatter={tooltipFormatter(formatPercent, "Återkommande")}
          />
          <Line dataKey="percent" stroke={CHART_COLORS.primary} {...lineProps} />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default RepeatBuyerRateChart;
