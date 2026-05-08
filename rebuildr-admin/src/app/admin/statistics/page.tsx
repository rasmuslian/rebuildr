import React from "react";
import { Divider } from "antd";
import ProductStatisticsChart from "@/components/statistics/product-statistics-chart";
import UserStatisticsChart from "@/components/statistics/user-statistics-chart";
import PurchaseStatisticsChart from "@/components/statistics/purchase-statistics-chart";

const StatisticsPage = () => {
  return (
    <div className="flex flex-col gap-6">
      <Divider orientation="start">
        <h3>Statistik</h3>
      </Divider>
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <ProductStatisticsChart />
      </div>
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <UserStatisticsChart />
      </div>
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <PurchaseStatisticsChart />
      </div>
    </div>
  );
};

export default StatisticsPage;
