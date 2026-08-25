"use client";

import { StarFilled } from "@ant-design/icons";
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
  gridProps,
  tooltipFormatter,
  tooltipProps,
} from "@/components/statistics/chart-theme";
import { formatNumber } from "@/components/statistics/format";
import ChartCard from "@/components/ui/chart-card";
import StatCard from "@/components/ui/stat-card";
import { getReviewStats } from "@/queries/statistics/insights";

const oneDecimal = new Intl.NumberFormat("sv-SE", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

interface ReviewStatsProps {
  from: string;
  to: string;
  groupBy: "DAY" | "WEEK" | "MONTH";
}

const ReviewStats = ({ from, to, groupBy }: ReviewStatsProps) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["review-stats", from, to, groupBy],
    queryFn: () => getReviewStats({ from, to, groupBy }),
  });

  const distribution = (data?.distribution ?? []).map((entry) => ({
    name: `${entry.stars}★`,
    count: entry.count,
  }));

  return (
    <div className="grid gap-4 md:grid-cols-[minmax(0,16rem)_1fr]">
      <div className="flex flex-col gap-4">
        <StatCard
          size="compact"
          label="Snittbetyg"
          value={{
            value: data ? oneDecimal.format(data.average) : "–",
            unit: "av 5",
          }}
          definition="Genomsnittligt betyg på omdömen skrivna under perioden."
          loading={isLoading}
        />
        <StatCard
          size="compact"
          label="Antal omdömen"
          value={{ value: formatNumber(data?.count ?? 0) }}
          definition="Omdömen skrivna under perioden. Ett köp kan ge ett omdöme från vardera parten."
          loading={isLoading}
        />
        {data && data.count > 0 && (
          <div className="text-label-medium flex items-center gap-1 px-1 text-gray-600">
            <StarFilled style={{ color: CHART_COLORS.gold }} />
            {oneDecimal.format(data.average)} i snitt på{" "}
            {formatNumber(data.count)} omdömen
          </div>
        )}
      </div>

      <ChartCard
        title="Betygsfördelning"
        subtitle="Antal omdömen per betyg"
        loading={isLoading}
        error={isError}
        isEmpty={!data?.count}
        height={260}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={distribution} margin={CHART_MARGIN}>
            <CartesianGrid {...gridProps} />
            <XAxis dataKey="name" {...axisProps} />
            <YAxis allowDecimals={false} {...axisProps} width={48} />
            <Tooltip
              {...tooltipProps}
              formatter={tooltipFormatter(formatNumber, "Omdömen")}
            />
            <Bar dataKey="count" fill={CHART_COLORS.gold} {...barProps} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
};

export default ReviewStats;
