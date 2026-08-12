import React from "react";
import { Divider } from "antd";
import ProductStatisticsChart from "@/components/statistics/product-statistics-chart";
import UserStatisticsChart from "@/components/statistics/user-statistics-chart";
import PurchaseStatisticsChart from "@/components/statistics/purchase-statistics-chart";
import RevenueStatisticsChart from "@/components/statistics/revenue-statistics-chart";
import AverageOrderValueStatisticsChart from "@/components/statistics/average-order-value-statistics-chart";
import ActiveListingsByCategoryChart from "@/components/statistics/active-listings-by-category-chart";
import Co2SavingsStatisticsChart from "@/components/statistics/co2-savings-statistics-chart";
import RepeatBuyerRateStatisticsChart from "@/components/statistics/repeat-buyer-rate-statistics-chart";
import PurchaseFailureRateStatisticsChart from "@/components/statistics/purchase-failure-rate-statistics-chart";
import AverageTimeToPublishStatisticsChart from "@/components/statistics/average-time-to-publish-statistics-chart";

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
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <RevenueStatisticsChart />
      </div>
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <AverageOrderValueStatisticsChart />
      </div>
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <ActiveListingsByCategoryChart />
      </div>
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <Co2SavingsStatisticsChart />
      </div>
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <RepeatBuyerRateStatisticsChart />
      </div>
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <PurchaseFailureRateStatisticsChart />
      </div>
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <AverageTimeToPublishStatisticsChart />
      </div>
    </div>
  );
};

export default StatisticsPage;
