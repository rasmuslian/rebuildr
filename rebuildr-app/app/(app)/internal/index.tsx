import {
  CreateInternalAdDraftMutation,
  CreateInternalAdImportBatchMutation,
  CreateInternalAdImportBatchMutationVariables,
  InternalAdImportBatchQuery,
  InternalAdImportBatchQueryVariables,
  InternalAdImportBatchStatusEnum,
  InternalAdsDashboardXlsxQuery,
  InternalAdsDashboardXlsxQueryVariables,
  InternalAdsDashboardInput,
  InternalAdsDashboardQuery,
  InternalAdsDashboardQueryVariables,
  InternalAdsHomeQuery,
  InternalAdsHomeQueryVariables,
  ProductAvailabilityEnum,
  ProductStatusEnum,
  PublishInternalAdDraftsMutation,
  PublishInternalAdDraftsMutationVariables,
} from "@/gql/graphql";
import {
  CREATE_INTERNAL_AD_DRAFT,
  CREATE_INTERNAL_AD_IMPORT_BATCH,
  INTERNAL_AD_IMPORT_BATCH,
  INTERNAL_ADS_DASHBOARD_QUERY,
  INTERNAL_ADS_DASHBOARD_XLSX,
  INTERNAL_ADS_HOME_QUERY,
  PUBLISH_INTERNAL_AD_DRAFTS,
  REMOVE_INTERNAL_AD_DRAFT,
  REMOVE_INTERNAL_AD_IMPORT_BATCH,
  START_INTERNAL_AD_IMPORT_BATCH,
} from "@/queries/internal-ads";
import { gql, useLazyQuery, useMutation, useQuery } from "@apollo/client";
import MainBackground from "@assets/images/main-background.png";
import PlaceholderProduct from "@assets/images/placeholder-product.png";
import { AdGridSection } from "@components/ad-grid-section/ad-grid-section";
import { Button } from "@components/buttons/button";
import { SelectInput } from "@components/forms/selectInput";
import { InternalCategoryGrid } from "@components/internal/internal-category-grid";
import { InternalProjectGrid } from "@components/internal/internal-project-grid";
import {
  InternalDashboardPreset,
  InternalStatisticsSection,
} from "@components/internal/internal-statistics-section";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import Footer from "@components/navigation/footer";
import { InternalTopBar } from "@components/navigation/internal-top-bar/internal-top-bar";
import { Search } from "@components/search/search";
import { SectionHeader } from "@components/sections/section-header";
import { SlideInSheet } from "@components/slide-in-sheet/slide-in-sheet";
import {
  Body,
  Display,
  Headline,
  Label,
  Title,
} from "@components/typography/text";
import { InternalLocation } from "@components/upsert-product/internal-location";
import { ProjectChips } from "@components/upsert-product/project-chips";
import { UpsertProduct } from "@components/upsert-product/upsert-product";
import { FileType, ProductFields } from "@components/upsert-product/types";
import { primitives } from "@constants/colors";
import { isWeb, MAX_CONTENT_WIDTH, screenGrowStyle } from "@constants/layout";
import { borderRadius, horizontalPadding } from "@constants/sizes";
import { useSearchContext } from "@context/search-context";
import { useDocumentHandler } from "@hooks/use-document-handler";
import { useScreenType } from "@hooks/useScreenType";
import { useThemeColor } from "@hooks/useThemeColor";
import { INTERNAL_PROJECTS } from "@/queries/internal-projects";
import { Icon } from "@icons/icon";
import { downloadXlsx } from "@/utils/download-xlsx";
import dayjs from "dayjs";
import { Image } from "expo-image";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Animated, ImageBackground, Pressable, View } from "react-native";

