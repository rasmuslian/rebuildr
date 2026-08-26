"use client";

import { DatePicker, Segmented, Tabs } from "antd";
import dayjs, { Dayjs } from "dayjs";

import { GroupBy } from "@/components/statistics/chart-theme";
import Co2SavingsChart from "@/components/statistics/co2-savings-chart";
import EngagementSection from "@/components/statistics/engagement-section";
import KpiDrawer, {
  DrawerMetric,
  DRAWER_METRICS,
} from "@/components/statistics/kpi-drawer";
import KpiSummaryCards from "@/components/statistics/kpi-summary-cards";
import PriceDistribution from "@/components/statistics/price-distribution";
import ProductStatisticsChart from "@/components/statistics/product-statistics-chart";
import PurchaseBreakdowns from "@/components/statistics/purchase-breakdowns";
import PurchaseFailureRateChart from "@/components/statistics/purchase-failure-rate-chart";
import RepeatBuyerRateChart from "@/components/statistics/repeat-buyer-rate-chart";
import ReviewStats from "@/components/statistics/review-stats";
import SalesTrendChart from "@/components/statistics/sales-trend-chart";
import TimeToSellChart from "@/components/statistics/time-to-sell-chart";
import TopCategoriesTables from "@/components/statistics/top-categories-tables";
import TrafficSection from "@/components/statistics/traffic-section";
import { useStatisticsData } from "@/components/statistics/use-statistics-data";
import UsersByCityTable from "@/components/statistics/users-by-city-table";
import UserStatisticsChart from "@/components/statistics/user-statistics-chart";
import DashboardSection from "@/components/ui/dashboard-section";
import { useUrlState } from "@/hooks/use-url-state";

// Data before this date is unreliable (backfilled publishedAt).
const DATA_START = dayjs("2026-02-18");

const clampToDataStart = (date: Dayjs) =>
  date.isBefore(DATA_START, "day") ? DATA_START : date;

const DEFAULTS = {
  tab: "overview",
  from: dayjs().subtract(29, "day").format("YYYY-MM-DD"),
  to: dayjs().format("YYYY-MM-DD"),
  groupBy: "DAY" as string,
  drawer: "",
};

