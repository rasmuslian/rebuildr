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
import { ImageBackground, Pressable, ScrollView, View } from "react-native";

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
  const [publishedBatchId, setPublishedBatchId] = useState<string>();
  const handledCreateAction = useRef<string | undefined>(undefined);
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
    pollInterval: activeBatchId ? 3000 : 0,
  });

  const [createDraft, { loading: creatingDraft }] =
    useMutation<CreateInternalAdDraftMutation>(CREATE_INTERNAL_AD_DRAFT);
  const [publishImported, { loading: publishingImported }] = useMutation<
    PublishInternalAdDraftsMutation,
    PublishInternalAdDraftsMutationVariables
  >(PUBLISH_INTERNAL_AD_DRAFTS);
  const [createBatch, { loading: creatingBatch }] = useMutation<
    CreateInternalAdImportBatchMutation,
    CreateInternalAdImportBatchMutationVariables
  >(CREATE_INTERNAL_AD_IMPORT_BATCH);
  const [startBatch, { loading: startingBatch }] = useMutation(
    START_INTERNAL_AD_IMPORT_BATCH,
  );

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

  const batch = batchData?.internalAdImportBatch;
  const importedProducts = batch?.products ?? [];
  const validImportedProductIds = importedProducts
    .filter((product) => !product.internalValidationIssues.length)
    .map((product) => product.id);
  const productsNeedingReview = importedProducts.filter(
    (product) => !!product.internalValidationIssues.length,
  );

  useEffect(() => {
    if (!batch || batch.status !== InternalAdImportBatchStatusEnum.Ready)
      return;
    if (publishedBatchId === batch.id || !validImportedProductIds.length)
      return;

    publishImported({
      variables: { productIds: validImportedProductIds },
    }).then(() => {
      setPublishedBatchId(batch.id);
      refetch();
      refetchBatch();
    });
  }, [
    batch,
    publishedBatchId,
    publishImported,
    refetch,
    refetchBatch,
    validImportedProductIds.join(","),
  ]);

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
    const created = await createBatch({
      variables: {
        input: {
          files: selectedFiles.map((file) => ({
            mimeType: file.mimeType,
            name: file.name,
          })),
        },
      },
    });
    const response = created.data?.createInternalAdImportBatch;
    if (!response) return;
    await Promise.all(
      response.uploadUrls.map((uploadUrl, index) =>
        fetch(uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": selectedFiles[index].mimeType },
          body: selectedFiles[index].file,
        }),
      ),
    );
    setActiveBatchId(response.batch.id);
    setPublishedBatchId(undefined);
    setSelectedFiles([]);
    await startBatch({ variables: { batchId: response.batch.id } });
    await refetchBatch();
  };

  const activeProducts = data?.internalAds.products ?? [];
  const total = data?.internalAds.total ?? 0;
  const organizationName =
    data?.internalAdsOrganizationContext?.organization.name ??
    data?.internalAdsOrganizationContext?.organization.username ??
    "Internlagret";
  const hasAccess = !!data?.internalAdsOrganizationContext;

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
            pathname: "/internal-ads/[productId]",
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
          <Button
            label="Starta import"
            onPress={onStartImport}
            loading={creatingBatch || startingBatch || publishingImported}
            disabled={!selectedFiles.length}
          />
        }
      >
        <ImportPanel
          files={selectedFiles}
          batch={batch}
          productsNeedingReview={productsNeedingReview}
          onPickFiles={onPickFiles}
          onRemoveFile={onRemoveFile}
          onEditProduct={(productId) => {
            setEditorProductId(productId);
            setShowEditor(true);
            setShowImport(false);
          }}
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
  productsNeedingReview: InternalAdImportBatchQuery["internalAdImportBatch"]["products"];
  onPickFiles: () => void;
  onRemoveFile: (index: number) => void;
  onEditProduct: (productId: string) => void;
};

const ImportPanel = ({
  files,
  batch,
  productsNeedingReview,
  onPickFiles,
  onRemoveFile,
  onEditProduct,
}: ImportPanelProps) => {
  const colors = useThemeColor();
  return (
    <View style={{ gap: 24 }}>
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

      {!!files.length && (
        <View style={{ gap: 12 }}>
          <Label size="large">Valda filer</Label>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
            {files.map((file) => (
              <FileChip
                key={file.index}
                file={file}
                onRemove={() => onRemoveFile(file.index)}
              />
            ))}
          </View>
        </View>
      )}

      {batch && (
        <View style={{ gap: 8 }}>
          <Label size="large">Importstatus</Label>
          <Body
            size="medium"
            color={
              batch.status === InternalAdImportBatchStatusEnum.Failed
                ? "error"
                : "secondary"
            }
          >
            {batch.errorMessage ?? `${batch.progress}% klart`}
          </Body>
          {!!productsNeedingReview.length && (
            <View style={{ gap: 12, marginTop: 8 }}>
              <Label size="large">Behöver kompletteras</Label>
              {productsNeedingReview.map((product) => (
                <View key={product.id} style={{ gap: 8 }}>
                  <Body size="medium">{product.title || "Namnlös annons"}</Body>
                  <Body size="small" color="error">
                    {product.internalValidationIssues.join(", ")}
                  </Body>
                  <Button
                    label="Öppna annons"
                    type="tonal"
                    onPress={() => onEditProduct(product.id)}
                  />
                </View>
              ))}
            </View>
          )}
        </View>
      )}
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
  const colors = useThemeColor();
  const isImage = file.mimeType.startsWith("image/");
  return (
    <View
      style={{
        width: 140,
        gap: 8,
        borderRadius: borderRadius.medium,
        backgroundColor: colors.background.secondary,
        padding: 8,
      }}
    >
      <View
        style={{
          height: 96,
          borderRadius: borderRadius.small,
          backgroundColor: colors.card.message,
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
          <Icon icon="upload" />
        )}
      </View>
      <Body size="small" numberOfLines={1}>
        {file.name ?? "Fil"}
      </Body>
      <Button label="Ta bort" type="text" onPress={onRemove} />
    </View>
  );
};
