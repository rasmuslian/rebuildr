"use client";

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
  formatChartDate,
  gridProps,
  GroupBy,
  tooltipFormatter,
  tooltipProps,
} from "@/components/statistics/chart-theme";
import { formatCompact, formatNumber, formatSek } from "@/components/statistics/format";
import { PurchaseStatisticsDataPoint } from "@/queries/statistics/purchase-statistics";
import ChartCard from "@/components/ui/chart-card";

type Metric = "gmv" | "count";

type SalesTrendChartProps = {
  data: PurchaseStatisticsDataPoint[];
  groupBy: GroupBy;
  loading?: boolean;
  error?: boolean;
  height?: number;
};

/**
 * Sales over time. Kronor and order count are two different scales, so they
 * are shown one at a time rather than on two y-axes — a dual axis invites
 * comparisons between the curves that the geometry does not support.
 */
const SalesTrendChart = ({
  data,
  groupBy,
  loading,
  error,
  height = 320,
}: SalesTrendChartProps) => {
  const [metric, setMetric] = useState<Metric>("gmv");

  const chartData = data.map((point) => ({
    date: formatChartDate(point.date, groupBy),
    gmv: point.gmvSek ?? 0,
    count: point.count,
  }));

  const isMoney = metric === "gmv";

  return (
    <ChartCard
      title="Försäljning över tid"
      subtitle={isMoney ? "Summa genomförda köp" : "Antal genomförda köp"}
      loading={loading}
      error={error}
      isEmpty={!chartData.length}
      height={height}
      toolbar={
        <Segmented
          size="small"
          value={metric}
          onChange={(value) => setMetric(value as Metric)}
          options={[
            { label: "Kronor", value: "gmv" },
            { label: "Antal köp", value: "count" },
          ]}
        />
      }
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={CHART_MARGIN}>
          <CartesianGrid {...gridProps} />
          <XAxis dataKey="date" {...axisProps} />
          <YAxis {...axisProps} tickFormatter={formatCompact} width={56} />
          <Tooltip
            {...tooltipProps}
            formatter={tooltipFormatter(
              isMoney ? formatSek : formatNumber,
              isMoney ? "Försäljning" : "Antal köp",
            )}
          />
          <Bar
            dataKey={isMoney ? "gmv" : "count"}
            fill={CHART_COLORS.primary}
            {...barProps}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default SalesTrendChart;
