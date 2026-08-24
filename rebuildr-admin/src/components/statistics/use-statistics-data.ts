"use client";

import { useQuery } from "@tanstack/react-query";

import { GroupBy } from "@/components/statistics/chart-theme";
import { getProductStatistics } from "@/queries/product/product-statistics";
import { getKpiSummary } from "@/queries/statistics/kpi-summary";
import { getPurchaseStatistics } from "@/queries/statistics/purchase-statistics";
import { getUserStatistics } from "@/queries/statistics/user-statistics";

export type StatisticsRange = { from: string; to: string; groupBy: GroupBy };

const toLegacyGroupBy = (groupBy: GroupBy) =>
  groupBy.toLowerCase() as "day" | "week" | "month";

/**
 * One fetch per series for the whole page. The tabs and the KPI sparklines
 * read from these, so switching tabs costs nothing and the sparklines need no
 * endpoint of their own.
 */
export const useStatisticsData = ({ from, to, groupBy }: StatisticsRange) => {
  const summary = useQuery({
    queryKey: ["kpi-summary", from, to],
    queryFn: () => getKpiSummary({ from, to }),
  });

  const purchases = useQuery({
    queryKey: ["purchase-statistics", groupBy, from, to],
    queryFn: () => getPurchaseStatistics(toLegacyGroupBy(groupBy), from, to),
  });

  const products = useQuery({
    queryKey: ["product-statistics", groupBy, from, to],
    queryFn: () => getProductStatistics(toLegacyGroupBy(groupBy), from, to),
  });

  const users = useQuery({
    queryKey: ["user-statistics", groupBy, from, to],
    queryFn: () => getUserStatistics(toLegacyGroupBy(groupBy), from, to),
  });

  const purchasePoints = purchases.data?.data ?? [];

  return {
    summary,
    purchases,
    products,
    users,
    /** Sparkline series derived from data already on the page. */
    sparklines: {
      totalSalesSek: purchasePoints.map((point) => point.gmvSek ?? 0),
      salesCount: purchasePoints.map((point) => point.count),
      avgOrderValueSek: purchasePoints.map((point) =>
        point.count > 0 ? (point.gmvSek ?? 0) / point.count : 0,
      ),
      listingsPublished: (products.data?.data ?? []).map((point) => point.count),
      newUsers: (users.data?.data ?? []).map((point) => point.count),
    },
  };
};
