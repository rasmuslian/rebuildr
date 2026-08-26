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
  gridProps,
  tooltipProps,
} from "@/components/statistics/chart-theme";
import { formatCompact, formatSek } from "@/components/statistics/format";
import ChartCard from "@/components/ui/chart-card";
import {
  BreakdownEntry,
  getPurchaseBreakdowns,
} from "@/queries/statistics/insights";

const TRANSPORT_LABELS: Record<string, string> = {
  PICKUP: "Upphämtning",
  SHIPPING: "Frakt",
  DELIVERY: "Leverans",
  UNKNOWN: "Okänt",
};

const PAYMENT_LABELS: Record<string, string> = {
  SWISH: "Swish",
  CARD: "Kort",
  UNKNOWN: "Okänt",
};

const BreakdownChart = ({
  title,
  subtitle,
  data,
  labels,
  color,
  loading,
  error,
}: {
  title: string;
  subtitle: string;
  data: BreakdownEntry[];
  labels: Record<string, string>;
  color: string;
  loading: boolean;
  error: boolean;
}) => {
  const chartData = data.map((entry) => ({
    name: labels[entry.method] ?? entry.method,
    gmvSek: entry.gmvSek,
    count: entry.count,
  }));

  return (
    <ChartCard
      title={title}
      subtitle={subtitle}
      loading={loading}
      error={error}
      isEmpty={!chartData.length}
      height={240}
    >
      <ResponsiveContainer width="100%" height="100%">
        {/* Horizontal bars: category names read straight across, no tilted
            axis labels. */}
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 8, right: 24, left: 8, bottom: 8 }}
        >
          <CartesianGrid {...gridProps} vertical horizontal={false} />
          <XAxis type="number" {...axisProps} tickFormatter={formatCompact} />
          <YAxis type="category" dataKey="name" {...axisProps} width={100} />
          <Tooltip
            {...tooltipProps}
            formatter={(value: unknown, _name: unknown, item) => [
              `${formatSek(Number(value ?? 0))} · ${item?.payload?.count ?? 0} köp`,
              "Försäljning",
            ]}
          />
          <Bar
            dataKey="gmvSek"
            fill={color}
            radius={[0, 4, 4, 0]}
            maxBarSize={barProps.maxBarSize}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

interface PurchaseBreakdownsProps {
  from: string;
  to: string;
}

const PurchaseBreakdowns = ({ from, to }: PurchaseBreakdownsProps) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["purchase-breakdowns", from, to],
    queryFn: () => getPurchaseBreakdowns({ from, to }),
  });

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <BreakdownChart
        title="Fraktsätt"
        subtitle="Försäljning per leveransmetod"
        data={data?.transport ?? []}
        labels={TRANSPORT_LABELS}
        color={CHART_COLORS.teal}
        loading={isLoading}
        error={isError}
      />
      <BreakdownChart
        title="Betalsätt"
        subtitle="Försäljning per betalmetod"
        data={data?.payment ?? []}
        labels={PAYMENT_LABELS}
        color={CHART_COLORS.gold}
        loading={isLoading}
        error={isError}
      />
    </div>
  );
};

export default PurchaseBreakdowns;
