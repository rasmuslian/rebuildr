"use client";

import { useQuery } from "@tanstack/react-query";
import { Drawer, Empty, Table } from "antd";
import { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import ProductStatusTag from "@/components/product/product-status-tag";
import {
  axisProps,
  barProps,
  CHART_COLORS,
  CHART_MARGIN,
  formatChartDate,
  gridProps,
  GroupBy,
  tooltipFormatter,
  tooltipProps,
} from "@/components/statistics/chart-theme";
import {
  formatCompact,
  formatNumber,
  formatSek,
} from "@/components/statistics/format";
import DeltaChip from "@/components/ui/delta-chip";
import { routes } from "@/lib/routes";
import {
  ContributorProduct,
  getPublishedProducts,
} from "@/queries/statistics/kpi-contributors";
import { KpiValue } from "@/queries/statistics/kpi-summary";

/** Metrics that can be opened; each knows how to describe and chart itself. */
export type DrawerMetric =
  | "totalSalesSek"
  | "salesCount"
  | "listingsPublished"
  | "newUsers";

type MetricConfig = {
  title: string;
  definition: string;
  format: (value: number) => string;
  seriesLabel: string;
};

export const DRAWER_METRICS: Record<DrawerMetric, MetricConfig> = {
  totalSalesSek: {
    title: "Försäljning",
    definition:
      "Summa av genomförda köp under perioden. Återbetalda köp räknas bort.",
    format: formatSek,
    seriesLabel: "Försäljning",
  },
  salesCount: {
    title: "Antal köp",
    definition: "Genomförda köp under perioden; återbetalda räknas bort.",
    format: formatNumber,
    seriesLabel: "Antal köp",
  },
  listingsPublished: {
    title: "Publicerade annonser",
    definition: "Annonser som publicerades under perioden.",
    format: formatNumber,
    seriesLabel: "Annonser",
  },
  newUsers: {
    title: "Nya användare",
    definition: "Konton som registrerades under perioden.",
    format: formatNumber,
    seriesLabel: "Användare",
  },
};

const PRODUCT_COLUMNS: ColumnsType<ContributorProduct> = [
  { title: "Annons", dataIndex: "title" },
  {
    title: "Kategori",
    dataIndex: "categoryName",
    render: (name: string | null) => name ?? "–",
  },
  {
    title: "Status",
    dataIndex: "status",
    width: 110,
    render: (status: string) => <ProductStatusTag status={status} />,
  },
  {
    title: "Publicerad",
    dataIndex: "publishedAt",
    width: 120,
    render: (publishedAt: string | null) =>
      publishedAt ? dayjs(publishedAt).format("YYYY-MM-DD") : "–",
  },
  {
    title: "Pris",
    dataIndex: "price",
    align: "right",
    width: 110,
    //Already in kronor: the product API converts from öre on the way out,
    //unlike the statistics queries which read the raw column.
    render: (price: number) => formatSek(price),
  },
];

type KpiDrawerProps = {
  metric: DrawerMetric | null;
  onClose: () => void;
  from: string;
  to: string;
  groupBy: GroupBy;
  kpi?: KpiValue;
  /** Period series for the metric, already loaded by the dashboard. */
  series: { date: string; value: number }[];
};

/**
 * Detail view behind a KPI tile: the same number over time, plus the rows
 * that make it up and a link into the full list.
 */
const KpiDrawer = ({
  metric,
  onClose,
  from,
  to,
  groupBy,
  kpi,
  series,
}: KpiDrawerProps) => {
  const config = metric ? DRAWER_METRICS[metric] : null;
  const showsProducts = metric === "listingsPublished";

  const { data: contributors, isLoading } = useQuery({
    queryKey: ["kpi-contributors", metric, from, to],
    queryFn: () => getPublishedProducts({ from, to }),
    enabled: showsProducts && Boolean(metric),
  });

  const chartData = series.map((point) => ({
    date: formatChartDate(point.date, groupBy),
    value: point.value,
  }));

  return (
    <Drawer
      open={Boolean(metric)}
      onClose={onClose}
      width={720}
      title={config?.title ?? ""}
      destroyOnClose
    >
      {config && (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <p className="text-body-small m-0 text-gray-600">
              {config.definition}
            </p>
            <div className="flex items-baseline gap-3">
              <span className="text-display-small tabular-nums">
                {config.format(kpi?.value ?? 0)}
              </span>
              <DeltaChip changePercent={kpi?.changePercent} />
            </div>
            <span className="text-label-medium text-gray-500">
              {from} – {to}
              {kpi?.previousValue != null &&
                ` · föregående period: ${config.format(kpi.previousValue)}`}
            </span>
          </div>

          <div className="h-64 w-full">
            {chartData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={CHART_MARGIN}>
                  <CartesianGrid {...gridProps} />
                  <XAxis dataKey="date" {...axisProps} />
                  <YAxis
                    {...axisProps}
                    width={56}
                    tickFormatter={formatCompact}
                  />
                  <Tooltip
                    {...tooltipProps}
                    formatter={tooltipFormatter(
                      config.format,
                      config.seriesLabel,
                    )}
                  />
                  <Bar
                    dataKey="value"
                    fill={CHART_COLORS.primary}
                    {...barProps}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Empty description="Ingen data för perioden" />
            )}
          </div>

          {showsProducts && (
            <div className="flex flex-col gap-2">
              <div className="flex items-baseline justify-between">
                <h5 className="text-title-medium m-0">Annonser i perioden</h5>
                <Link
                  className="text-label-large"
                  href={`${routes.LIST_PRODUCT}?publishedFrom=${from}&publishedTo=${to}`}
                >
                  Visa alla ({formatNumber(contributors?.total ?? 0)}) →
                </Link>
              </div>
              <Table
                size="small"
                rowKey="id"
                loading={isLoading}
                pagination={false}
                columns={PRODUCT_COLUMNS}
                dataSource={contributors?.products ?? []}
              />
            </div>
          )}
        </div>
      )}
    </Drawer>
  );
};

export default KpiDrawer;