const SECTION_PAGE_SIZE = 10;
const getDashboardInput = (
  preset: InternalDashboardPreset,
): InternalAdsDashboardInput => {
  if (preset === "ALL") return {};
  const today = dayjs();
  const from =
    preset === "MONTH"
      ? today.startOf("month")
      : preset === "QUARTER"
        ? today.month(Math.floor(today.month() / 3) * 3).startOf("month")
        : today.startOf("year");
  return {
    from: from.format("YYYY-MM-DD"),
    to: today.format("YYYY-MM-DD"),
  };
};
const ORGANIZATION_MEMBERS = gql`
  query OrganizationMembersForActions {
    organizationMembers {
      id
      name
      email
    }
  }
`;

type InternalAdsHomeData = InternalAdsHomeQuery & {
  internalAdsCategories: Array<{
    category: {
      id: string;
      name: string;
      image?: { url: string } | null;
    };
  }>;
};

export default function InternalAdsPage() {
  const colors = useThemeColor();
  const { isDesktop } = useScreenType();
  const params = useLocalSearchParams<{
    action?: string;
    productId?: string;
    t?: string;
  }>();
  const searchContext = useSearchContext();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [heroHeight, setHeroHeight] = useState(0);
  const [showSearchBarTopBar, setShowSearchBarTopBar] = useState(false);
  const [editorProductId, setEditorProductId] = useState<string>();
  const [showEditor, setShowEditor] = useState(false);
  const [isNewInternalAd, setIsNewInternalAd] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileType[]>([]);
  const [activeBatchId, setActiveBatchId] = useState<string>();
  const [pollBatch, setPollBatch] = useState(false);
  const [publishRequested, setPublishRequested] = useState(false);
  const [dashboardPreset, setDashboardPreset] =
    useState<InternalDashboardPreset>("YEAR");
  const [displayedDashboardPreset, setDisplayedDashboardPreset] =
    useState<InternalDashboardPreset>("YEAR");
  const [displayedDashboard, setDisplayedDashboard] =
    useState<InternalAdsDashboardQuery["internalAdsDashboard"]>();
  const [dashboardDownloadError, setDashboardDownloadError] =
    useState<string>();
  const [importMemberId, setImportMemberId] = useState<string>();
  const [importPlacement, setImportPlacement] = useState<
    Partial<ProductFields>
  >({});
  const handledCreateAction = useRef<string | undefined>(undefined);
  const importedDraftSaves = useRef(new Set<Promise<boolean | undefined>>());
  const { pickDocuments } = useDocumentHandler();
  const dashboardInput = useMemo(
    () => getDashboardInput(dashboardPreset),
    [dashboardPreset],
  );

  const { data, loading, refetch } = useQuery<
    InternalAdsHomeData,
    InternalAdsHomeQueryVariables
  >(INTERNAL_ADS_HOME_QUERY, {
    variables: { limit: SECTION_PAGE_SIZE },
    fetchPolicy: "cache-and-network",
  });
  const { data: dashboardData, refetch: refetchDashboard } = useQuery<
    InternalAdsDashboardQuery,
    InternalAdsDashboardQueryVariables
  >(INTERNAL_ADS_DASHBOARD_QUERY, {
    variables: { input: dashboardInput },
    fetchPolicy: "cache-and-network",
  });

  useEffect(() => {
    const dashboard = dashboardData?.internalAdsDashboard;
    if (
      !dashboard ||
      dashboard.from !== (dashboardInput.from ?? null) ||
      dashboard.to !== (dashboardInput.to ?? null)
    )
      return;
    setDisplayedDashboard(dashboard);
    setDisplayedDashboardPreset(dashboardPreset);
  }, [dashboardData, dashboardInput, dashboardPreset]);

  const [loadDashboardXlsx, { loading: downloadingDashboard }] = useLazyQuery<
    InternalAdsDashboardXlsxQuery,
    InternalAdsDashboardXlsxQueryVariables
  >(INTERNAL_ADS_DASHBOARD_XLSX, { fetchPolicy: "network-only" });

  const onDownloadDashboard = async () => {
    setDashboardDownloadError(undefined);
    try {
      const result = await loadDashboardXlsx({
        variables: { input: dashboardInput },
      });
      const xlsx = result.data?.internalAdsDashboardXlsx;
      if (!xlsx) throw new Error("Missing XLSX");
      const organizationName =
        data?.internalAdsOrganizationContext?.organization.name ?? "aterbanken";
      await downloadXlsx(
        xlsx,
        `${organizationName}-${dashboardPreset.toLowerCase()}-${dayjs().format("YYYY-MM-DD")}.xlsx`,
      );
    } catch {
      setDashboardDownloadError("Underlaget kunde inte laddas ner.");
    }
  };

  const { data: membersData } = useQuery<{
    organizationMembers: { id: string; name: string; email: string }[];
  }>(ORGANIZATION_MEMBERS);

  const { data: projectsData, refetch: refetchProjects } = useQuery<any>(
    INTERNAL_PROJECTS,
    {
      variables: { input: {}, limit: 4, offset: 0 },
    },
  );

  useEffect(() => {
    if (!isWeb || typeof window === "undefined") return;
    const onScroll = () => scrollY.setValue(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [scrollY]);

  useEffect(() => {
    if (heroHeight === 0) return;

    const listener = scrollY.addListener(({ value }) => {
      setShowSearchBarTopBar(value > heroHeight - 48);
    });

    return () => scrollY.removeListener(listener);
  }, [heroHeight, scrollY]);

  useFocusEffect(
    useCallback(() => {
      searchContext.setSearchState({
        dropdownVisible: false,
        internalSearchData: undefined,
        searchString: undefined,
        completedSearchString: undefined,
        searchScope: "internal",
      });
      refetchProjects().catch(() => undefined);
      if (typeof document === "undefined") return;
      document.body.style.backgroundColor = primitives.neutrals100;
      return () => {
        document.body.style.backgroundColor = "";
      };
    }, [refetchProjects, searchContext.setSearchState]),
  );

  const { data: batchData, refetch: refetchBatch } = useQuery<
    InternalAdImportBatchQuery,
    InternalAdImportBatchQueryVariables
  >(INTERNAL_AD_IMPORT_BATCH, {
    variables: { batchId: activeBatchId ?? "" },
    skip: !activeBatchId,
    pollInterval: pollBatch ? 3000 : 0,
  });

  const [createDraft, { loading: creatingDraft }] = useMutation(
    CREATE_INTERNAL_AD_DRAFT,
  );
  const [publishImported, { loading: publishingImported }] = useMutation<
    PublishInternalAdDraftsMutation,
    PublishInternalAdDraftsMutationVariables
  >(PUBLISH_INTERNAL_AD_DRAFTS);
  const [removeDraft] = useMutation(REMOVE_INTERNAL_AD_DRAFT);
  const [removeImportBatch] = useMutation(REMOVE_INTERNAL_AD_IMPORT_BATCH);
  const [createBatch, { loading: creatingBatch }] = useMutation(
    CREATE_INTERNAL_AD_IMPORT_BATCH,
  );
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
    setIsNewInternalAd(true);
    setShowEditor(true);
  }, [createDraft]);

  useEffect(() => {
    if (params.action !== "create" || !params.t) return;
    if (handledCreateAction.current === params.t) return;
    handledCreateAction.current = params.t;
    onCreateInternalAd();
  }, [onCreateInternalAd, params.action, params.t]);

  useEffect(() => {
    if (params.action !== "edit" || !params.productId || !params.t) return;
    if (handledCreateAction.current === params.t) return;
    handledCreateAction.current = params.t;
    setEditorProductId(params.productId);
    setIsNewInternalAd(false);
    setShowEditor(true);
  }, [params.action, params.productId, params.t]);

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
    if (
      !selectedFiles.length ||
      !importMemberId ||
      (!importPlacement.project && !importPlacement.location)
    )
      return;
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
          projectId: importPlacement.project?.id,
          location: importPlacement.project
            ? undefined
            : importPlacement.location,
        },
        organizationMemberId: importMemberId,
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
        response.uploadUrls.map((uploadUrl: string, index: number) =>
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
    setImportPlacement({});
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
      await Promise.all([refetch(), refetchDashboard(), refetchBatch()]);
      if (!hasRemainingDrafts) {
        setPollBatch(false);
        setActiveBatchId(undefined);
        importBatchId.current = undefined;
        setSelectedFiles([]);
        setImportPlacement({});
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
  const availableNowProducts = data?.availableNow.products ?? [];
  const upcomingProducts = data?.upcoming.products ?? [];
  const externallyPublishedProducts = data?.externallyPublished.products ?? [];
  const maxVisibleProducts = isDesktop ? 4 : SECTION_PAGE_SIZE;
  const hasAccess = !!data?.internalAdsOrganizationContext;
  const hasImport =
    (!discardingImport && !!batch) ||
    uploadingImport ||
    creatingBatch ||
    startingBatch;
  const visibleBatch = discardingImport ? undefined : batch;

  const getAdGridProducts = (
    products: Array<
      (typeof activeProducts)[number] | (typeof availableNowProducts)[number]
    >,
  ) =>
    products.slice(0, maxVisibleProducts).map((product) => ({
      id: product.id,
      title: product.title,
      price: product.price,
      hidePrice: true,
      imageUri: product.primaryImage?.url,
      quantity: product.primaryQuantity,
      quantityUnit: product.primaryUnit,
      condition: product.condition,
      soldByQuantity: product.soldByQuantity,
      status: product.status,
      upcoming: product.availability === ProductAvailabilityEnum.Upcoming,
      overlayText:
        product.status === ProductStatusEnum.Sold ? "Såld" : undefined,
      imageBadgeText:
        "publiclyAvailable" in product && product.publiclyAvailable
          ? "Externt publicerad"
          : undefined,
      onPress: () =>
        router.navigate({
          pathname: "/internal/[productId]",
          params: { productId: product.id },
        }),
    }));
  const adGridProducts = getAdGridProducts(activeProducts);
  const content = (
    <>
      <ImageBackground
        source={MainBackground}
        resizeMode="cover"
        imageStyle={{ opacity: 0.6, tintColor: primitives.accent900 }}
        style={{
          backgroundColor: primitives.accent100,
          overflow: "hidden",
          width: "100%",
        }}
        onLayout={(event) => setHeroHeight(event.nativeEvent.layout.height)}
      >
        <View
          style={{
            alignSelf: "center",
            gap: isDesktop ? 32 : 24,
            maxWidth: MAX_CONTENT_WIDTH,
            paddingBottom: isDesktop ? 64 : 36,
            paddingHorizontal: isDesktop
              ? horizontalPadding.desktop
              : horizontalPadding.mobile,
            paddingTop: isDesktop ? 64 : 36,
            width: "100%",
          }}
        >
          <View style={{ maxWidth: 820 }}>
            <Headline
              size={isDesktop ? "large" : "medium"}
              heading={1}
              style={{ maxWidth: 780 }}
            >
              Material, verktyg och resurser som bara cirkulerar inom er
              organisation.
            </Headline>
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
                placeholder="Vad letar du efter?"
                searchScope="internal"
                searchOnSubmit
              />
              <View style={{ flexDirection: "row", gap: 12, flexWrap: "wrap" }}>
                <Button
                  label="Ny annons"
                  onPress={onCreateInternalAd}
                  loading={creatingDraft}
                  theme="light"
                  style={isDesktop ? undefined : { flex: 1, minWidth: 0 }}
                />
                <Button
                  label="Importera annonser"
                  icon="upload"
                  type="outlined"
                  theme="light"
                  onPress={() => setShowImport(true)}
                  style={isDesktop ? undefined : { flex: 2, minWidth: 0 }}
                />
              </View>
            </View>
          )}
        </View>
      </ImageBackground>

      <View
        style={{
          backgroundColor: colors.background.neutral,
          flexGrow: 1,
          width: "100%",
        }}
      >
        <View
          style={{
            alignSelf: "center",
            flexGrow: 1,
            maxWidth: MAX_CONTENT_WIDTH,
            minHeight: 420,
            paddingBottom: 32,
            paddingHorizontal: isDesktop
              ? horizontalPadding.desktop
              : horizontalPadding.mobile,
            paddingTop: isDesktop ? 44 : 16,
            width: "100%",
          }}
        >
          {hasAccess && displayedDashboard && (
            <View style={{ marginBottom: isDesktop ? 48 : 32 }}>
              <InternalStatisticsSection
                statistics={displayedDashboard}
                preset={displayedDashboardPreset}
                selectedPreset={dashboardPreset}
                onPresetChange={setDashboardPreset}
                onDownload={onDownloadDashboard}
                downloading={downloadingDashboard}
                downloadError={dashboardDownloadError}
              />
            </View>
          )}
          {hasAccess && !!data?.internalAdsCategories.length && (
            <View style={{ marginBottom: isDesktop ? 48 : 32 }}>
              <InternalCategoryGrid categories={data.internalAdsCategories} />
            </View>
          )}
          {hasAccess && (
            <View style={{ gap: 16, marginBottom: isDesktop ? 48 : 32 }}>
              <SectionHeader
                onPress={() => router.navigate("/internal/projects")}
                buttonTitle={isDesktop ? "Visa alla" : undefined}
              >
                Projekt
              </SectionHeader>
              {(projectsData?.internalProjects.projects ?? []).length ? (
                <InternalProjectGrid
                  landing
                  projects={projectsData.internalProjects.projects}
                  onProjectPress={(projectId) =>
                    router.navigate({
                      pathname: "/internal/projects/[projectId]",
                      params: { projectId },
                    } as any)
                  }
                />
              ) : (
                <View style={{ gap: 8, maxWidth: 560 }}>
                  <Body size="medium" color="secondary">
                    Samla annonser som hör till samma projekt.
                  </Body>
                  <Button
                    label="Skapa projekt"
                    type="outlined"
                    onPress={() =>
                      router.navigate({
                        pathname: "/internal/projects",
                        params: {
                          action: "create",
                          t: Date.now().toString(),
                        },
                      })
                    }
                    style={{ alignSelf: "flex-start", marginTop: 8 }}
                  />
                </View>
              )}
            </View>
          )}
          {loading && !data ? (
            <LoadingSpinner />
          ) : !hasAccess ? (
            <AccessEmptyState />
          ) : activeProducts.length ? (
            <View style={{ gap: 48 }}>
              {!!availableNowProducts.length && (
                <AdGridSection
                  header="Tillgänglig nu"
                  onHeaderPress={() =>
                    router.navigate({
                      pathname: "/internal/search",
                      params: {
                        availability: ProductAvailabilityEnum.Available,
                      },
                    })
                  }
                  products={getAdGridProducts(availableNowProducts)}
                />
              )}
              {!!upcomingProducts.length && (
                <AdGridSection
                  header="Kommande"
                  onHeaderPress={() =>
                    router.navigate({
                      pathname: "/internal/search",
                      params: {
                        availability: ProductAvailabilityEnum.Upcoming,
                      },
                    })
                  }
                  products={getAdGridProducts(upcomingProducts)}
                />
              )}
              {!!externallyPublishedProducts.length && (
                <AdGridSection
                  header="Externt publicerat"
                  onHeaderPress={() =>
                    router.navigate({
                      pathname: "/internal/search",
                      params: { publiclyAvailable: "true" },
                    })
                  }
                  products={getAdGridProducts(externallyPublishedProducts)}
                />
              )}
              <AdGridSection
                header="Senast inkomna"
                onHeaderPress={() => router.navigate("/internal/search")}
                products={adGridProducts}
              />
            </View>
          ) : (
            <View style={{ gap: 8, maxWidth: 560 }}>
              <Title size="large">Inga annonser ännu</Title>
              <Body size="medium" color="secondary">
                Skapa en annons eller importera flera annonser från filer.
              </Body>
            </View>
          )}
        </View>
      </View>

      <Footer />
    </>
  );

  return (
    <View
      style={[
        isWeb ? screenGrowStyle : { flex: 1 },
        { backgroundColor: primitives.neutrals100 },
      ]}
    >
      <InternalTopBar
        home
        showSearchBar={showSearchBarTopBar}
        onCreateAd={onCreateInternalAd}
      />

      {isWeb ? (
        content
      ) : (
        <Animated.ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          scrollEventThrottle={8}
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true },
          )}
        >
          {content}
        </Animated.ScrollView>
      )}

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
            <View style={{ paddingTop: 60 }}>
              <Button
                label="Starta import"
                onPress={onStartImport}
                loading={creatingBatch || startingBatch}
                disabled={
                  !selectedFiles.length ||
                  !importMemberId ||
                  (!importPlacement.project && !importPlacement.location)
                }
              />
            </View>
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
        {!hasImport && (
          <View style={{ gap: 24 }}>
            <View style={{ gap: 6, zIndex: 100 }}>
              <Display size="small">Vem lägger upp annonserna?</Display>
              <SelectInput
                value={importMemberId}
                searchable
                searchPlaceholder="Sök person"
                options={(membersData?.organizationMembers ?? []).map(
                  (member) => ({ value: member.id, label: member.name }),
                )}
                onSelect={setImportMemberId}
                placeholder="Välj person"
              />
              {!membersData?.organizationMembers.length && (
                <Body size="small" color="secondary">
                  Lägg först till en person under Organisationsmedlemmar.
                </Body>
              )}
            </View>
            <View style={{ gap: 12 }}>
              <ProjectChips
                product={importPlacement}
                update={(partial) =>
                  setImportPlacement((current) => ({ ...current, ...partial }))
                }
                internalMode
              />
              {!importPlacement.project && (
                <InternalLocation
                  product={importPlacement}
                  update={(partial) =>
                    setImportPlacement((current) => ({
                      ...current,
                      ...partial,
                    }))
                  }
                />
              )}
            </View>
          </View>
        )}
      </SlideInSheet>

      {editorProductId && (
        <UpsertProduct
          key={editorProductId}
          productId={editorProductId}
          mode="edit"
          visible={showEditor}
          internalMode
          isNewInternalAd={isNewInternalAd}
          organizationMembers={membersData?.organizationMembers ?? []}
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
    <Title size="large">Du saknar tillgång till Återbanken</Title>
    <Body size="large" color="secondary">
      Be en organisationsadmin eller RebuildR-admin att aktivera Återbanken för
      ert företagskonto.
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
        <View style={{ gap: 8 }}>
          <Display size="small">Ladda upp filer</Display>
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
              <Body
                size="small"
                color="secondary"
                style={{ textAlign: "center" }}
              >
                Bilder, dokument och listor kan laddas upp tillsammans.
              </Body>
            </View>
          </Pressable>
        </View>
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
  const [validationIssues, setValidationIssues] = useState(
    product.internalValidationIssues,
  );

  useEffect(() => {
    setValidationIssues(product.internalValidationIssues);
  }, [product.internalValidationIssues]);

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
            color={validationIssues.length ? "error" : "secondary"}
          >
            {validationIssues.length
              ? validationIssues.join(", ")
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
            onInternalLocationSaveStart={() =>
              setValidationIssues((issues) =>
                issues.filter((issue) => issue !== "Plats saknas"),
              )
            }
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
