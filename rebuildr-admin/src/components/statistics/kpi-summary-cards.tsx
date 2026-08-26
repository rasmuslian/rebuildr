"use client";

import { Alert } from "antd";

import {
  formatCo2Parts,
  formatNumberParts,
  formatPercentParts,
  formatSekParts,
} from "@/components/statistics/format";
import { useStatisticsData } from "@/components/statistics/use-statistics-data";
import StatCard from "@/components/ui/stat-card";

type KpiSummaryCardsProps = {
  data: ReturnType<typeof useStatisticsData>;
  onSelectMetric?: (metric: string) => void;
};

/**
 * Primary tiles carry a sparkline; the secondary strip stays compact so the
 * eye lands on the six numbers that describe the marketplace first.
 */
const KpiSummaryCards = ({ data, onSelectMetric }: KpiSummaryCardsProps) => {
  const { summary, sparklines } = data;

  if (summary.isError) {
    return <Alert type="error" showIcon message="Kunde inte hämta nyckeltal" />;
  }

  const kpi = summary.data;
  const loading = summary.isLoading;

  const sellThrough =
    kpi && kpi.listingsPublished.value > 0
      ? (kpi.listingsSold.value / kpi.listingsPublished.value) * 100
      : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        <StatCard
          label="Försäljning"
          value={formatSekParts(kpi?.totalSalesSek.value ?? 0)}
          definition="Summa av genomförda köp under perioden. Återbetalda köp räknas bort."
          changePercent={kpi?.totalSalesSek.changePercent}
          sparkline={sparklines.totalSalesSek}
          loading={loading}
          onClick={() => onSelectMetric?.("totalSalesSek")}
        />
        <StatCard
          label="Antal köp"
          value={formatNumberParts(kpi?.salesCount.value ?? 0)}
          definition="Genomförda köp under perioden; återbetalda räknas bort."
          changePercent={kpi?.salesCount.changePercent}
          sparkline={sparklines.salesCount}
          loading={loading}
          onClick={() => onSelectMetric?.("salesCount")}
        />
        <StatCard
          label="Snittordervärde"
          value={formatSekParts(kpi?.avgOrderValueSek.value ?? 0)}
          definition="Försäljning delat med antal betalda köp. Gratisannonser ingår inte i nämnaren."
          changePercent={kpi?.avgOrderValueSek.changePercent}
          sparkline={sparklines.avgOrderValueSek}
          loading={loading}
        />
        <StatCard
          label="Publicerade annonser"
          value={formatNumberParts(kpi?.listingsPublished.value ?? 0)}
          definition="Annonser som publicerades under perioden."
          changePercent={kpi?.listingsPublished.changePercent}
          sparkline={sparklines.listingsPublished}
          loading={loading}
          onClick={() => onSelectMetric?.("listingsPublished")}
        />
        <StatCard
          label="Aktiva användare"
          value={formatNumberParts(kpi?.activeUsers.value ?? 0)}
          definition="Unika användare som skapat annons, köpt, skickat meddelande eller besökt en annons under perioden."
          changePercent={kpi?.activeUsers.changePercent}
          loading={loading}
        />
        <StatCard
          label="Nya användare"
          value={formatNumberParts(kpi?.newUsers.value ?? 0)}
          definition="Konton som registrerades under perioden."
          changePercent={kpi?.newUsers.changePercent}
          sparkline={sparklines.newUsers}
          footnote={
            kpi ? `varav företag: ${kpi.newBusinessUsers.value}` : undefined
          }
          loading={loading}
          onClick={() => onSelectMetric?.("newUsers")}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        <StatCard
          size="compact"
          label="Sålda annonser"
          value={formatNumberParts(kpi?.listingsSold.value ?? 0)}
          definition="Unika annonser med minst ett genomfört köp."
          changePercent={kpi?.listingsSold.changePercent}
          loading={loading}
        />
        <StatCard
          size="compact"
          label="Genomförsäljning"
          value={sellThrough === null ? { value: "–" } : formatPercentParts(sellThrough)}
          definition="Sålda annonser delat med publicerade annonser under perioden."
          loading={loading}
        />
        <StatCard
          size="compact"
          label="CO₂ besparat"
          value={formatCo2Parts(kpi?.co2SavedKg.value ?? 0)}
          definition="Beräknad klimatbesparing för köpta varor, baserat på Boverkets produktionsdata."
          changePercent={kpi?.co2SavedKg.changePercent}
          loading={loading}
        />
        <StatCard
          size="compact"
          label="Aktiva annonser just nu"
          value={formatNumberParts(kpi?.activeListingsNow.value ?? 0)}
          definition="Publicerade annonser i detta ögonblick — en ögonblicksbild utan periodjämförelse."
          loading={loading}
        />
        <StatCard
          size="compact"
          label="Kommande annonser"
          value={formatNumberParts(kpi?.upcomingListingsCreated.value ?? 0)}
          definition="Annonser som publicerades som 'kommande' under perioden."
          changePercent={kpi?.upcomingListingsCreated.changePercent}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default KpiSummaryCards;
