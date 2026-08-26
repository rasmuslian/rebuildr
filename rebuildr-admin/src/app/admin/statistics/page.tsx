import { Divider } from "antd";
import { Suspense } from "react";

import StatisticsDashboard from "@/components/statistics/statistics-dashboard";

const StatisticsPage = () => {
  return (
    <div className="flex flex-col gap-4">
      <Divider orientation="start">
        <h3>Statistik</h3>
      </Divider>
      {/* The dashboard reads its date range from the URL, which requires a
          Suspense boundary during prerendering. */}
      <Suspense>
        <StatisticsDashboard />
      </Suspense>
    </div>
  );
};

export default StatisticsPage;
