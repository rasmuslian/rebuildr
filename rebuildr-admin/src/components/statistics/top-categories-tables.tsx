"use client";

import { useQuery } from "@tanstack/react-query";
import { Progress, Table } from "antd";
import { ColumnsType } from "antd/es/table";
import { useRouter } from "next/navigation";

import { CHART_COLORS } from "@/components/statistics/chart-theme";
import { formatNumber, formatSek } from "@/components/statistics/format";
import Panel from "@/components/ui/panel";
import { routes } from "@/lib/routes";
import {
  getTopCategories,
  TopCategoryEntry,
} from "@/queries/statistics/top-categories";

/** Share-of-total bars turn a column of numbers into a ranking you can read. */
const shareColumn = (
  key: "salesSek" | "listingCount",
  total: number,
): ColumnsType<TopCategoryEntry>[number] => ({
  title: "Andel",
  key: `${key}-share`,
  width: 120,
  render: (_, entry) => (
    <Progress
      percent={total > 0 ? Math.round((entry[key] / total) * 100) : 0}
      size="small"
      strokeColor={CHART_COLORS.primary}
      showInfo={false}
    />
  ),
});

interface TopCategoriesTablesProps {
  from: string;
  to: string;
}

const TopCategoriesTables = ({ from, to }: TopCategoriesTablesProps) => {
  const router = useRouter();
  const { data, isLoading } = useQuery({
    queryKey: ["top-categories", from, to],
    queryFn: () => getTopCategories({ from, to, limit: 5 }),
  });

  const bySales = data?.bySales ?? [];
  const byListings = data?.byListings ?? [];
  const salesTotal = bySales.reduce((sum, entry) => sum + entry.salesSek, 0);
  const listingsTotal = byListings.reduce(
    (sum, entry) => sum + entry.listingCount,
    0,
  );

  //A statistics row answers "what is behind this number", so it opens the
  //listings it counted — not the category's edit form.
  const openCategory = (entry: TopCategoryEntry) => ({
    onClick: () =>
      router.push(
        `${routes.LIST_PRODUCT}?categoryId=${entry.categoryId}` +
          `&categoryName=${encodeURIComponent(entry.categoryName)}` +
          `&publishedFrom=${from}&publishedTo=${to}`,
      ),
    className: "cursor-pointer",
  });

  const salesColumns: ColumnsType<TopCategoryEntry> = [
    { title: "Kategori", dataIndex: "categoryName" },
    {
      title: "Försäljning",
      dataIndex: "salesSek",
      align: "right",
      render: (salesSek: number) => formatSek(salesSek),
    },
    {
      title: "Antal köp",
      dataIndex: "salesCount",
      align: "right",
      render: (salesCount: number) => formatNumber(salesCount),
    },
    shareColumn("salesSek", salesTotal),
  ];

  const listingColumns: ColumnsType<TopCategoryEntry> = [
    { title: "Kategori", dataIndex: "categoryName" },
    {
      title: "Publicerade annonser",
      dataIndex: "listingCount",
      align: "right",
      render: (listingCount: number) => formatNumber(listingCount),
    },
    shareColumn("listingCount", listingsTotal),
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Panel className="flex flex-col gap-3">
        <h5 className="text-title-medium m-0">Toppkategorier – försäljning</h5>
        <Table
          size="small"
          rowKey="categoryId"
          loading={isLoading}
          pagination={false}
          columns={salesColumns}
          dataSource={bySales}
          onRow={openCategory}
        />
      </Panel>
      <Panel className="flex flex-col gap-3">
        <h5 className="text-title-medium m-0">Toppkategorier – antal annonser</h5>
        <Table
          size="small"
          rowKey="categoryId"
          loading={isLoading}
          pagination={false}
          columns={listingColumns}
          dataSource={byListings}
          onRow={openCategory}
        />
      </Panel>
    </div>
  );
};

export default TopCategoriesTables;
