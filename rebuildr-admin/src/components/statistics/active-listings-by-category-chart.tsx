"use client";

import React from "react";
import { Spin } from "antd";
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
import { getActiveListingsByCategoryStatistics } from "@/queries/statistics/active-listings-by-category-statistics";

const ActiveListingsByCategoryChart = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["active-listings-by-category-statistics"],
    queryFn: () => getActiveListingsByCategoryStatistics(),
  });

  const chartData =
    data?.data.map((point) => ({
      category: point.category,
      count: point.count,
    })) ?? [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h4 className="m-0 text-base font-medium">
          Aktiva annonser per kategori
        </h4>
      </div>

      {isLoading ? (
        <div className="flex h-80 items-center justify-center">
          <Spin />
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <BarChart
            data={chartData}
            margin={{ top: 8, right: 16, left: 0, bottom: 24 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="category"
              tick={{ fontSize: 12 }}
              interval={0}
              angle={-30}
              textAnchor="end"
              height={60}
            />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
            <Tooltip
              formatter={(value) => [value, "Annonser"]}
              labelStyle={{ fontWeight: 600 }}
            />
            <Bar dataKey="count" fill="#eb2f96" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default ActiveListingsByCategoryChart;
