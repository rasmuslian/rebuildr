"use client";

import { useQuery } from "@tanstack/react-query";
import { Alert, Table } from "antd";
import { ColumnsType } from "antd/es/table";

import { formatNumberParts } from "@/components/statistics/format";
import DashboardSection from "@/components/ui/dashboard-section";
import Panel from "@/components/ui/panel";
import StatCard from "@/components/ui/stat-card";
import {
  getTrafficStats,
  TrafficEntry,
} from "@/queries/statistics/traffic-stats";

const sessionsColumn = (title: string): ColumnsType<TrafficEntry> => [
  { title, dataIndex: "name" },
  {
    title: "Sessioner",
    dataIndex: "sessions",
    align: "right",
    width: 110,
    render: (sessions: number) => formatNumberParts(sessions).value,
  },
];

const TrafficTable = ({
  title,
  columnTitle,
  data,
  loading,
}: {
  title: string;
  columnTitle: string;
  data: TrafficEntry[];
  loading: boolean;
}) => (
  <Panel className="flex flex-col gap-3">
    <h5 className="text-title-medium m-0">{title}</h5>
    <Table
      size="small"
      rowKey="name"
      loading={loading}
      pagination={false}
      columns={sessionsColumn(columnTitle)}
      dataSource={data}
    />
  </Panel>
);

interface TrafficSectionProps {
  from: string;
  to: string;
}

const TrafficSection = ({ from, to }: TrafficSectionProps) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["traffic-stats", from, to],
    queryFn: () => getTrafficStats({ from, to }),
  });

  //A null payload means Google Analytics is not configured for this
  //environment — that is a setup state, not an error.
  if (!isLoading && !isError && !data) {
    return (
      <Alert
        type="info"
        showIcon
        message="Trafikdata är inte tillgänglig"
        description="Google Analytics är inte konfigurerat för den här miljön."
      />
    );
  }

  return (
    <DashboardSection
      title="Trafik"
      description="Webbtrafik från Google Analytics — appanvändning ingår inte"
      hint="Sessioner = antal besök (en person kan göra flera). Användare = unika besökare. Sidvisningar = totalt antal öppnade sidor. Endast besökare som godkänt cookies räknas."
    >
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            size="compact"
            label="Sessioner"
            value={formatNumberParts(data?.sessions ?? 0)}
            loading={isLoading}
          />
          <StatCard
            size="compact"
            label="Användare"
            value={formatNumberParts(data?.totalUsers ?? 0)}
            loading={isLoading}
          />
          <StatCard
            size="compact"
            label="Sidvisningar"
            value={formatNumberParts(data?.pageViews ?? 0)}
            loading={isLoading}
          />
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <TrafficTable
            title="Toppkällor"
            columnTitle="Källa"
            data={data?.topSources ?? []}
            loading={isLoading}
          />
          <TrafficTable
            title="Landningssidor"
            columnTitle="Sida"
            data={data?.topLandingPages ?? []}
            loading={isLoading}
          />
          <TrafficTable
            title="Toppstäder (Sverige)"
            columnTitle="Stad"
            data={data?.topCities ?? []}
            loading={isLoading}
          />
        </div>
      </div>
    </DashboardSection>
  );
};

export default TrafficSection;
