"use client";

import React, { useMemo, useState } from "react";
import { App, Button, Select } from "antd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Category, CmsUpdateCategoryInput } from "gql/graphql";
import AdminForm from "@/components/admin-form";
import FormField from "@/components/form-field";
import { queryKeys } from "@/lib/query-keys";
import { listCo2Factors } from "@/queries/co2-factor/list-co2-factors";
import { updateCategory } from "@/queries/category/update-category";

type Props = {
  category: Category;
  onSettled: () => void;
};

const EditCO2Relation = ({ category, onSettled }: Props) => {
  const { notification } = App.useApp();
  const queryClient = useQueryClient();
  const [selectedCo2FactorId, setSelectedCo2FactorId] = useState<
    string | undefined
  >(category.co2Factor?.id ?? undefined);

  const { data: co2Factors = [], isLoading } = useQuery({
    queryKey: [queryKeys.LIST_CO2_FACTORS],
    queryFn: listCo2Factors,
  });

  const options = useMemo(
    () =>
      co2Factors.map((factor) => ({
        label: `${factor.coefficient} - ${factor.categoryName} - ${factor.productName}`,
        value: factor.id,
      })),
    [co2Factors],
  );

  const { mutate, isPending } = useMutation({
    mutationFn: async (input: CmsUpdateCategoryInput) => {
      const response = await updateCategory(input);
      if (!response) throw new Error();
      return response;
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.CATEGORIES_CO2_FACTOR],
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

  const onSubmit = async () => {
    const updatedCategory: CmsUpdateCategoryInput = {
      id: category.id,
      co2FactorId: selectedCo2FactorId ?? null,
    };

    mutate(updatedCategory);
  };

  return (
    <AdminForm
      title="Redigera CO2-faktor"
      type="raised"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <FormField label="Kategori">
        <div className="border-neutral_200 bg-neutral_50 rounded border px-3 py-2 text-label-medium">
          {category.name}
        </div>
      </FormField>

      <FormField label="CO2 faktor">
        <Select
          showSearch
          loading={isLoading}
          optionFilterProp="label"
          placeholder="Välj CO2 faktor ..."
          value={isLoading ? undefined : selectedCo2FactorId}
          options={options}
          onChange={(value) => setSelectedCo2FactorId(value)}
          allowClear
        />
      </FormField>

      <Button type="primary" htmlType="submit" loading={isPending}>
        Spara
      </Button>
    </AdminForm>
  );
};

export default EditCO2Relation;
