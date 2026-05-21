"use client";

import React, { useState } from "react";
import { App, Button, InputNumber } from "antd";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import AdminForm from "@/components/admin-form";
import FormField from "@/components/form-field";
import { queryKeys } from "@/lib/query-keys";
import {
  Co2FactorWithDisposal,
  updateCO2Factor,
} from "@/queries/co2-factor/update-co2-factor";

type Props = {
  co2Factor: Co2FactorWithDisposal;
  onSettled: () => void;
};

const EditCO2Factor = ({ co2Factor, onSettled }: Props) => {
  const { notification } = App.useApp();
  const queryClient = useQueryClient();
  const [disposalCoefficient, setDisposalCoefficient] = useState<number>(
    co2Factor.disposalCoefficient,
  );

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const response = await updateCO2Factor({
        id: co2Factor.id,
        disposalCoefficient,
      });
      if (!response) throw new Error();
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.CATEGORIES_CO2_FACTOR],
      });
      queryClient.invalidateQueries({
        queryKey: [queryKeys.LIST_CO2_FACTORS],
      });
      notification.success({
        message: "Hurra!",
        description: "CO2 faktorn har uppdaterats.",
      });
    },
    onError: (error) => {
      notification.error({
        message: "Tyvärr!",
        description: error.message ?? "CO2 faktorn kunde inte uppdateras.",
      });
    },
    onSettled: () => onSettled(),
  });

  return (
    <AdminForm
      title="Redigera CO2-faktor"
      type="raised"
      onSubmit={(event) => {
        event.preventDefault();
        mutate();
      }}
    >
      <FormField label="Kategori">
        <div className="border-neutral_200 bg-neutral_50 rounded border px-3 py-2 text-label-medium">
          {co2Factor.categoryName}
        </div>
      </FormField>

      <FormField label="Produkt">
        <div className="border-neutral_200 bg-neutral_50 rounded border px-3 py-2 text-label-medium">
          {co2Factor.productName}
        </div>
      </FormField>

      <FormField label="Deponikoefficient">
        <InputNumber
          value={disposalCoefficient}
          onChange={(value) => setDisposalCoefficient(value ?? 0)}
          step={0.01}
          style={{ width: "100%" }}
        />
      </FormField>

      <Button type="primary" htmlType="submit" loading={isPending}>
        Spara
      </Button>
    </AdminForm>
  );
};

export default EditCO2Factor;
