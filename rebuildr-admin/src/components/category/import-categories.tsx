"use client";

import { InboxOutlined } from "@ant-design/icons";
import { App, Button, Checkbox, Input, Table, Upload } from "antd";
import type { UploadProps } from "antd";
import { MeasurementTypeEnum } from "gql/graphql";
import React, { useMemo, useState } from "react";
import * as XLSX from "xlsx";

import SelectBrands from "@/components/brand/select-brands";
import SelectRootCategory from "@/components/category/select-root-category";
import { measurements } from "@/constants/measurements";
import { revalidate } from "@/actions/revalidate";
import { routes } from "@/lib/routes";
import {
  analyzeCategoryImport,
  CategoryImportSuggestion,
  createCategories,
} from "@/queries/category/import-categories";

const MAX_ROWS = 1000;
const MAX_CELL_LENGTH = 500;

const ImportCategories = () => {
  const { notification } = App.useApp();
  const [suggestions, setSuggestions] = useState<CategoryImportSuggestion[]>(
    [],
  );
  const [excluded, setExcluded] = useState<string[]>([]);
  const [selected, setSelected] = useState<React.Key[]>([]);
  const [loading, setLoading] = useState(false);

  const analyze = async (rows: string[]) => {
    setLoading(true);
    try {
      const result = await analyzeCategoryImport(rows);
      if (!result) throw new Error();
      setSuggestions(result.suggestions);
      setExcluded(result.excluded);
      setSelected(result.suggestions.map((row) => row.clientId));
    } catch {
      notification.error({ message: "Kategorierna kunde inte analyseras." });
    } finally {
      setLoading(false);
    }
  };

  const beforeUpload: UploadProps["beforeUpload"] = async (file) => {
    if (!/\.(csv|xlsx)$/i.test(file.name)) {
      notification.error({ message: "Välj en CSV- eller XLSX-fil." });
      return Upload.LIST_IGNORE;
    }

    try {
      const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
      const rows = workbook.SheetNames.flatMap((sheetName) => {
        const data = XLSX.utils.sheet_to_json<Record<string, unknown>>(
          workbook.Sheets[sheetName],
          { defval: "" },
        );
        return data.map(
          (row) =>
            `${sheetName}: ${JSON.stringify(
              Object.fromEntries(
                Object.entries(row).map(([key, value]) => [
                  key.slice(0, MAX_CELL_LENGTH),
                  String(value).slice(0, MAX_CELL_LENGTH),
                ]),
              ),
            )}`,
        );
      })
        .filter((row) => row.trim())
        .slice(0, MAX_ROWS);

      if (!rows.length) throw new Error("Filen saknar tabellinnehåll.");
      setSuggestions([]);
      setExcluded([]);
      await analyze(rows);
    } catch (error) {
      notification.error({
        message: "Filen kunde inte läsas",
        description: error instanceof Error ? error.message : undefined,
      });
    }
    return false;
  };

  const update = (
    clientId: string,
    patch: Partial<CategoryImportSuggestion>,
  ) => {
    setSuggestions((current) =>
      current.map((row) =>
        row.clientId === clientId ? { ...row, ...patch } : row,
      ),
    );
  };

  const draftRootOptions = useMemo(
    () =>
      suggestions
        .filter((row) => !row.parentId && !row.parentClientId)
        .map((row) => ({ label: `${row.name} (ny)`, value: row.clientId })),
    [suggestions],
  );

  const create = async () => {
    setLoading(true);
    try {
      const result = await createCategories(
        suggestions.filter((suggestion) =>
          selected.includes(suggestion.clientId),
        ),
      );
      if (!result) throw new Error();
      const skipped = result.results.filter((row) => row.skippedReason).length;
      notification.success({
        message: "Kategorierna har skapats.",
        description: skipped
          ? `${skipped} rader hoppades över som dubbletter.`
          : undefined,
      });
      await revalidate(routes.LIST_CATEGORY);
      setSuggestions([]);
      setSelected([]);
    } catch {
      notification.error({ message: "Kategorierna kunde inte skapas." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-semibold">Importera kategorier</h1>
        <p>
          Ladda upp CSV eller XLSX. Filen analyseras automatiskt och endast nya
          kategorier föreslås.
        </p>
      </div>
      {!suggestions.length && (
        <Upload.Dragger
          accept=".csv,.xlsx"
          maxCount={1}
          beforeUpload={beforeUpload}
          disabled={loading}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">
            {loading
              ? "Analyserar filen ..."
              : "Ladda upp en CSV- eller XLSX-fil"}
          </p>
        </Upload.Dragger>
      )}

      {!!excluded.length && (
        <div className="rounded border border-yellow-300 bg-yellow-50 p-3">
          <strong>Uteslutna dubbletter</strong>
          <ul>
            {excluded.map((reason, index) => (
              <li key={index}>{reason}</li>
            ))}
          </ul>
        </div>
      )}

      {!!suggestions.length && (
        <>
          <Table
            rowKey="clientId"
            pagination={false}
            rowSelection={{ selectedRowKeys: selected, onChange: setSelected }}
            dataSource={suggestions}
            expandable={{
              expandedRowRender: (row) => {
                const parentValue = row.parentId ?? row.parentClientId;
                return (
                  <div className="grid max-w-4xl grid-cols-1 gap-4 p-2 md:grid-cols-2">
                    <label className="flex flex-col gap-1">
                      <span className="font-medium">Namn</span>
                      <Input
                        value={row.name}
                        onChange={(event) =>
                          update(row.clientId, { name: event.target.value })
                        }
                      />
                    </label>
                    <label className="flex flex-col gap-1">
                      <span className="font-medium">Huvudkategori</span>
                      <SelectRootCategory
                        value={parentValue}
                        additionalOptions={draftRootOptions.filter(
                          (option) => option.value !== row.clientId,
                        )}
                        onChange={(parent) =>
                          update(
                            row.clientId,
                            parent?.startsWith("ai-")
                              ? { parentId: undefined, parentClientId: parent }
                              : {
                                  parentId: parent,
                                  parentClientId: undefined,
                                },
                          )
                        }
                      />
                    </label>
                    <label className="flex flex-col gap-1 md:col-span-2">
                      <span className="font-medium">Beskrivning</span>
                      <Input.TextArea
                        rows={3}
                        value={row.description}
                        onChange={(event) =>
                          update(row.clientId, {
                            description: event.target.value,
                          })
                        }
                      />
                    </label>
                    <label className="flex flex-col gap-1">
                      <span className="font-medium">Varumärken</span>
                      <SelectBrands
                        value={row.brandIds ?? []}
                        onChange={(brandIds) =>
                          update(row.clientId, { brandIds })
                        }
                      />
                    </label>
                    <label className="flex flex-col gap-1">
                      <span className="font-medium">Sökalias</span>
                      <Input
                        value={row.searchAliases.join(", ")}
                        onChange={(event) =>
                          update(row.clientId, {
                            searchAliases: event.target.value
                              .split(",")
                              .map((term) => term.trim())
                              .filter(Boolean),
                          })
                        }
                      />
                    </label>
                    <div className="flex flex-col gap-2 md:col-span-2">
                      <Checkbox
                        checked={row.inSeason}
                        onChange={(event) =>
                          update(row.clientId, {
                            inSeason: event.target.checked,
                          })
                        }
                      >
                        I säsong
                      </Checkbox>
                      <Checkbox
                        checked={row.inSelection}
                        onChange={(event) =>
                          update(row.clientId, {
                            inSelection: event.target.checked,
                          })
                        }
                      >
                        Utvald
                      </Checkbox>
                    </div>
                    <div className="flex flex-col gap-2 md:col-span-2">
                      <span className="font-medium">Måttenheter</span>
                      <div className="flex flex-wrap gap-4">
                        {Object.keys(measurements).map((measurement) => {
                          const type = measurement as MeasurementTypeEnum;
                          const selectedMeasurement =
                            row.measurements.includes(type);
                          return (
                            <Checkbox
                              key={type}
                              disabled={type === MeasurementTypeEnum.Weight}
                              checked={selectedMeasurement}
                              onChange={() =>
                                update(row.clientId, {
                                  measurements: selectedMeasurement
                                    ? row.measurements.filter(
                                        (item) => item !== type,
                                      )
                                    : [...row.measurements, type],
                                })
                              }
                            >
                              {measurements[type].name}
                            </Checkbox>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              },
            }}
            columns={[
              { title: "Namn", dataIndex: "name" },
              {
                title: "Huvudkategori",
                render: (_, row) =>
                  suggestions.find(
                    (item) => item.clientId === row.parentClientId,
                  )?.name ??
                  (row.parentId ? "Befintlig huvudkategori" : "Huvudkategori"),
              },
              {
                title: "Beskrivning",
                dataIndex: "description",
                render: (value) => (
                  <span className="line-clamp-2">{value}</span>
                ),
              },
            ]}
          />
          <div className="grid w-full grid-cols-2 gap-3">
            <Button
              type="primary"
              loading={loading}
              disabled={!selected.length}
              onClick={create}
            >
              Skapa markerade kategorier
            </Button>
            <Button
              disabled={loading}
              onClick={() => {
                setSuggestions([]);
                setExcluded([]);
                setSelected([]);
              }}
            >
              Släng utkast
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default ImportCategories;
