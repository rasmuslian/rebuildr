import React from "react";
import AdminForm from "@components/admin-form";
import FormField from "@components/form-field";
import { Divider, Button, Input, InputNumber } from "antd";
import { FooterSectionSchemaType } from "@/schema/footer-section-schema";
import SelectAricleTable from "@components/article/select-article-table";
import DragAndDropArticles from "@components/footer/drag-and-drop-articles";
import {
  UseFormHandleSubmit,
  FieldErrors,
  Control,
  Controller,
} from "react-hook-form";
import { FooterSectionEntryType } from "gql/graphql";
import { useState } from "react";

type Props = {
  title: string;
  handleSubmit: UseFormHandleSubmit<FooterSectionSchemaType>;
  onSubmit: (formValues: FooterSectionSchemaType) => void;
  errors: FieldErrors<FooterSectionSchemaType>;
  control: Control<FooterSectionSchemaType>;
  submitLabel: string;
  isPending: boolean;
};

const FooterSectionForm = ({
  title,
  handleSubmit,
  onSubmit,
  errors,
  control,
  submitLabel,
  isPending,
}: Props) => {
  const [linkLabel, setLinkLabel] = useState("");
  const [linkUrl, setLinkUrl] = useState("");

  return (
    <AdminForm>
      <Divider orientation="left">{title}</Divider>

      <Controller
        control={control}
        name="title"
        render={({ field }) => (
          <FormField
            label="Rubrik"
            required={true}
            error={errors.title?.message}
          >
            <Input {...field} placeholder="Ange rubrik..." />
          </FormField>
        )}
      />

      <Controller
        control={control}
        name="orderIndex"
        render={({ field }) => (
          <FormField
            label="Position"
            required={true}
            error={errors.orderIndex?.message}
          >
            <InputNumber
              {...field}
              placeholder="Ange sorteringsposition (t.ex. 1, 2, 3 …)"
              style={{ width: "100%" }}
              min={1}
            />
          </FormField>
        )}
      />

      <Controller
        control={control}
        name="entries"
        render={({ field: { onChange, value } }) => {
          const articleEntries = value.filter(
            (entry) => entry.type === FooterSectionEntryType.Article,
          );
          const linkEntries = value.filter(
            (entry) => entry.type === FooterSectionEntryType.Link,
          );

          const selectedArticles = articleEntries
            .map((entry) => entry.article)
            .filter(Boolean) as NonNullable<FooterSectionSchemaType["entries"][number]["article"]>[];

          const handleSetArticles = (articles: typeof selectedArticles) => {
            const existingLinks = linkEntries.map((entry) => ({
              ...entry,
            }));
            const newArticleEntries = articles.map((article, index) => ({
              type: FooterSectionEntryType.Article,
              orderIndex: index,
              article,
            }));
            const orderedLinks = existingLinks.map((entry, index) => ({
              ...entry,
              orderIndex: newArticleEntries.length + index,
            }));
            onChange([...newArticleEntries, ...orderedLinks]);
          };

          const handleAddLink = () => {
            if (!linkLabel.trim() || !linkUrl.trim()) return;
            const newEntry = {
              tempId: `link-${Date.now()}`,
              type: FooterSectionEntryType.Link,
              orderIndex: value.length,
              label: linkLabel.trim(),
              url: linkUrl.trim(),
            };
            onChange([...value, newEntry]);
            setLinkLabel("");
            setLinkUrl("");
          };

          return (
            <div className="grid grid-cols-[auto_320px] gap-5">
              <FormField
                label="Välj artiklar"
                required={true}
                error={errors.entries?.message}
              >
                <SelectAricleTable
                  articles={selectedArticles}
                  setArticles={handleSetArticles}
                />
                <div className="mt-4 flex flex-col gap-3 rounded border border-neutral-200 p-3">
                  <p className="text-label-large">Lägg till länk</p>
                  <Input
                    placeholder="Titel"
                    value={linkLabel}
                    onChange={(event) => setLinkLabel(event.target.value)}
                  />
                  <Input
                    placeholder="https://"
                    value={linkUrl}
                    onChange={(event) => setLinkUrl(event.target.value)}
                  />
                  <Button
                    type="default"
                    onClick={handleAddLink}
                    disabled={!linkLabel.trim() || !linkUrl.trim()}
                  >
                    Lägg till länk
                  </Button>
                </div>
              </FormField>

              <DragAndDropArticles
                entries={value}
                setEntries={onChange}
                title="Valda poster"
              />
            </div>
          );
        }}
      />

      <Button
        type="primary"
        htmlType="button"
        size="middle"
        onClick={handleSubmit(onSubmit)}
        loading={isPending}
      >
        {submitLabel}
      </Button>
    </AdminForm>
  );
};

export default FooterSectionForm;
