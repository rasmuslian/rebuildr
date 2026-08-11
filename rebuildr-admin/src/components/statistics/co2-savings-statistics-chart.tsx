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
import { getCo2SavingsStatistics } from "@/queries/statistics/co2-savings-statistics";
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

const formatKg = (value: number) =>
  `${new Intl.NumberFormat("sv-SE", { maximumFractionDigits: 0 }).format(
    value,
  )} kg`;

const Co2SavingsStatisticsChart = () => {
  const [groupBy, setGroupBy] = useState<StatisticsGroupBy>("month");

  const { data, isLoading } = useQuery({
    queryKey: ["co2-savings-statistics", groupBy],
    queryFn: () => getCo2SavingsStatistics(groupBy),
  });

  const chartData =
    data?.data.map((point) => ({
      date: formatDate(point.date, groupBy),
      total: point.total,
    })) ?? [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h4 className="m-0 text-base font-medium">CO2-besparing över tid</h4>
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
            <YAxis tick={{ fontSize: 12 }} tickFormatter={formatKg} />
            <Tooltip
              formatter={(value) => [formatKg(Number(value)), "CO2-besparing"]}
              labelStyle={{ fontWeight: 600 }}
            />
            <Bar dataKey="total" fill="#008300" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default Co2SavingsStatisticsChart;
