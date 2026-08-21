"use client";

import {
  DeleteOutlined,
  EditOutlined,
  InboxOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import SelectAddress from "@components/address/select-address";
import EditProduct from "@components/product/edit-product";
import SelectShippingPrice from "@components/shipping-price/select-shipping-price";
import SelectUser from "@components/user/select-user";
import { routes } from "@/lib/routes";
import { getProduct } from "@/queries/product/get-product";
import {
  CmsImportBatch,
  CmsImportFile,
  createCmsAdImportBatch,
  getCmsAdImportBatch,
  publishCmsImportedAds,
  removeCmsAdImportBatch,
  removeCmsImportedAdDraft,
  startCmsAdImportBatch,
} from "@/queries/product-import/cms-ad-import";
import {
  App,
  Button,
  Card,
  Checkbox,
  InputNumber,
  List,
  Progress,
  Spin,
  Tag,
  Upload,
} from "antd";
import { RcFile } from "antd/es/upload";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const ACCEPTED_FILES = ".jpg,.jpeg,.png,.webp,.pdf,.csv,.xlsx,.md";

const ImportProducts = () => {
  const { message, modal, notification } = App.useApp();
  const router = useRouter();
  const [sellerId, setSellerId] = useState<string>();
  const [defaultAddress, setDefaultAddress] = useState<string>();
  const [defaultPickupEnabled, setDefaultPickupEnabled] = useState(false);
  const [defaultDeliveryEnabled, setDefaultDeliveryEnabled] = useState(false);
  const [defaultDeliveryRadius, setDefaultDeliveryRadius] = useState<number>();
  const [defaultDeliveryPrice, setDefaultDeliveryPrice] = useState<number>();
  const [defaultShippingEnabled, setDefaultShippingEnabled] = useState(false);
  const [defaultShippingPriceId, setDefaultShippingPriceId] =
    useState<string>();
  const [files, setFiles] = useState<CmsImportFile[]>([]);
  const [batch, setBatch] = useState<CmsImportBatch>();
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string>();
  const [removingProductId, setRemovingProductId] = useState<string>();

  const refreshBatch = async () => {
    if (!batch?.id) return;
    try {
      setBatch(await getCmsAdImportBatch(batch.id));
    } catch (error) {
      notification.error({
        message: "Kunde inte läsa importstatus",
        description: error instanceof Error ? error.message : undefined,
      });
    }
  };

  useEffect(() => {
    if (!batch || ["READY", "FAILED", "PUBLISHED"].includes(batch.status))
      return;
    const interval = window.setInterval(() => void refreshBatch(), 3000);
    return () => window.clearInterval(interval);
  }, [batch?.id, batch?.status]);

  const addFiles = (newFiles: RcFile[]) => {
    setFiles((current) => [
      ...current,
      ...newFiles.map((file) => ({ file, uid: file.uid })),
    ]);
  };

  const startImport = async () => {
    if (!sellerId || !files.length) return;
    setLoading(true);
    try {
      const hasDeliveryDefaults =
        defaultPickupEnabled ||
        defaultDeliveryEnabled ||
        defaultShippingEnabled;
      const created = await createCmsAdImportBatch(
        sellerId,
        files,
        hasDeliveryDefaults
          ? {
              address: defaultAddress,
              pickupEnabled: defaultPickupEnabled,
              deliveryEnabled: defaultDeliveryEnabled,
              deliveryRadius: defaultDeliveryEnabled
                ? defaultDeliveryRadius
                : undefined,
              deliveryPrice: defaultDeliveryEnabled
                ? defaultDeliveryPrice
                : undefined,
              shippingPriceId: defaultShippingEnabled
                ? defaultShippingPriceId
                : undefined,
            }
          : undefined,
      );
      await Promise.all(
        created.uploadUrls.map((url, index) =>
          fetch(url, {
            method: "PUT",
            headers: {
              "Content-Type":
                files[index].file.type || "application/octet-stream",
              "x-amz-acl": "public-read",
            },
            body: files[index].file,
          }).then((response) => {
            if (!response.ok)
              throw new Error(
                `Uppladdning av ${files[index].file.name} misslyckades`,
              );
          }),
        ),
      );
      await startCmsAdImportBatch(created.batch.id);
      setBatch({
        ...created.batch,
        status: "QUEUED",
        progress: 5,
        products: [],
      });
      setFiles([]);
    } catch (error) {
      notification.error({
        message: "Importen kunde inte startas",
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setLoading(false);
    }
  };

  const discard = () => {
    if (!batch) return;
    modal.confirm({
      title: "Släng import och utkast?",
      content: "Alla opublicerade annonser och importfiler tas bort permanent.",
      okText: "Släng utkast",
      okButtonProps: { danger: true },
      cancelText: "Avbryt",
      onOk: async () => {
        await removeCmsAdImportBatch(batch.id);
        setBatch(undefined);
        message.success("Importen har tagits bort");
      },
    });
  };

  const removeDraft = (productId: string, title: string) => {
    if (!batch) return;
    modal.confirm({
      title: `Ta bort "${title}"?`,
      content: "Annonsutkastet och dess kopplade filer tas bort permanent.",
      okText: "Ta bort",
      okButtonProps: { danger: true },
      cancelText: "Avbryt",
      onOk: async () => {
        setRemovingProductId(productId);
        try {
          await removeCmsImportedAdDraft(batch.id, productId);
          if (editingProductId === productId) setEditingProductId(undefined);
          await refreshBatch();
          message.success("Annonsutkastet har tagits bort");
        } finally {
          setRemovingProductId(undefined);
        }
      },
    });
  };

  const publish = async () => {
    if (!batch) return;
    const valid = batch.products.filter(
      (product) => !product.cmsImportValidationIssues.length,
    );
    if (!valid.length) return;
    setPublishing(true);
    try {
      await publishCmsImportedAds(
        batch.id,
        valid.map((product) => product.id),
      );
      notification.success({
        message: `${valid.length} annonser har publicerats`,
      });
      await refreshBatch();
      router.push(routes.LIST_PRODUCT);
    } catch (error) {
      notification.error({
        message: "Annonserna kunde inte publiceras",
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setPublishing(false);
    }
  };

  const deliveryDefaultsInvalid =
    ((defaultPickupEnabled ||
      defaultDeliveryEnabled ||
      defaultShippingEnabled) &&
      !defaultAddress) ||
    (defaultDeliveryEnabled &&
      (defaultDeliveryRadius === undefined ||
        defaultDeliveryPrice === undefined)) ||
    (defaultShippingEnabled && !defaultShippingPriceId);
  const importing =
    batch && !["READY", "FAILED", "PUBLISHED"].includes(batch.status);
  const validCount =
    batch?.products.filter(
      (product) => !product.cmsImportValidationIssues.length,
    ).length ?? 0;

  return (
    <div className="flex max-w-screen-xl flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-title-large">Importera produkter</h1>
          <p>
            Skapa vanliga Rebuildr-annonser från bilder, dokument och
            produktlistor.
          </p>
        </div>
        <Button onClick={() => router.push(routes.LIST_PRODUCT)}>
          Till produkter
        </Button>
      </div>

      {!batch ? (
        <Card title="1. Välj säljare och underlag">
          <div className="flex flex-col gap-5">
            <div className="max-w-xl">
              <label className="mb-2 block">Säljare</label>
              <SelectUser value={sellerId} onChange={setSellerId} />
            </div>

            <div className="max-w-4xl rounded-md border p-5">
              <h2 className="mb-1 text-title-medium">
                Gemensamma leveranssätt (valfritt)
              </h2>
              <p className="mb-4 text-body-small text-neutral-500">
                Valen förifylls på alla annonsutkast och kan ändras individuellt
                vid granskning.
              </p>
              <div className="flex flex-col gap-4">
                <div className="flex gap-6">
                  <Checkbox
                    checked={defaultPickupEnabled}
                    onChange={(event) =>
                      setDefaultPickupEnabled(event.target.checked)
                    }
                  >
                    Avhämtning
                  </Checkbox>
                  <Checkbox
                    checked={defaultShippingEnabled}
                    onChange={(event) =>
                      setDefaultShippingEnabled(event.target.checked)
                    }
                  >
                    Fraktleverans
                  </Checkbox>
                  <Checkbox
                    checked={defaultDeliveryEnabled}
                    onChange={(event) =>
                      setDefaultDeliveryEnabled(event.target.checked)
                    }
                  >
                    Hemtransport
                  </Checkbox>
                </div>

                {(defaultPickupEnabled ||
                  defaultDeliveryEnabled ||
                  defaultShippingEnabled) && (
                  <div>
                    <label className="mb-2 block">Plats</label>
                    <div className="flex gap-2">
                      <div className="min-w-0 flex-1">
                        <SelectAddress
                          value={defaultAddress}
                          onChange={setDefaultAddress}
                        />
                      </div>
                      {defaultAddress && (
                        <Button onClick={() => setDefaultAddress(undefined)}>
                          Rensa
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {defaultShippingEnabled && (
                  <div className="max-w-xl">
                    <label className="mb-2 block">Vikt på paketet</label>
                    <SelectShippingPrice
                      value={defaultShippingPriceId}
                      onChange={setDefaultShippingPriceId}
                    />
                  </div>
                )}

                {defaultDeliveryEnabled && (
                  <div className="grid max-w-xl grid-cols-2 gap-4">
                    <div>
                      <label className="mb-2 block">
                        Max avstånd för hemtransport (km)
                      </label>
                      <InputNumber
                        className="w-full"
                        min={0}
                        value={defaultDeliveryRadius}
                        onChange={(value) =>
                          setDefaultDeliveryRadius(value ?? undefined)
                        }
                      />
                    </div>
                    <div>
                      <label className="mb-2 block">Transportpris (kr)</label>
                      <InputNumber
                        className="w-full"
                        min={0}
                        value={defaultDeliveryPrice}
                        onChange={(value) =>
                          setDefaultDeliveryPrice(value ?? undefined)
                        }
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
            <Upload.Dragger
              accept={ACCEPTED_FILES}
              multiple
              showUploadList={false}
              beforeUpload={(file) => {
                addFiles([file]);
                return false;
              }}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">
                Ladda upp bilder, dokument eller listor
              </p>
              <p className="ant-upload-hint">
                PDF, CSV, XLSX, Markdown och bilder kan kombineras i samma
                import.
              </p>
            </Upload.Dragger>
            {!!files.length && (
              <List
                bordered
                dataSource={files}
                renderItem={(item) => (
                  <List.Item
                    actions={[
                      <Button
                        key="remove"
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() =>
                          setFiles((current) =>
                            current.filter((file) => file.uid !== item.uid),
                          )
                        }
                      />,
                    ]}
                  >
                    {item.file.name}
                  </List.Item>
                )}
              />
            )}
            <Button
              type="primary"
              icon={<UploadOutlined />}
              loading={loading}
              disabled={!sellerId || !files.length || deliveryDefaultsInvalid}
              onClick={() => void startImport()}
            >
              Starta import
            </Button>
          </div>
        </Card>
      ) : (
        <Card title="2. Granska importerade utkast">
          <div className="flex flex-col gap-5">
            {importing && <Progress percent={batch.progress} status="active" />}
            {batch.status === "FAILED" && (
              <p className="text-red-600">
                {batch.errorMessage ?? "Importen kunde inte slutföras."}
              </p>
            )}
            {batch.status === "READY" && (
              <p>
                {validCount} av {batch.products.length} annonser är klara att
                publicera.
              </p>
            )}
            <List
              bordered
              loading={importing}
              dataSource={batch.products}
              locale={{
                emptyText: importing
                  ? "Importerar annonser…"
                  : "Inga annonser skapades.",
              }}
              renderItem={(product) => (
                <List.Item>
                  <div className="flex w-full flex-col gap-4">
                    <div className="flex w-full items-center gap-4">
                      <List.Item.Meta
                        avatar={
                          product.primaryImage?.url ? (
                            <img
                              className="h-12 w-12 rounded object-cover"
                              src={product.primaryImage.url}
                              alt=""
                            />
                          ) : undefined
                        }
                        title={product.title}
                        description={
                          product.cmsImportValidationIssues.length
                            ? product.cmsImportValidationIssues.join(", ")
                            : "Klar att publicera"
                        }
                      />
                      <Tag
                        color={
                          product.cmsImportValidationIssues.length
                            ? "error"
                            : "success"
                        }
                      >
                        {product.cmsImportValidationIssues.length
                          ? "Komplettera"
                          : "Klar"}
                      </Tag>
                      <Button
                        icon={<EditOutlined />}
                        onClick={() =>
                          setEditingProductId((current) =>
                            current === product.id ? undefined : product.id,
                          )
                        }
                      >
                        {editingProductId === product.id ? "Stäng" : "Redigera"}
                      </Button>
                      <Button
                        danger
                        icon={<DeleteOutlined />}
                        loading={removingProductId === product.id}
                        disabled={publishing}
                        onClick={() => removeDraft(product.id, product.title)}
                      >
                        Ta bort
                      </Button>
                    </div>
                    {editingProductId === product.id && (
                      <div className="border-t pt-4">
                        <InlineProductEditor
                          productId={product.id}
                          onSaved={async () => {
                            setEditingProductId(undefined);
                            await refreshBatch();
                          }}
                        />
                      </div>
                    )}
                  </div>
                </List.Item>
              )}
            />
            <div className="flex gap-3">
              <Button
                type="primary"
                loading={publishing}
                disabled={batch.status !== "READY" || !validCount}
                onClick={() => void publish()}
              >
                Publicera validerade ({validCount})
              </Button>
              <Button danger disabled={publishing} onClick={discard}>
                Släng utkast
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

const InlineProductEditor = ({
  productId,
  onSaved,
}: {
  productId: string;
  onSaved: () => void | Promise<void>;
}) => {
  const {
    data: product,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["cms-import-product", productId],
    queryFn: () => getProduct(productId),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Spin />
      </div>
    );
  }
  if (error || !product) {
    return <p className="text-red-600">Produktutkastet kunde inte hämtas.</p>;
  }

  return (
    <div className="max-w-screen-2xl">
      <EditProduct product={product} inline onSaved={onSaved} />
    </div>
  );
};

export default ImportProducts;
