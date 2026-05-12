"use client";

import { App, Button, Divider } from "antd";
import React from "react";
import { updateCO2Factors } from "@/queries/co2/update-co2-factors";
import { syncApproximateLocations } from "@/queries/map-pin/sync-approximate-locations";
import { useMutation } from "@tanstack/react-query";
import { CmsTestTemplateInput } from "gql/graphql";
import { testTemplates } from "@/queries/email/test-templates";

const DeveloperSetting = () => {
  const { notification } = App.useApp();
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

      <div className="flex flex-col gap-5">
        <h3>Skicka epostmeddelanden för att testa templates</h3>
        <div className="flex flex-row gap-5">
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
        </div>
      </div>
    </div>
  );
};

export default DeveloperSetting;
