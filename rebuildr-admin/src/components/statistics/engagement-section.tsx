"use client";

import { InfoCircleOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Table, Tooltip } from "antd";
import { ColumnsType } from "antd/es/table";
import Link from "next/link";

import ProductStatusTag from "@/components/product/product-status-tag";
import { formatNumber } from "@/components/statistics/format";
import Panel from "@/components/ui/panel";
import { routes } from "@/lib/routes";
import { publicProductUrl } from "@/lib/site-url";
import {
  getTopProducts,
  TopProductEntry,
} from "@/queries/statistics/top-products";
import {
  getTopSearchTerms,
  TopSearchTermEntry,
} from "@/queries/statistics/top-search-terms";

const TOP_PRODUCTS_COLUMNS: ColumnsType<TopProductEntry> = [
  {
    title: "Annons",
    dataIndex: "title",
    //A view-count table is about what visitors saw, so the title links to the
    //public listing rather than the edit form. A real anchor rather than a row
    //handler: it survives popup blocking and supports open-in-new-tab.
    render: (title: string | null, entry) =>
      title ? (
        <a
          href={publicProductUrl(entry.productId)}
          target="_blank"
          rel="noopener noreferrer"
        >
          {title}
        </a>
      ) : (
        "(borttagen annons)"
      ),
  },
  {
    title: "Status",
    dataIndex: "status",
    width: 120,
    render: (status: string | null) => <ProductStatusTag status={status} />,
  },
  {
    title: "Visningar",
    dataIndex: "viewCount",
    align: "right",
    width: 110,
    render: (viewCount: number) => formatNumber(viewCount),
  },
];

const TOP_SEARCH_TERMS_COLUMNS: ColumnsType<TopSearchTermEntry> = [
  {
    title: "Sökterm",
    dataIndex: "term",
    //Links into the admin listing search rather than the public site: the
    //marketplace keeps its search term in memory, so a public link would load
    //the page and quietly drop the term. This answers the useful question —
    //people search for this, do we have it?
    render: (term: string) => (
      <Link href={`${routes.LIST_PRODUCT}?search=${encodeURIComponent(term)}`}>
        {term}
      </Link>
    ),
  },
  {
    title: "Antal",
    dataIndex: "count",
    align: "right",
    width: 110,
    render: (count: number) => formatNumber(count),
  },
];

interface EngagementSectionProps {
  from: string;
  to: string;
}

const EngagementSection = ({ from, to }: EngagementSectionProps) => {
  const { data: topProducts, isLoading: topProductsLoading } = useQuery({
    queryKey: ["top-products", from, to],
    queryFn: () => getTopProducts({ from, to, limit: 10 }),
  });

  const { data: topSearchTerms, isLoading: topSearchTermsLoading } = useQuery({
    queryKey: ["top-search-terms", from, to],
    queryFn: () => getTopSearchTerms({ from, to, limit: 15 }),
  });

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Panel className="flex flex-col gap-3">
        <h5 className="text-title-medium m-0 flex items-center gap-1">
          Mest visade annonser
          <Tooltip title="Detaljsidevisningar — exkluderar säljarens egna visningar, kan inkludera botar">
            <InfoCircleOutlined className="text-gray-400" />
          </Tooltip>
        </h5>
        <Table
          size="small"
          rowKey="productId"
          loading={topProductsLoading}
          pagination={false}
          columns={TOP_PRODUCTS_COLUMNS}
          dataSource={topProducts ?? []}
        />
      </Panel>
      <Panel className="flex flex-col gap-3">
        <h5 className="text-title-medium m-0">Toppsökningar</h5>
        <Table
          size="small"
          rowKey="term"
          loading={topSearchTermsLoading}
          pagination={false}
          columns={TOP_SEARCH_TERMS_COLUMNS}
          dataSource={topSearchTerms ?? []}
        />
      </Panel>
    </div>
  );
};

export default EngagementSection;
