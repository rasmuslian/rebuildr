import React from "react";
import { Divider } from "antd";
import RevenueStatisticsChart from "@/components/statistics/revenue-statistics-chart";
import ProductStatisticsChart from "@/components/statistics/product-statistics-chart";
import GoToStatisticsButton from "@/components/statistics/go-to-statistics-button";

const AdminPage = async () => {
  return (
    <div className="flex flex-col gap-6">
      <Divider orientation="start">
        <h3>Välkommen till Rebuildr admin</h3>
      </Divider>
      <div className="flex justify-end">
        <GoToStatisticsButton />
      </div>
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <RevenueStatisticsChart />
      </div>
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <ProductStatisticsChart />
      </div>
    </div>
  );
};

export default AdminPage;
