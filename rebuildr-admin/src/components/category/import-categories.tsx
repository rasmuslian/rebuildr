"use client";

import React, { useState } from "react";
import * as XLSX from "xlsx";
import { App, Button, Checkbox, Input, Table, Upload } from "antd";
import type { UploadProps } from "antd";
import { InboxOutlined } from "@ant-design/icons";

import {
  analyzeCategoryImport,
  CategoryImportSuggestion,
  createCategories,
} from "@/queries/category/import-categories";
import { revalidate } from "@/actions/revalidate";
import { routes } from "@/lib/routes";

const MAX_ROWS = 1000;
const MAX_CELL_LENGTH = 500;

const ImportCategories = () => {
  const { notification } = App.useApp();
  const [rows, setRows] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<CategoryImportSuggestion[]>([]);
  const [excluded, setExcluded] = useState<string[]>([]);
  const [selected, setSelected] = useState<React.Key[]>([]);
  const [loading, setLoading] = useState(false);

  const beforeUpload: UploadProps["beforeUpload"] = async (file) => {
    const isSupported = /\.(csv|xlsx)$/i.test(file.name);
    if (!isSupported) {
      notification.error({ message: "Välj en CSV- eller XLSX-fil." });
      return Upload.LIST_IGNORE;
    }
    try {
      const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
      const parsed = workbook.SheetNames.flatMap((sheetName) => {
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
          defval: "",
        });
        return data.map((row) =>
          `${sheetName}: ${JSON.stringify(
            Object.fromEntries(
              Object.entries(row).map(([key, value]) => [
                key.slice(0, MAX_CELL_LENGTH),
                String(value).slice(0, MAX_CELL_LENGTH),
              ]),
            ),
          )}`,
        );
      }).filter((row) => row.trim());
      if (!parsed.length) throw new Error("Filen saknar tabellinnehåll.");
      setRows(parsed.slice(0, MAX_ROWS));
      setSuggestions([]);
      setExcluded([]);
      notification.success({
        message: "Filen är klar för analys",
        description: `${Math.min(parsed.length, MAX_ROWS)} rader kommer att analyseras.`,
      });
    } catch (error) {
      notification.error({
        message: "Filen kunde inte läsas",
        description: error instanceof Error ? error.message : undefined,
      });
    }
    return false;
  };

  const analyze = async () => {
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

  const update = (clientId: string, patch: Partial<CategoryImportSuggestion>) => {
    setSuggestions((current) =>
      current.map((row) => (row.clientId === clientId ? { ...row, ...patch } : row)),
    );
  };

  const create = async () => {
    setLoading(true);
    try {
      const result = await createCategories(
        suggestions.filter((suggestion) => selected.includes(suggestion.clientId)),
      );
      if (!result) throw new Error();
      const skipped = result.results.filter((row) => row.skippedReason).length;
      notification.success({
        message: "Kategorierna har skapats.",
        description: skipped ? `${skipped} rader hoppades över som dubbletter.` : undefined,
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
        <p>Ladda upp CSV eller XLSX. AI:n föreslår bara nya kategorier; inget befintligt ändras eller tas bort.</p>
      </div>
      <Upload.Dragger accept=".csv,.xlsx" maxCount={1} beforeUpload={beforeUpload}>
        <p className="ant-upload-drag-icon"><InboxOutlined /></p>
        <p className="ant-upload-text">Ladda upp en CSV- eller XLSX-fil</p>
      </Upload.Dragger>
      <Button type="primary" disabled={!rows.length} loading={loading} onClick={analyze}>
        Analysera {rows.length ? `${rows.length} rader` : "fil"}
      </Button>
      {!!excluded.length && (
        <div className="rounded border border-yellow-300 bg-yellow-50 p-3">
          <strong>Uteslutna dubbletter</strong>
          <ul>{excluded.map((reason, index) => <li key={index}>{reason}</li>)}</ul>
        </div>
      )}
      {!!suggestions.length && (
        <>
          <Table
            rowKey="clientId"
            pagination={false}
            rowSelection={{ selectedRowKeys: selected, onChange: setSelected }}
            dataSource={suggestions}
            columns={[
              { title: "Namn", dataIndex: "name", render: (value, row) => <Input value={value} onChange={(event) => update(row.clientId, { name: event.target.value })} /> },
              { title: "Beskrivning", dataIndex: "description", render: (value, row) => <Input.TextArea value={value} onChange={(event) => update(row.clientId, { description: event.target.value })} /> },
              { title: "Huvudkategori", dataIndex: "parentId", render: (value, row) => <Input value={value ?? row.parentClientId} placeholder="Databas-id eller förslags-id; tomt = huvudkategori" onChange={(event) => { const parent = event.target.value.trim(); update(row.clientId, parent.startsWith("ai-") ? { parentId: undefined, parentClientId: parent } : { parentId: parent || undefined, parentClientId: undefined }); }} /> },
              { title: "Sökalias", dataIndex: "searchAliases", render: (value, row) => <Input value={value.join(", ")} onChange={(event) => update(row.clientId, { searchAliases: event.target.value.split(",").map((term) => term.trim()).filter(Boolean) })} /> },
              { title: "Mått", dataIndex: "measurements", render: (value, row) => <Input value={value.join(", ")} placeholder="HEIGHT, WIDTH" onChange={(event) => update(row.clientId, { measurements: event.target.value.split(",").map((measurement) => measurement.trim()).filter(Boolean) })} /> },
              { title: "Varumärkes-id:n", dataIndex: "brandIds", render: (value, row) => <Input value={value?.join(", ")} onChange={(event) => update(row.clientId, { brandIds: event.target.value.split(",").map((id) => id.trim()).filter(Boolean) })} /> },
              { title: "Säsong", render: (_, row) => <Checkbox checked={row.inSeason} onChange={(event) => update(row.clientId, { inSeason: event.target.checked })} /> },
              { title: "Utvald", render: (_, row) => <Checkbox checked={row.inSelection} onChange={(event) => update(row.clientId, { inSelection: event.target.checked })} /> },
            ]}
          />
          <Button type="primary" loading={loading} disabled={!selected.length} onClick={create}>
            Skapa markerade kategorier
          </Button>
        </>
      )}
    </div>
  );
};

export default ImportCategories;
