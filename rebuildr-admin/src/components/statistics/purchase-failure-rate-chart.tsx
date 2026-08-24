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
  CHART_MARGIN,
  formatChartDate,
  gridProps,
  GroupBy,
  lineProps,
  STATUS_COLORS,
  tooltipFormatter,
  tooltipProps,
} from "@/components/statistics/chart-theme";
import { formatPercent } from "@/components/statistics/format";
import ChartCard from "@/components/ui/chart-card";
import { getPurchaseFailureRate } from "@/queries/statistics/purchase-failure-rate";

interface PurchaseFailureRateChartProps {
  from: string;
  to: string;
  groupBy: GroupBy;
}

const PurchaseFailureRateChart = ({
  from,
  to,
  groupBy,
}: PurchaseFailureRateChartProps) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["purchase-failure-rate", groupBy, from, to],
    queryFn: () =>
      getPurchaseFailureRate(
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
      title="Andel misslyckade köp"
      subtitle="Andel av avslutade köp som avbröts eller misslyckades"
      hint="Av de köp som nått ett slutläge (genomfört eller misslyckat), hur stor andel som misslyckades. Lägre är bättre."
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
            formatter={tooltipFormatter(formatPercent, "Misslyckade")}
          />
          <Line
            dataKey="percent"
            stroke={STATUS_COLORS.critical}
            {...lineProps}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default PurchaseFailureRateChart;
