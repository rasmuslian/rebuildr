"use client";

import { InfoCircleOutlined } from "@ant-design/icons";
import { Alert, Empty, Tooltip } from "antd";
import { PropsWithChildren, ReactNode } from "react";
import { twMerge } from "tailwind-merge";

import Panel from "@/components/ui/panel";

type ChartCardProps = PropsWithChildren<{
  title: string;
  subtitle?: string;
  /** Plain-language explanation shown behind an info icon next to the title. */
  hint?: string;
  /** Right-aligned controls: granularity toggles, filters, export. */
  toolbar?: ReactNode;
  loading?: boolean;
  error?: boolean;
  /** Renders the empty state instead of children. */
  isEmpty?: boolean;
  emptyText?: string;
  /** Plot height in px — keeps skeleton and chart the same size, so no jump. */
  height?: number;
  className?: string;
}>;

const ChartCard = ({
  title,
  subtitle,
  hint,
  toolbar,
  loading,
  error,
  isEmpty,
  emptyText = "Ingen data för perioden",
  height = 300,
  children,
  className,
}: ChartCardProps) => (
  <Panel className={twMerge("flex flex-col gap-4", className)}>
    <div className="flex flex-wrap items-start justify-between gap-2">
      <div className="flex flex-col gap-0.5">
        <h5 className="text-title-medium m-0 flex items-center gap-1">
          {title}
          {hint && (
            <Tooltip title={hint}>
              <InfoCircleOutlined className="text-gray-400" />
            </Tooltip>
          )}
        </h5>
        {subtitle && (
          <span className="text-body-small text-gray-600">{subtitle}</span>
        )}
      </div>
      {toolbar}
    </div>

    <div style={{ height }} className="w-full">
      {error ? (
        <Alert type="error" showIcon message="Kunde inte hämta data" />
      ) : loading ? (
        <div className="bg-neutrals_200/60 h-full w-full animate-pulse rounded" />
      ) : isEmpty ? (
        <div className="flex h-full items-center justify-center">
          <Empty description={emptyText} />
        </div>
      ) : (
        children
      )}
    </div>
  </Panel>
);

export default ChartCard;
