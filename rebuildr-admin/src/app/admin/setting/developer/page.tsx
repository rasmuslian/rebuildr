"use client";

import { App, Button, Divider } from "antd";
import React from "react";
import { syncApproximateLocations } from "@/queries/map-pin/sync-approximate-locations";
import { useMutation } from "@tanstack/react-query";

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
  return (
    <div className="flex max-w-screen-lg flex-col gap-5">
      <Divider orientation="left">Utvecklargenvägar</Divider>

      <h3>Synkronisera produktplatser baserat på deras adressinformation.</h3>
      <Button
        style={{ width: 300}}
        onClick={() => syncProductLocations()}
        disabled={isSyncingLocations}
      >
        Synkronisera
      </Button>
    </div>
  );
};

export default DeveloperSetting;
