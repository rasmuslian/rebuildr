import {
  CreateInternalAdDraftMutation,
  CreateInternalAdImportBatchMutation,
  CreateInternalAdImportBatchMutationVariables,
  InternalAdImportBatchQuery,
  InternalAdImportBatchQueryVariables,
  InternalAdImportBatchStatusEnum,
  InternalAdsPageQuery,
  InternalAdsPageQueryVariables,
  ProductStatusEnum,
  PublishInternalAdDraftsMutation,
  PublishInternalAdDraftsMutationVariables,
} from "@/gql/graphql";
import {
  CREATE_INTERNAL_AD_DRAFT,
  CREATE_INTERNAL_AD_IMPORT_BATCH,
  INTERNAL_AD_IMPORT_BATCH,
  INTERNAL_ADS_PAGE_QUERY,
  PUBLISH_INTERNAL_AD_DRAFTS,
  REMOVE_INTERNAL_AD_DRAFT,
  REMOVE_INTERNAL_AD_IMPORT_BATCH,
  START_INTERNAL_AD_IMPORT_BATCH,
} from "@/queries/internal-ads";
import { useMutation, useQuery } from "@apollo/client";
import MainBackground from "@assets/images/main-background.png";
import PlaceholderProduct from "@assets/images/placeholder-product.png";
import { AdGridSection } from "@components/ad-grid-section/ad-grid-section";
import { Button } from "@components/buttons/button";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import Footer from "@components/navigation/footer";
import TopBar from "@components/navigation/top-bar/top-bar";
import { Search } from "@components/search/search";
import { SlideInSheet } from "@components/slide-in-sheet/slide-in-sheet";
import { Body, Headline, Label, Title } from "@components/typography/text";
import { UpsertProduct } from "@components/upsert-product/upsert-product";
import { FileType } from "@components/upsert-product/types";
import { primitives } from "@constants/colors";
import { borderRadius } from "@constants/sizes";
import { useSearchContext } from "@context/search-context";
import { useDocumentHandler } from "@hooks/use-document-handler";
import { useScreenType } from "@hooks/useScreenType";
import { useThemeColor } from "@hooks/useThemeColor";
import { Icon } from "@icons/icon";
import { Image } from "expo-image";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  ImageBackground,
  Pressable,
  ScrollView,
  View,
} from "react-native";

const PAGE_SIZE = 24;

