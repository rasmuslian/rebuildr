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
import { getPurchaseStatistics } from "@/queries/statistics/purchase-statistics";
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

const PurchaseStatisticsChart = () => {
  const [groupBy, setGroupBy] = useState<StatisticsGroupBy>("month");

  const { data, isLoading } = useQuery({
    queryKey: ["purchase-statistics", groupBy],
    queryFn: () => getPurchaseStatistics(groupBy),
  });

  const chartData =
    data?.data.map((point) => ({
      date: formatDate(point.date, groupBy),
      count: point.count,
    })) ?? [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h4 className="m-0 text-base font-medium">Köp över tid</h4>
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
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
            <Tooltip
              formatter={(value) => [value, "Köp"]}
              labelStyle={{ fontWeight: 600 }}
            />
            <Bar dataKey="count" fill="#722ed1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default PurchaseStatisticsChart;
