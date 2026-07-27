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
import {
  getProductStatistics,
  ProductStatisticsGroupBy,
} from "@/queries/product/product-statistics";

const GROUP_BY_OPTIONS: { label: string; value: ProductStatisticsGroupBy }[] = [
  { label: "Dag", value: "day" },
  { label: "Vecka", value: "week" },
  { label: "Månad", value: "month" },
];

const formatDate = (date: string, groupBy: ProductStatisticsGroupBy) => {
  const d = new Date(date);
  if (groupBy === "day") {
    return d.toLocaleDateString("sv-SE", { month: "short", day: "numeric" });
  }
  if (groupBy === "week") {
    return d.toLocaleDateString("sv-SE", { month: "short", day: "numeric" });
  }
  return d.toLocaleDateString("sv-SE", { year: "numeric", month: "short" });
};

const ProductStatisticsChart = () => {
  const [groupBy, setGroupBy] = useState<ProductStatisticsGroupBy>("month");

  const { data, isLoading } = useQuery({
    queryKey: ["product-statistics", groupBy],
    queryFn: () => getProductStatistics(groupBy),
  });

  const chartData =
    data?.data.map((point) => ({
      date: formatDate(point.date, groupBy),
      count: point.count,
    })) ?? [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h4 className="m-0 text-base font-medium">Annonser skapade över tid</h4>
        <Segmented
          options={GROUP_BY_OPTIONS}
          value={groupBy}
          onChange={(value) => setGroupBy(value as ProductStatisticsGroupBy)}
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
              formatter={(value) => [value, "Produkter"]}
              labelStyle={{ fontWeight: 600 }}
            />
            <Bar dataKey="count" fill="#1677ff" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default ProductStatisticsChart;