export default function InternalAdsPage() {
  const colors = useThemeColor();
  const { isDesktop } = useScreenType();
  const params = useLocalSearchParams<{
    q?: string;
    action?: string;
    t?: string;
  }>();
  const searchContext = useSearchContext();
  const [searchString, setSearchString] = useState(params.q ?? "");
  const [editorProductId, setEditorProductId] = useState<string>();
  const [showEditor, setShowEditor] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileType[]>([]);
  const [activeBatchId, setActiveBatchId] = useState<string>();
  const [pollBatch, setPollBatch] = useState(false);
  const [publishRequested, setPublishRequested] = useState(false);
  const handledCreateAction = useRef<string | undefined>(undefined);
  const importedDraftSaves = useRef(new Set<Promise<boolean | undefined>>());
  const { pickDocuments } = useDocumentHandler();

  useFocusEffect(
    useCallback(() => {
      if (typeof document === "undefined") return;
      document.body.style.backgroundColor = primitives.accent100;
      return () => {
        document.body.style.backgroundColor = "";
      };
    }, [primitives.accent100]),
  );

  useEffect(() => {
    const query = params.q ?? "";
    setSearchString(query);
    searchContext.setSearchState({
      searchString: query,
      searchScope: "internal",
    });
  }, [params.q]);

  const { data, loading, refetch, fetchMore } = useQuery<
    InternalAdsPageQuery,
    InternalAdsPageQueryVariables
  >(INTERNAL_ADS_PAGE_QUERY, {
    variables: {
      input: { searchString: searchString || undefined },
      limit: PAGE_SIZE,
      offset: 0,
    },
    fetchPolicy: "cache-and-network",
  });
  const { data: batchData, refetch: refetchBatch } = useQuery<
    InternalAdImportBatchQuery,
    InternalAdImportBatchQueryVariables
  >(INTERNAL_AD_IMPORT_BATCH, {
    variables: { batchId: activeBatchId ?? "" },
    skip: !activeBatchId,
    pollInterval: pollBatch ? 3000 : 0,
  });

  const [createDraft, { loading: creatingDraft }] =
    useMutation<CreateInternalAdDraftMutation>(CREATE_INTERNAL_AD_DRAFT);
  const [publishImported, { loading: publishingImported }] = useMutation<
    PublishInternalAdDraftsMutation,
    PublishInternalAdDraftsMutationVariables
  >(PUBLISH_INTERNAL_AD_DRAFTS);
  const [removeDraft] = useMutation(REMOVE_INTERNAL_AD_DRAFT);
  const [removeImportBatch] = useMutation(REMOVE_INTERNAL_AD_IMPORT_BATCH);
  const [createBatch, { loading: creatingBatch }] = useMutation<
    CreateInternalAdImportBatchMutation,
    CreateInternalAdImportBatchMutationVariables
  >(CREATE_INTERNAL_AD_IMPORT_BATCH);
  const [startBatch, { loading: startingBatch }] = useMutation(
    START_INTERNAL_AD_IMPORT_BATCH,
  );
  const [uploadingImport, setUploadingImport] = useState(false);
  const [discardingImport, setDiscardingImport] = useState(false);
  const uploadAbortController = useRef<AbortController | undefined>(undefined);
  const importBatchId = useRef<string | undefined>(undefined);
  const importGeneration = useRef(0);
  const batchCreation = useRef<ReturnType<typeof createBatch> | null>(null);

  const onCreateInternalAd = useCallback(async () => {
    const result = await createDraft();
    const productId = result.data?.createInternalAdDraft.id;
    if (!productId) return;
    setEditorProductId(productId);
    setShowEditor(true);
  }, [createDraft]);

  useEffect(() => {
    if (params.action !== "create" || !params.t) return;
    if (handledCreateAction.current === params.t) return;
    handledCreateAction.current = params.t;
    onCreateInternalAd();
  }, [onCreateInternalAd, params.action, params.t]);

  const batch = activeBatchId ? batchData?.internalAdImportBatch : undefined;
  const importedProducts = batch?.products ?? [];

  useEffect(() => {
    if (
      batch?.status === InternalAdImportBatchStatusEnum.Ready ||
      batch?.status === InternalAdImportBatchStatusEnum.Failed ||
      batch?.status === InternalAdImportBatchStatusEnum.Published
    ) {
      setPollBatch(false);
    }
  }, [batch?.status]);

  const onPickFiles = async () => {
    const files = await pickDocuments();
    if (!files?.length) return;
    setSelectedFiles((currentFiles) => [
      ...currentFiles,
      ...files.map((file, index) => ({
        ...file,
        index: currentFiles.length + index,
        uri: file.uri,
      })),
    ]);
  };

  const onRemoveFile = (index: number) => {
    setSelectedFiles((files) =>
      files
        .filter((file) => file.index !== index)
        .map((file, nextIndex) => ({ ...file, index: nextIndex })),
    );
  };

  const onStartImport = async () => {
    if (!selectedFiles.length) return;
    const generation = ++importGeneration.current;
    setUploadingImport(true);
    const controller = new AbortController();
    uploadAbortController.current = controller;
    const creation = createBatch({
      variables: {
        input: {
          files: selectedFiles.map((file) => ({
            mimeType: file.mimeType,
            name: file.name,
          })),
        },
      },
    });
    batchCreation.current = creation;
    try {
      const created = await creation;
      const response = created.data?.createInternalAdImportBatch;
      if (!response) return;
      importBatchId.current = response.batch.id;
      setActiveBatchId(response.batch.id);
      if (importGeneration.current !== generation) {
        return;
      }
      await Promise.all(
        response.uploadUrls.map((uploadUrl, index) =>
          fetch(uploadUrl, {
            method: "PUT",
            headers: { "Content-Type": selectedFiles[index].mimeType },
            body: selectedFiles[index].file,
            signal: controller.signal,
          }),
        ),
      );
      if (importGeneration.current !== generation) return;
      setPollBatch(true);
      setSelectedFiles([]);
      await startBatch({ variables: { batchId: response.batch.id } });
      await refetchBatch();
    } catch (error) {
      if (importGeneration.current === generation) throw error;
    } finally {
      batchCreation.current = null;
      uploadAbortController.current = undefined;
      setUploadingImport(false);
    }
  };

  const onDiscardImport = () => {
    const pendingCreation = batchCreation.current;
    const knownBatchId = importBatchId.current ?? batch?.id;
    const generation = ++importGeneration.current;
    setDiscardingImport(true);
    uploadAbortController.current?.abort();
    setPollBatch(false);
    setActiveBatchId(undefined);
    importBatchId.current = undefined;
    setSelectedFiles([]);
    setShowImport(false);

    (async () => {
      const created = pendingCreation ? await pendingCreation : undefined;
      const batchId =
        knownBatchId ?? created?.data?.createInternalAdImportBatch.batch.id;
      if (batchId) {
        await removeImportBatch({ variables: { batchId } });
      }
      if (importGeneration.current === generation) {
        setDiscardingImport(false);
      }
    })().catch((error) => {
      console.error("Failed to discard internal ad import", error);
      if (importGeneration.current === generation) {
        setDiscardingImport(false);
      }
    });
  };

  const onPublishImported = async () => {
    if (publishRequested || publishingImported) return;
    setPublishRequested(true);
    try {
      await Promise.allSettled([...importedDraftSaves.current]);
      const refreshedBatch = await refetchBatch();
      const products =
        refreshedBatch.data?.internalAdImportBatch.products ?? importedProducts;
      const productIds = products
        .filter((product) => !product.internalValidationIssues.length)
        .map((product) => product.id);
      if (!productIds.length) return;
      const hasRemainingDrafts = productIds.length < products.length;
      await publishImported({ variables: { productIds } });
      await Promise.all([refetch(), refetchBatch()]);
      if (!hasRemainingDrafts) {
        setPollBatch(false);
        setActiveBatchId(undefined);
        importBatchId.current = undefined;
        setSelectedFiles([]);
        setShowImport(false);
      }
    } finally {
      setPublishRequested(false);
    }
  };

  const onDiscardImportedProduct = async (productId: string) => {
    await removeDraft({ variables: { productId } });
    await refetchBatch();
  };

  const onImportedDraftSave = (save: Promise<boolean | undefined>) => {
    importedDraftSaves.current.add(save);
    save.then(
      () => {
        importedDraftSaves.current.delete(save);
        return refetchBatch().catch(() => undefined);
      },
      () => {
        importedDraftSaves.current.delete(save);
        return refetchBatch().catch(() => undefined);
      },
    );
  };

  const activeProducts = data?.internalAds.products ?? [];
  const total = data?.internalAds.total ?? 0;
  const hasAccess = !!data?.internalAdsOrganizationContext;
  const hasImport =
    (!discardingImport && !!batch) ||
    uploadingImport ||
    creatingBatch ||
    startingBatch;
  const visibleBatch = discardingImport ? undefined : batch;

  const adGridProducts = useMemo(
    () =>
      activeProducts.map((product) => ({
        id: product.id,
        title: product.title,
        price: product.price,
        imageUri: product.primaryImage?.url,
        quantity: product.primaryQuantity,
        quantityUnit: product.primaryUnit,
        condition: product.condition,
        soldByQuantity: product.soldByQuantity,
        status: product.status,
        overlayText:
          product.status === ProductStatusEnum.Sold ? "Såld" : undefined,
        onPress: () =>
          router.navigate({
            pathname: "/internal/[productId]",
            params: { productId: product.id },
          }),
      })),
    [activeProducts],
  );

  return (
    <View style={{ flex: 1, backgroundColor: primitives.accent100 }}>
      <TopBar
        theme="light"
        showSearchBar={false}
        sellButtonLabel="Ny intern annons"
        onSellButtonPress={onCreateInternalAd}
        backgroundColor={primitives.accent100}
        foregroundColor={colors.logo.vector}
        showBottomBorder={false}
        categoriesButtonBackgroundColor={primitives.neutrals100}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <ImageBackground
          source={MainBackground}
          resizeMode="cover"
          imageStyle={{ opacity: 0.6, tintColor: primitives.accent900 }}
          style={{
            backgroundColor: primitives.accent100,
            overflow: "hidden",
            width: "100%",
          }}
        >
          <View
            style={{
              paddingHorizontal: isDesktop ? 75 : 16,
              paddingTop: isDesktop ? 48 : 24,
              paddingBottom: isDesktop ? 56 : 28,
              gap: 24,
            }}
          >
            <View style={{ gap: 10, maxWidth: 780 }}>
              {/* <Label size="large" color="secondary">
                {organizationName}
              </Label> */}
              <Headline size={isDesktop ? "medium" : "small"} heading={1}>
                Internlagret
              </Headline>
              <Body size="large" color="secondary" style={{ maxWidth: 680 }}>
                Material, verktyg och resurser som bara cirkulerar inom er
                organisation.
              </Body>
            </View>

            {hasAccess && (
              <View style={{ gap: 16 }}>
                <Search
                  style={{ width: isDesktop ? 633 : undefined }}
                  backgroundColor={primitives.neutrals100}
                  borderStyle={{
                    borderColor: colors.buttons.outlinedStroke.enabled,
                    borderWidth: 1,
                  }}
                  placeholder="Sök i internlagret"
                  searchScope="internal"
                  searchOnSubmit
                  onSubmitSearch={(text) => setSearchString(text)}
                />
                <View
                  style={{ flexDirection: "row", gap: 12, flexWrap: "wrap" }}
                >
                  <Button
                    label="Ny intern annons"
                    onPress={onCreateInternalAd}
                    loading={creatingDraft}
                    theme="light"
                  />
                  <Button
                    label="Importera annonser"
                    icon="upload"
                    type="outlined"
                    theme="light"
                    onPress={() => setShowImport(true)}
                    style={{
                      backgroundColor: primitives.neutrals100,
                    }}
                  />
                </View>
              </View>
            )}
          </View>
        </ImageBackground>

        <View
          style={{
            backgroundColor: colors.background.neutral,
            paddingHorizontal: isDesktop ? 75 : 16,
            paddingBottom: 32,
            paddingTop: isDesktop ? 44 : 16,
            minHeight: 420,
          }}
        >
          {loading && !data ? (
            <LoadingSpinner />
          ) : !hasAccess ? (
            <AccessEmptyState />
          ) : activeProducts.length ? (
            <AdGridSection
              header={
                searchString
                  ? `Resultat för "${searchString}"`
                  : "Interna annonser"
              }
              products={adGridProducts}
              pagination={{
                total,
                loading,
                onShowMore: () =>
                  fetchMore({
                    variables: {
                      offset: Math.ceil(activeProducts.length / PAGE_SIZE),
                      limit: PAGE_SIZE,
                    },
                  }),
              }}
            />
          ) : (
            <View style={{ gap: 8, maxWidth: 560 }}>
              <Title size="large">
                {searchString
                  ? "Inga interna annonser hittades"
                  : "Inga interna annonser ännu"}
              </Title>
              <Body size="medium" color="secondary">
                {searchString
                  ? "Prova en annan sökning eller rensa sökfältet."
                  : "Skapa en intern annons eller importera flera annonser från filer."}
              </Body>
            </View>
          )}
        </View>

        <Footer />
      </ScrollView>

      <SlideInSheet
        open={showImport}
        onClose={() => setShowImport(false)}
        title="Importera annonser"
        style={{ gap: 24 }}
        footer={
          hasImport ? (
            <View
              style={{
                flexDirection: "row",
                gap: 12,
                width: "100%",
                paddingTop: 60,
              }}
            >
              <Button
                label="Skapa annonser"
                onPress={onPublishImported}
                loading={
                  publishRequested || publishingImported || uploadingImport
                }
                disabled={
                  discardingImport ||
                  batch?.status !== InternalAdImportBatchStatusEnum.Ready ||
                  !importedProducts.length
                }
                style={{ flex: 1 }}
              />
              <Button
                label="Släng utkast"
                type="outlined"
                style={{ flex: 1 }}
                onPress={onDiscardImport}
                loading={discardingImport}
                disabled={publishRequested || publishingImported}
              />
            </View>
          ) : (
            <Button
              label="Starta import"
              onPress={onStartImport}
              loading={creatingBatch || startingBatch}
              disabled={!selectedFiles.length}
            />
          )
        }
      >
        <ImportPanel
          files={selectedFiles}
          batch={visibleBatch}
          products={importedProducts}
          importStarted={!!activeBatchId}
          onPickFiles={onPickFiles}
          onRemoveFile={onRemoveFile}
          onDiscardProduct={onDiscardImportedProduct}
          onDraftSave={onImportedDraftSave}
        />
      </SlideInSheet>

      {editorProductId && (
        <UpsertProduct
          productId={editorProductId}
          mode="edit"
          visible={showEditor}
          internalMode
          onHide={() => setShowEditor(false)}
          onPublished={async () => {
            setShowEditor(false);
            await Promise.all([
              refetch(),
              activeBatchId ? refetchBatch() : undefined,
            ]);
          }}
        />
      )}
    </View>
  );
}

