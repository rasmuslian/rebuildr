import React from "react";
import { Divider } from "antd";
import ProductStatisticsChart from "@/components/statistics/product-statistics-chart";

const StatisticsPage = () => {
  return (
    <div>
      <Divider orientation="start">
        <h3>Statistik</h3>
      </Divider>
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <ProductStatisticsChart />
      </div>
    </div>
  );
};

export default StatisticsPage;
