"use client";

import { App, Button, Divider } from "antd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CmsTestTemplateInput } from "gql/graphql";
import React, { useState } from "react";

import { queryKeys } from "@/lib/query-keys";
import { updateCO2Factors } from "@/queries/co2/update-co2-factors";
import { testTemplates } from "@/queries/email/test-templates";
import { syncApproximateLocations } from "@/queries/map-pin/sync-approximate-locations";
import { backfillSearchEnrichment } from "@/queries/product/backfill-search-enrichment";
import { getSearchEnrichmentBackfillStatus } from "@/queries/product/get-search-enrichment-backfill-status";

const DeveloperSetting = () => {
  const { notification } = App.useApp();
  const queryClient = useQueryClient();
  const [
    hasStartedSearchEnrichmentBackfill,
    setHasStartedSearchEnrichmentBackfill,
  ] = useState(false);
  const { data: searchEnrichmentBackfillStatus } = useQuery({
    queryKey: [queryKeys.SEARCH_ENRICHMENT_BACKFILL_STATUS],
    queryFn: getSearchEnrichmentBackfillStatus,
    refetchInterval: (query) =>
      query.state.data?.state === "RUNNING" ? 3000 : false,
    refetchIntervalInBackground: true,
  });
  const { mutateAsync: syncProductLocations, isPending: isSyncingLocations } =
    useMutation({
      mutationFn: async () => {
        const response = await syncApproximateLocations();
        if (!response) throw new Error();
        return response;
      },
      onSuccess: () => {
        notification.success({
          message: "Platser synkroniserade",
          description: "Produktplatser har synkroniserats framgångsrikt.",
        });
      },
      onError: () => {
        notification.error({
          message: "Synkronisering misslyckades",
          description:
            "Produktplatser kunde tyvärr inte synkroniseras. Försök igen senare.",
        });
      },
    });
  const { mutateAsync: runUpdateCO2Factors, isPending: isUpdatingCO2Factors } =
    useMutation({
      mutationFn: async () => {
        const response = await updateCO2Factors();
        if (!response) throw new Error();
        return response;
      },
      onSuccess: () => {
        notification.success({
          message: "CO2 data uppdaterad",
          description: "CO2 data har uppdaterats.",
        });
      },
      onError: () => {
        notification.error({
          message: "Uppdatering misslyckades",
          description:
            "CO2 data kunde tyvärr inte uppdateras. Försök igen senare.",
        });
      },
    });
  const {
    mutateAsync: runBackfillSearchEnrichment,
    isPending: isBackfillingSearchEnrichment,
  } = useMutation({
    mutationFn: async () => {
      const response = await backfillSearchEnrichment();
      if (response === undefined) throw new Error();
      return response;
    },
    onSuccess: (status) => {
      setHasStartedSearchEnrichmentBackfill(true);
      queryClient.setQueryData(
        [queryKeys.SEARCH_ENRICHMENT_BACKFILL_STATUS],
        status,
      );
      queryClient.invalidateQueries({
        queryKey: [queryKeys.SEARCH_ENRICHMENT_BACKFILL_STATUS],
      });

      if (
        status.state === "RUNNING" &&
        status.startedAt &&
        !status.finishedAt
      ) {
        notification.info({
          message: "Backfill startad",
          description:
            "Sökalias, relaterade termer och användningsområden genereras nu i bakgrunden.",
        });
        return;
      }

      notification.info({
        message: "Backfillstatus uppdaterad",
        description:
          "En tidigare backfill kör redan eller har nyligen avslutats. Se status nedan.",
      });
    },
    onError: () => {
      notification.error({
        message: "Backfill kunde inte startas",
        description:
          "Sökmetadata kunde tyvärr inte börja fyllas på. Försök igen senare.",
      });
    },
  });
  const { mutateAsync: sendEmailTemplate, isPending: isSendingEmailTemplate } =
    useMutation({
      mutationFn: async (input: CmsTestTemplateInput) => {
        const response = await testTemplates(input);
        if (!response) throw new Error();
        return response;
      },
      onSuccess: () => {
        notification.success({
          message: "Epost skickades",
          description: `Epost med template skickades framgångsrikt`,
        });
      },
      onError: () => {
        notification.error({
          message: "Skick av epost misslyckades",
          description: "Skick av epost misslyckades",
        });
      },
    });
  const showSearchEnrichmentBackfillStatus =
    searchEnrichmentBackfillStatus?.state === "RUNNING" ||
    hasStartedSearchEnrichmentBackfill;

  return (
    <div className="flex max-w-screen-lg flex-col gap-2">
      <Divider orientation="left">Utvecklargenvägar</Divider>

      <h3>Synkronisera produktplatser baserat på deras adressinformation.</h3>
      <Button
        style={{ width: 300 }}
        onClick={() => syncProductLocations()}
        disabled={isSyncingLocations}
      >
        Synkronisera
      </Button>
      <Divider />

      <div className="flex flex-col gap-2">
        <h3>Uppdatera CO2 data</h3>
        <p>
          Hämta data från Boverket och uppdatera CO2 datan. Detta sker redan
          kontinuerligt men använd denna knapp för att manuellt uppdatera.
        </p>
        <Button
          style={{ width: 300 }}
          onClick={() => runUpdateCO2Factors()}
          disabled={isUpdatingCO2Factors}
        >
          Uppdatera CO2 data
        </Button>
      </div>
      <Divider />

      <div className="flex flex-col gap-2">
        <h3>Backfilla LLM-genererad sökmetadata</h3>
        <p>
          Fyll på sökalias, relaterade termer och användningsområden för
          produkter och kategorier. Jobbet använder endast LLM-generering. Om
          genereringen misslyckas markeras jobbet som misslyckat i stället för
          att fylla på med enklare fallback-data.
        </p>
        <Button
          style={{ width: 300 }}
          onClick={() => runBackfillSearchEnrichment()}
          disabled={isBackfillingSearchEnrichment}
        >
          Starta search backfill
        </Button>
        {showSearchEnrichmentBackfillStatus ? (
          <>
            <p>
              Status: {searchEnrichmentBackfillStatus?.state ?? "Okänd"}
              {searchEnrichmentBackfillStatus
                ? ` | Produkter: ${searchEnrichmentBackfillStatus.enrichedProducts} klara, ${searchEnrichmentBackfillStatus.failedProducts} fel, ${searchEnrichmentBackfillStatus.remainingProducts} kvar | Kategorier: ${searchEnrichmentBackfillStatus.enrichedCategories} klara, ${searchEnrichmentBackfillStatus.failedCategories} fel, ${searchEnrichmentBackfillStatus.remainingCategories} kvar`
                : ""}
            </p>
            {searchEnrichmentBackfillStatus?.currentItemId ? (
              <p>
                Bearbetar: {searchEnrichmentBackfillStatus.currentItemType}{" "}
                {searchEnrichmentBackfillStatus.currentItemName} (
                {searchEnrichmentBackfillStatus.currentItemId}) försök{" "}
                {searchEnrichmentBackfillStatus.currentAttempt ?? "?"}
                {searchEnrichmentBackfillStatus.lastProgressAt
                  ? ` | Senaste progress: ${new Date(searchEnrichmentBackfillStatus.lastProgressAt).toLocaleTimeString("sv-SE")}`
                  : ""}
              </p>
            ) : null}
            {searchEnrichmentBackfillStatus?.lastError ? (
              <p>Senaste fel: {searchEnrichmentBackfillStatus.lastError}</p>
            ) : null}
          </>
        ) : null}
      </div>
      <Divider />

      <div className="flex flex-col gap-5">
        <h3>Skicka epostmeddelanden för att testa templates</h3>
        <div className="grid grid-cols-3 gap-5">
          <Button
            style={{ width: 300 }}
            onClick={() => sendEmailTemplate({ template: "verifyEmail" })}
            disabled={isSendingEmailTemplate}
          >
            Verifiera epost
          </Button>
          <Button
            style={{ width: 300 }}
            onClick={() => sendEmailTemplate({ template: "resetPassword" })}
            disabled={isSendingEmailTemplate}
          >
            Återställ lösenord
          </Button>
          <Button
            style={{ width: 300 }}
            onClick={() => sendEmailTemplate({ template: "reportPurchase" })}
            disabled={isSendingEmailTemplate}
          >
            Rapportera köp
          </Button>
          <Button
            style={{ width: 300 }}
            onClick={() => sendEmailTemplate({ template: "reportProduct" })}
            disabled={isSendingEmailTemplate}
          >
            Rapportera produkt
          </Button>
          <Button
            style={{ width: 300 }}
            onClick={() =>
              sendEmailTemplate({ template: "sendSystemMessageEmail" })
            }
            disabled={isSendingEmailTemplate}
          >
            Mottagit systemmeddelande
          </Button>
          <Button
            style={{ width: 300 }}
            onClick={() =>
              sendEmailTemplate({ template: "sendUserMessageEmail" })
            }
            disabled={isSendingEmailTemplate}
          >
            Mottagit användarmeddelande
          </Button>
          <Button
            style={{ width: 300 }}
            onClick={() => sendEmailTemplate({ template: "activatePayouts" })}
            disabled={isSendingEmailTemplate}
          >
            Aktivera utbetalningar
          </Button>
          <Button
            style={{ width: 300 }}
            onClick={() =>
              sendEmailTemplate({
                template: "businessRegistrationNotification",
              })
            }
            disabled={isSendingEmailTemplate}
          >
            Nytt företagskonto (admin-notis)
          </Button>
          <Button
            style={{ width: 300 }}
            onClick={() => sendEmailTemplate({ template: "businessApproved" })}
            disabled={isSendingEmailTemplate}
          >
            Företagskonto godkänt
          </Button>
          <Button
            style={{ width: 300 }}
            onClick={() => sendEmailTemplate({ template: "welcomeIndividual" })}
            disabled={isSendingEmailTemplate}
          >
            Välkommen (privatperson)
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeveloperSetting;
