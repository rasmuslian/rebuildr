"use client";

import React, { useState } from "react";
import { Segmented, Spin } from "antd";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getRepeatBuyerRateStatistics } from "@/queries/statistics/repeat-buyer-rate-statistics";
import { StatisticsGroupBy } from "@/queries/statistics/user-statistics";

const GROUP_BY_OPTIONS: { label: string; value: StatisticsGroupBy }[] = [
  { label: "Dag", value: "day" },
  { label: "Vecka", value: "week" },
  { label: "Månad", value: "month" },
];

const formatDate = (date: string, groupBy: StatisticsGroupBy) => {
  const d = new Date(date);
  if (groupBy === "month") {
    return d.toLocaleDateString("sv-SE", { year: "numeric", month: "short" });
  }
  return d.toLocaleDateString("sv-SE", { month: "short", day: "numeric" });
};

const RepeatBuyerRateStatisticsChart = () => {
  const [groupBy, setGroupBy] = useState<StatisticsGroupBy>("month");

  const { data, isLoading } = useQuery({
    queryKey: ["repeat-buyer-rate-statistics", groupBy],
    queryFn: () => getRepeatBuyerRateStatistics(groupBy),
  });

  const chartData =
    data?.data.map((point) => ({
      date: formatDate(point.date, groupBy),
      percent: Math.round(point.percent * 10) / 10,
    })) ?? [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h4 className="m-0 text-base font-medium">
          Andel återkommande köpare över tid över tid
        </h4>
        <Segmented
          options={GROUP_BY_OPTIONS}
          value={groupBy}
          onChange={(value) => setGroupBy(value as StatisticsGroupBy)}
        />
      </div>

      {isLoading ? (
        <div className="flex h-80 items-center justify-center">
          <Spin />
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <BarChart
            data={chartData}
            margin={{ top: 8, right: 16, left: 0, bottom: 8 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip
              formatter={(value) => [`${value}%`, "Återkommande köpare"]}
              labelStyle={{ fontWeight: 600 }}
            />
            <Bar dataKey="percent" fill="#4a3aa7" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default RepeatBuyerRateStatisticsChart;