const AccessEmptyState = () => (
  <View style={{ gap: 12, maxWidth: 640 }}>
    <Title size="large">Du saknar tillgång till Internlagret</Title>
    <Body size="large" color="secondary">
      Be en organisationsadmin eller RebuildR-admin att aktivera internlagret
      för ert företagskonto.
    </Body>
  </View>
);

type ImportPanelProps = {
  files: FileType[];
  batch?: InternalAdImportBatchQuery["internalAdImportBatch"];
  products: InternalAdImportBatchQuery["internalAdImportBatch"]["products"];
  importStarted: boolean;
  onPickFiles: () => void;
  onRemoveFile: (index: number) => void;
  onDiscardProduct: (productId: string) => Promise<void>;
  onDraftSave: (save: Promise<boolean | undefined>) => void;
};

const ImportPanel = ({
  files,
  batch,
  products,
  importStarted,
  onPickFiles,
  onRemoveFile,
  onDiscardProduct,
  onDraftSave,
}: ImportPanelProps) => {
  const colors = useThemeColor();
  return (
    <View style={{ gap: 24 }}>
      {!batch && !importStarted && (
        <Pressable onPress={onPickFiles}>
          <View
            style={{
              borderRadius: borderRadius.medium,
              alignItems: "center",
              justifyContent: "center",
              padding: 16,
              borderStyle: "dashed",
              borderColor: colors.buttons.outlinedStroke.enabled,
              borderWidth: 1,
              gap: 16,
            }}
          >
            <View
              style={{
                width: 60,
                height: 60,
                backgroundColor: colors.card.message,
                borderRadius: 38,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon icon="upload" />
            </View>
            <View style={{ gap: 4 }}>
              <Title size="medium" style={{ textAlign: "center" }}>
                Ladda upp filer
              </Title>
              <Body
                size="small"
                color="secondary"
                style={{ textAlign: "center" }}
              >
                Bilder, dokument och listor kan laddas upp tillsammans.
              </Body>
            </View>
          </View>
        </Pressable>
      )}

      {!!files.length && !importStarted && (
        <View style={{ gap: 12 }}>
          <Label size="large">Valda filer</Label>
          <View style={{ gap: 12 }}>
            {files.map((file) => (
              <FileChip
                key={`${file.uri ?? file.name}-${file.mimeType}`}
                file={file}
                onRemove={() => onRemoveFile(file.index)}
              />
            ))}
          </View>
        </View>
      )}

      {batch && (
        <View style={{ gap: 16 }}>
          {batch.status !== InternalAdImportBatchStatusEnum.Ready &&
            batch.status !== InternalAdImportBatchStatusEnum.Failed && (
              <ImportProgress progress={batch.progress} />
            )}
          {batch.status === InternalAdImportBatchStatusEnum.Failed && (
            <Body size="medium" color="error">
              {batch.errorMessage ?? "Importen kunde inte slutföras."}
            </Body>
          )}
          {!!products.length && (
            <View style={{ gap: 12, marginTop: 8 }}>
              <Label size="large">Granska utkast</Label>
              {products.map((product) => (
                <ImportProductRow
                  key={product.id}
                  product={product}
                  onDiscard={onDiscardProduct}
                  onDraftSave={onDraftSave}
                />
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const ImportProductRow = ({
  product,
  onDiscard,
  onDraftSave,
}: {
  product: ImportPanelProps["products"][number];
  onDiscard: ImportPanelProps["onDiscardProduct"];
  onDraftSave: ImportPanelProps["onDraftSave"];
}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <View
      style={{
        borderRadius: borderRadius.medium,
        backgroundColor: primitives.accent100,
        padding: expanded ? 0 : 12,
        gap: 10,
      }}
    >
      <Pressable
        onPress={() => setExpanded((isExpanded) => !isExpanded)}
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          padding: expanded ? 12 : 0,
        }}
      >
        <Image
          source={{ uri: product.primaryImage?.url ?? PlaceholderProduct.uri }}
          style={{
            width: 40,
            height: 40,
            borderRadius: borderRadius.small,
            backgroundColor: primitives.neutrals100,
          }}
        />
        <View style={{ flex: 1, gap: 4 }}>
          <Body size="medium">{product.title || "Namnlös annons"}</Body>
          <Body
            size="small"
            color={
              product.internalValidationIssues.length ? "error" : "secondary"
            }
          >
            {product.internalValidationIssues.length
              ? product.internalValidationIssues.join(", ")
              : "Klar att skapa"}
          </Body>
        </View>
        <Icon icon={expanded ? "chevronUp" : "chevronDown"} />
      </Pressable>

      {expanded && (
        <View style={{ paddingHorizontal: 12 }}>
          <UpsertProduct
            productId={product.id}
            mode="edit"
            visible
            inline
            compact
            importMode
            internalMode
            onDelete={() => onDiscard(product.id)}
            onHide={() => setExpanded(false)}
            onInlineDraftSave={onDraftSave}
            onPublished={() => {
              setExpanded(false);
            }}
          />
        </View>
      )}
    </View>
  );
};

const ImportProgress = ({ progress }: { progress: number }) => {
  const colors = useThemeColor();
  const width = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(width, {
      toValue: Math.max(0, Math.min(progress, 100)),
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [progress, width]);

  return (
    <View
      style={{
        gap: 8,
        backgroundColor: colors.buttons.tonal.enabled,
        borderRadius: borderRadius.medium,
        padding: 16,
      }}
    >
      <Label size="medium">Importerar annonser...</Label>
      <View
        style={{
          height: 4,
          borderRadius: borderRadius.small,
          backgroundColor: colors.background.neutral,
          overflow: "hidden",
        }}
      >
        <Animated.View
          style={{
            height: "100%",
            borderRadius: borderRadius.small,
            backgroundColor: colors.buttons.filled.enabled,
            width: width.interpolate({
              inputRange: [0, 100],
              outputRange: ["0%", "100%"],
            }),
          }}
        />
      </View>
      <Body size="small" color="secondary">
        Läser filer och skapar förslag till dina annonser.
      </Body>
    </View>
  );
};

const FileChip = ({
  file,
  onRemove,
}: {
  file: FileType;
  onRemove: () => void;
}) => {
  const isImage = file.mimeType.startsWith("image/");
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        borderRadius: borderRadius.medium,
        backgroundColor: primitives.accent100,
        padding: 12,
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: borderRadius.small,
          backgroundColor: primitives.neutrals100,
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {isImage ? (
          <Image
            source={{ uri: file.uri ?? PlaceholderProduct.uri }}
            style={{ width: "100%", height: "100%" }}
          />
        ) : (
          <Icon icon="file" size={18} />
        )}
      </View>
      <View style={{ flex: 1 }}>
        <Body size="small" numberOfLines={1}>
          {file.name ?? "Fil"}
        </Body>
      </View>
      <Button label="Ta bort" type="text" onPress={onRemove} />
    </View>
  );
};