const StatisticsDashboard = () => {
  const [urlState, setUrlState] = useUrlState(DEFAULTS);

  const from = urlState.from;
  const to = urlState.to;
  const groupBy = urlState.groupBy as GroupBy;
  const range: [Dayjs, Dayjs] = [dayjs(from), dayjs(to)];

  const data = useStatisticsData({ from, to, groupBy });

  const drawerMetric =
    urlState.drawer && urlState.drawer in DRAWER_METRICS
      ? (urlState.drawer as DrawerMetric)
      : null;

  //The drawer charts the same series the tiles already read from.
  const drawerSeries = (() => {
    if (!drawerMetric) return [];
    const purchasePoints = data.purchases.data?.data ?? [];
    switch (drawerMetric) {
      case "totalSalesSek":
        return purchasePoints.map((p) => ({
          date: p.date,
          value: p.gmvSek ?? 0,
        }));
      case "salesCount":
        return purchasePoints.map((p) => ({ date: p.date, value: p.count }));
      case "listingsPublished":
        return (data.products.data?.data ?? []).map((p) => ({
          date: p.date,
          value: p.count,
        }));
      case "newUsers":
        return (data.users.data?.data ?? []).map((p) => ({
          date: p.date,
          value: p.count,
        }));
    }
  })();

  const presets: { label: string; value: [Dayjs, Dayjs] }[] = [
    { label: "Idag", value: [dayjs(), dayjs()] },
    { label: "Senaste 7 dagarna", value: [dayjs().subtract(6, "day"), dayjs()] },
    {
      label: "Senaste 30 dagarna",
      value: [dayjs().subtract(29, "day"), dayjs()],
    },
    {
      label: "Denna månaden",
      value: [clampToDataStart(dayjs().startOf("month")), dayjs()],
    },
    {
      label: "Detta året",
      value: [clampToDataStart(dayjs().startOf("year")), dayjs()],
    },
    { label: "Hela tiden", value: [DATA_START, dayjs()] },
  ];

  const seriesState = {
    loading: data.purchases.isLoading,
    error: data.purchases.isError,
  };

  const tabs = [
    {
      key: "overview",
      label: "Översikt",
      children: (
        <div className="flex flex-col gap-6">
          <KpiSummaryCards
            data={data}
            onSelectMetric={(metric) => setUrlState({ drawer: metric })}
          />
          <SalesTrendChart
            data={data.purchases.data?.data ?? []}
            groupBy={groupBy}
            {...seriesState}
          />
          <DashboardSection title="Hållbarhet">
            <Co2SavingsChart from={from} to={to} groupBy={groupBy} />
          </DashboardSection>
          <DashboardSection title="Toppkategorier">
            <TopCategoriesTables from={from} to={to} />
          </DashboardSection>
        </div>
      ),
    },
    {
      key: "sales",
      label: "Försäljning",
      children: (
        <div className="flex flex-col gap-6">
          <SalesTrendChart
            data={data.purchases.data?.data ?? []}
            groupBy={groupBy}
            height={360}
            {...seriesState}
          />
          <DashboardSection title="Hur snabbt säljer annonserna?">
            <TimeToSellChart from={from} to={to} groupBy={groupBy} />
          </DashboardSection>
          <DashboardSection title="Betalning och leverans">
            <PurchaseBreakdowns from={from} to={to} />
          </DashboardSection>
          <DashboardSection title="Köpkvalitet & lojalitet">
            <div className="grid gap-4 lg:grid-cols-2">
              <PurchaseFailureRateChart
                from={from}
                to={to}
                groupBy={groupBy}
              />
              <RepeatBuyerRateChart from={from} to={to} groupBy={groupBy} />
            </div>
          </DashboardSection>
          <DashboardSection title="Omdömen">
            <ReviewStats from={from} to={to} groupBy={groupBy} />
          </DashboardSection>
          <DashboardSection title="Toppkategorier">
            <TopCategoriesTables from={from} to={to} />
          </DashboardSection>
        </div>
      ),
    },
    {
      key: "listings",
      label: "Annonser",
      children: (
        <div className="flex flex-col gap-6">
          <ProductStatisticsChart from={from} to={to} groupBy={groupBy} />
          <DashboardSection title="Prissättning">
            <PriceDistribution from={from} to={to} />
          </DashboardSection>
          <DashboardSection title="Engagemang">
            <EngagementSection from={from} to={to} />
          </DashboardSection>
        </div>
      ),
    },
    {
      key: "users",
      label: "Användare",
      children: (
        <div className="flex flex-col gap-6">
          <UserStatisticsChart from={from} to={to} groupBy={groupBy} />
          <DashboardSection
            title="Geografi"
            description="Registrerade användare per stad (hela tiden)"
          >
            <UsersByCityTable />
          </DashboardSection>
        </div>
      ),
    },
    {
      key: "traffic",
      label: "Trafik",
      children: <TrafficSection from={from} to={to} />,
    },
  ];

  return (
    <div className="mx-auto flex w-full max-w-screen-2xl flex-col gap-4">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Segmented
          value={groupBy}
          onChange={(value) => setUrlState({ groupBy: value as string })}
          options={[
            { label: "Dag", value: "DAY" },
            { label: "Vecka", value: "WEEK" },
            { label: "Månad", value: "MONTH" },
          ]}
        />
        <DatePicker.RangePicker
          allowClear={false}
          value={range}
          presets={presets}
          disabledDate={(current) =>
            current.isAfter(dayjs(), "day") || current.isBefore(DATA_START, "day")
          }
          onChange={(dates) => {
            if (dates?.[0] && dates[1]) {
              setUrlState({
                from: dates[0].format("YYYY-MM-DD"),
                to: dates[1].format("YYYY-MM-DD"),
              });
            }
          }}
        />
      </div>

      <Tabs
        activeKey={urlState.tab}
        onChange={(key) => setUrlState({ tab: key })}
        //Charts cannot measure themselves inside a hidden pane, and the
        //shared series live at page level anyway, so nothing is refetched.
        destroyInactiveTabPane
        items={tabs}
      />

      <KpiDrawer
        metric={drawerMetric}
        onClose={() => setUrlState({ drawer: "" })}
        from={from}
        to={to}
        groupBy={groupBy}
        kpi={drawerMetric ? data.summary.data?.[drawerMetric] : undefined}
        series={drawerSeries}
      />
    </div>
  );
};

export default StatisticsDashboard;
