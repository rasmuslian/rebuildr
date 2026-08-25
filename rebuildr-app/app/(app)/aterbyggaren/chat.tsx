import { useReactiveVar } from "@apollo/client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import Head from "expo-router/head";
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Markdown, { MarkdownIt } from "react-native-markdown-display";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Image,
  LayoutChangeEvent,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";

import { ProductConditionEnum } from "@/gql/graphql";
import { isLoggedInVar } from "@/apollo/config";
import {
  AUTH_SESSION_EXPIRED_MESSAGE,
  getAuthHeaders,
  renewStoredAuthTokens,
} from "@/lib/auth-tokens";
import {
  AterbyggarenLocalAttachment,
  AterbyggarenPromptAttachment,
  consumePendingAterbyggarenChatInput,
  createAterbyggarenAttachmentId,
  uploadAterbyggarenAttachments,
} from "@/lib/aterbyggaren-attachments";
import { formatPrice } from "@/utils/formattings";
import PlaceholderProduct from "@assets/images/placeholder-product.png";
import { AterbyggarenPageHeader } from "@components/aterbyggaren/page-header";
import { AterbyggarenPromptBox } from "@components/aterbyggaren/prompt-box";
import TopBar from "@components/navigation/top-bar/top-bar";
import { Body, Headline, Label, Title } from "@components/typography/text";
import { primitives } from "@constants/colors";
import { conditions } from "@constants/conditions";
import { borderRadius, horizontalPadding } from "@constants/sizes";
import { useDocumentHandler } from "@hooks/use-document-handler";
import { useScreenType } from "@hooks/useScreenType";
import { useLikeProduct } from "@hooks/useLikeProduct";
import { useThemeColor } from "@hooks/useThemeColor";
import { Icon } from "@icons/icon";

type ChatSummary = {
  id: string;
  title?: string;
  createdAt: string;
  updatedAt: string;
};

type ChatMessage = {
  attachments?: AterbyggarenPromptAttachment[];
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt?: string;
  pending?: boolean;
  streaming?: boolean;
  productDisplays?: ProductDisplay[] | null;
};

type DisplayedProduct = {
  id: string;
  title: string;
  description?: string;
  price: number;
  isGiveaway: boolean;
  condition: ProductConditionEnum;
  category?: string;
  brand?: string;
  pickupEnabled: boolean;
  deliveryEnabled: boolean;
  likedByMe?: boolean | null;
  url: string;
  imageUrl?: string;
};

type ProductDisplay = {
  type: "products";
  products: DisplayedProduct[];
};

type MaterialListItem = {
  id: string;
  label: string;
  query: string;
};

type MaterialListDisplay = {
  title: string;
  items: MaterialListItem[];
};

type StreamEvent = {
  event: string;
  data: unknown;
};

type ActiveStream = {
  id: number;
  abortController: AbortController;
};

const GUEST_ID_KEY = "aterbyggaren_guest_id";
const CHAT_LAYOUT_MAX_WIDTH = 640;
const CHAT_PRODUCT_GRID_GAP = 12;
const CHAT_PRODUCT_DESKTOP_COLUMNS = 3;
const CHAT_PRODUCT_DESKTOP_CARD_WIDTH =
  (CHAT_LAYOUT_MAX_WIDTH -
    CHAT_PRODUCT_GRID_GAP * (CHAT_PRODUCT_DESKTOP_COLUMNS - 1)) /
  CHAT_PRODUCT_DESKTOP_COLUMNS;
const CHAT_PRODUCT_TITLE_HEIGHT = 32;
const CHAT_PRODUCT_DETAIL_HEIGHT = 16;
const STREAM_TEXT_FADE_DURATION = 260;
const STREAM_TEXT_FADE_STAGGER = 28;
const STREAM_TEXT_FADE_TAIL = 260;
const STREAM_TEXT_MAX_BACKLOG = 180;
const CHAT_NOT_FOUND_MESSAGE = "Chatten kunde inte hittas";

const markdownFadeParser = MarkdownIt({ typographer: true });

const apiUrl = process.env.EXPO_PUBLIC_API_URL;

const getGuestId = async () => {
  const existingGuestId = await AsyncStorage.getItem(GUEST_ID_KEY);
  if (existingGuestId) return existingGuestId;

  const guestId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  await AsyncStorage.setItem(GUEST_ID_KEY, guestId);
  return guestId;
};

const readJson = async <T,>(path: string): Promise<T> => {
  let response = await fetch(`${apiUrl}${path}`, {
    headers: await getAuthHeaders(),
  });

  if (response.status === 401) {
    await renewStoredAuthTokens();
    response = await fetch(`${apiUrl}${path}`, {
      headers: await getAuthHeaders(),
    });
  }

  if (!response.ok) {
    throw new Error(
      (await readResponseErrorMessage(response)) ?? "Request failed",
    );
  }
  return response.json();
};

type SendMessageOverride =
  | string
  | { attachments?: AterbyggarenLocalAttachment[]; message?: string };

export default function AterbyggarenChatPage() {
  const colors = useThemeColor();
  const { isDesktop } = useScreenType();
  const { height: windowHeight } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);
  const initialQuestionSentRef = useRef(false);
  const activeChatIdRef = useRef<string | undefined>(undefined);
  const activeStreamRef = useRef<ActiveStream | undefined>(undefined);
  const stableMobileWindowHeightRef = useRef(windowHeight);
  const streamSequenceRef = useRef(0);
  const { pickDocument } = useDocumentHandler();
  const params = useLocalSearchParams<{ question?: string; chatId?: string }>();
  const isLoggedIn = useReactiveVar(isLoggedInVar);
  const [chats, setChats] = useState<ChatSummary[]>([]);
  const [activeChatId, setActiveChatIdState] = useState<string>();
  const [activeChatTitle, setActiveChatTitle] = useState<string>();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<AterbyggarenLocalAttachment[]>(
    [],
  );
  const [loadingChat, setLoadingChat] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string>();
  const [topBarHeight, setTopBarHeight] = useState(0);
  if (isDesktop || windowHeight > stableMobileWindowHeightRef.current) {
    stableMobileWindowHeightRef.current = windowHeight;
  }
  const pageWindowHeight = isDesktop
    ? windowHeight
    : stableMobileWindowHeightRef.current;

  const handleTopBarLayout = useCallback((event: LayoutChangeEvent) => {
    setTopBarHeight(event.nativeEvent.layout.height);
  }, []);

  const setActiveChatId = useCallback((chatId?: string) => {
    activeChatIdRef.current = chatId;
    setActiveChatIdState(chatId);
  }, []);

  const cancelActiveStream = useCallback(() => {
    const activeStream = activeStreamRef.current;
    activeStreamRef.current = undefined;
    activeStream?.abortController.abort();
    setStreaming(false);
  }, []);

  const focusChatInput = useCallback(() => {
    if (!isDesktop) return;
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [isDesktop]);

  const handlePickFile = useCallback(async () => {
    try {
      const document = await pickDocument();
      if (!document) return;
      const isImage = document.mimeType.startsWith("image/");

      setAttachments((current) => [
        ...current,
        {
          id: createAterbyggarenAttachmentId(isImage ? "image" : "document"),
          file: document.file,
          kind: isImage ? "image" : "document",
          mimeType: document.mimeType,
          name: document.name,
          uri: document.uri,
        },
      ]);
      focusChatInput();
    } catch {
      setError("Kunde inte lägga till filen.");
    }
  }, [focusChatInput, pickDocument]);

  const handleRemoveAttachment = useCallback((attachmentId: string) => {
    setAttachments((current) =>
      current.filter((attachment) => attachment.id !== attachmentId),
    );
  }, []);

  useEffect(() => {
    return () => {
      const activeStream = activeStreamRef.current;
      activeStreamRef.current = undefined;
      activeStream?.abortController.abort();
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (typeof document === "undefined") return;
      document.body.style.backgroundColor = primitives.secondary100;
      return () => {
        document.body.style.backgroundColor = "";
      };
    }, []),
  );

  useFocusEffect(
    useCallback(() => {
      focusChatInput();
    }, [focusChatInput]),
  );

  const loadChats = useCallback(async () => {
    if (!isLoggedIn) {
      setChats([]);
      return;
    }
    try {
      const nextChats = await readJson<ChatSummary[]>("/aterbyggaren/chats");
      setChats(nextChats);
    } catch {
      setError("Kunde inte hämta chatthistoriken.");
    }
  }, [isLoggedIn]);

  useFocusEffect(
    useCallback(() => {
      loadChats();
    }, [loadChats]),
  );

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  useEffect(() => {
    if (!activeChatId || activeChatTitle) return;
    setActiveChatTitle(
      chats.find((chat) => chat.id === activeChatId)?.title ?? undefined,
    );
  }, [activeChatId, activeChatTitle, chats]);

  const scrollToLatestMessage = useCallback(() => {
    requestAnimationFrame(() =>
      scrollRef.current?.scrollToEnd({ animated: true }),
    );
  }, []);

  useEffect(() => {
    scrollToLatestMessage();
  }, [messages, scrollToLatestMessage]);

  const loadMessages = useCallback(
    async (chatId: string) => {
      cancelActiveStream();
      setLoadingChat(true);
      setError(undefined);
      try {
        const nextMessages = await readJson<ChatMessage[]>(
          `/aterbyggaren/chats/${chatId}/messages`,
        );
        setActiveChatId(chatId);
        setActiveChatTitle(
          chats.find((chat) => chat.id === chatId)?.title ?? undefined,
        );
        setMessages(nextMessages);
      } catch {
        setError("Kunde inte öppna chatten.");
      } finally {
        setLoadingChat(false);
        focusChatInput();
      }
    },
    [cancelActiveStream, chats, focusChatInput, setActiveChatId],
  );

  const startNewChat = () => {
    cancelActiveStream();
    setActiveChatId(undefined);
    setActiveChatTitle(undefined);
    setMessages([]);
    setAttachments([]);
    setError(undefined);
    router.replace("/aterbyggaren/chat");
    focusChatInput();
  };

  const sendMessage = useCallback(
    async (override?: SendMessageOverride) => {
      const overrideMessage =
        typeof override === "string" ? override : override?.message;
      const selectedAttachments =
        typeof override === "object" && override.attachments
          ? override.attachments
          : typeof override === "string"
            ? []
            : attachments;
      const message = (overrideMessage ?? input).trim();
      const sentContent = message || "Analysera bifogade filer.";
      if (
        (!message && !selectedAttachments.length) ||
        streaming ||
        loadingChat ||
        activeStreamRef.current
      )
        return;

      setInput("");
      setAttachments([]);
      setStreaming(true);
      setError(undefined);
      focusChatInput();

      const abortController = new AbortController();
      const streamId = streamSequenceRef.current + 1;
      streamSequenceRef.current = streamId;
      activeStreamRef.current = { id: streamId, abortController };
      const isCurrentStream = () => activeStreamRef.current?.id === streamId;
      const requestChatId = activeChatIdRef.current;
      const assistantId = `assistant-${Date.now()}`;

      let previewAttachments: AterbyggarenPromptAttachment[] =
        selectedAttachments.map(({ file, ...attachment }) => attachment);
      let streamAttachments: { id: string; kind: "document" | "image" }[] = [];

      try {
        const authHeaders = await getAuthHeaders();
        const uploadedAttachments = await uploadAterbyggarenAttachments({
          apiUrl: apiUrl ?? "",
          attachments: selectedAttachments,
          headers: authHeaders,
        });
        previewAttachments = uploadedAttachments.previews;
        streamAttachments = uploadedAttachments.streamAttachments;
      } catch (e) {
        activeStreamRef.current = undefined;
        setInput(message);
        setAttachments(selectedAttachments);
        setStreaming(false);
        const messageText = e instanceof Error ? e.message : undefined;
        setError(messageText ?? "Kunde inte ladda upp filen.");
        focusChatInput();
        return;
      }

      setMessages((current) => [
        ...current,
        {
          id: `user-${Date.now()}`,
          role: "user",
          content: sentContent,
          attachments: previewAttachments,
        },
        {
          id: assistantId,
          role: "assistant",
          content: "",
          pending: true,
          streaming: true,
        },
      ]);

      try {
        const guestId = isLoggedIn ? undefined : await getGuestId();
        const createStreamResponse = async () => {
          const authHeaders = await getAuthHeaders();
          return fetch(`${apiUrl}/aterbyggaren/chat/stream`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...authHeaders,
            },
            body: JSON.stringify({
              attachments: streamAttachments,
              chatId: requestChatId,
              message: sentContent,
              guestId,
            }),
            signal: abortController.signal,
          });
        };
        let response = await createStreamResponse();

        if (!isCurrentStream()) return;

        if (response.status === 401) {
          try {
            await renewStoredAuthTokens();
            response = await createStreamResponse();
          } catch {
            throw new Error(AUTH_SESSION_EXPIRED_MESSAGE);
          }
        }

        if (!response.ok) {
          let responseMessage = await readResponseErrorMessage(response);

          if (
            responseMessage === CHAT_NOT_FOUND_MESSAGE &&
            requestChatId &&
            isLoggedIn
          ) {
            try {
              await renewStoredAuthTokens();
              response = await createStreamResponse();
              responseMessage = response.ok
                ? undefined
                : await readResponseErrorMessage(response);
            } catch {
              throw new Error(AUTH_SESSION_EXPIRED_MESSAGE);
            }
          }

          if (!response.ok) {
            throw new Error(
              responseMessage ?? "Kunde inte starta svaret. Försök igen.",
            );
          }
        }

        if (!response.body) {
          throw new Error("Kunde inte starta svaret. Försök igen.");
        }

        let receivedDone = false;
        await readEventStream(response.body, (streamEvent) => {
          if (!isCurrentStream()) return;

          if (streamEvent.event === "chat") {
            const chat = streamEvent.data as ChatSummary;
            setActiveChatId(chat.id);
            setActiveChatTitle(chat.title);
          }

          if (streamEvent.event === "title") {
            const chat = streamEvent.data as Pick<ChatSummary, "id" | "title">;
            setActiveChatTitle(chat.title);
            setChats((current) =>
              current.map((item) =>
                item.id === chat.id ? { ...item, title: chat.title } : item,
              ),
            );
          }

          if (streamEvent.event === "delta") {
            const delta = streamEvent.data as string;
            setMessages((current) =>
              current.map((item) =>
                item.id === assistantId
                  ? { ...item, content: item.content + delta, pending: false }
                  : item,
              ),
            );
          }

          if (streamEvent.event === "productDisplays") {
            const productDisplays = streamEvent.data as ProductDisplay[];
            setMessages((current) =>
              current.map((item) =>
                item.id === assistantId ? { ...item, productDisplays } : item,
              ),
            );
          }

          if (streamEvent.event === "error") {
            const payload = streamEvent.data as { message?: string };
            throw new Error(payload.message);
          }

          if (streamEvent.event === "done") {
            receivedDone = true;
          }
        });

        if (!isCurrentStream()) return;

        if (!receivedDone) {
          throw new Error("Svaret avbröts innan det blev klart. Försök igen.");
        }

        setMessages((current) =>
          current.map((item) =>
            item.id === assistantId
              ? { ...item, pending: false, streaming: false }
              : item,
          ),
        );
        loadChats();
      } catch (e) {
        if (!isCurrentStream() || isAbortError(e)) return;

        const messageText = e instanceof Error ? e.message : undefined;
        setError(messageText ?? "Något gick fel. Försök igen.");
        setMessages((current) =>
          current.filter((item) => item.id !== assistantId),
        );
      } finally {
        if (isCurrentStream()) {
          activeStreamRef.current = undefined;
          setStreaming(false);
          focusChatInput();
        }
      }
    },
    [
      attachments,
      focusChatInput,
      input,
      isLoggedIn,
      loadChats,
      loadingChat,
      setActiveChatId,
      streaming,
    ],
  );

  useEffect(() => {
    const pendingInput = consumePendingAterbyggarenChatInput();
    if (!pendingInput || initialQuestionSentRef.current) return;

    initialQuestionSentRef.current = true;
    sendMessage({
      attachments: pendingInput.attachments,
      message: pendingInput.question,
    });
  }, [sendMessage]);

  useEffect(() => {
    const chatId = Array.isArray(params.chatId)
      ? params.chatId[0]
      : params.chatId;
    if (!chatId || chatId === activeChatId) return;

    loadMessages(chatId);
  }, [activeChatId, loadMessages, params.chatId]);

  useEffect(() => {
    const question = Array.isArray(params.question)
      ? params.question[0]
      : params.question;
    if (!question?.trim() || initialQuestionSentRef.current) return;

    initialQuestionSentRef.current = true;
    sendMessage(question);
  }, [params.question, sendMessage]);

  const examples = [
    "Vilket virke passar till en enkel altan?",
    "Hitta begagnade dörrar på RebuildR",
    "Hur planerar jag materialåtgång för gipsvägg?",
  ];

  const sendMaterialSearch = useCallback(
    (items: MaterialListItem[]) => {
      if (!items.length) return;
      sendMessage(
        `Sök på RebuildR efter dessa material från materiallistan: ${items
          .map((item) => `${item.label} (sökfras: ${item.query})`)
          .join(
            "; ",
          )}. Gruppera resultatet efter materialtyp och visa produktkort.`,
      );
    },
    [sendMessage],
  );

  return (
    <>
      <Head>
        <title>RebuildR - Återbyggaren</title>
        <meta
          name="description"
          content="Chatta med Återbyggaren om bygg, renovering, hemmafix och återbruk av byggmaterial."
        />
      </Head>

      <View
        style={{
          flex: 1,
          backgroundColor: primitives.secondary100,
          height: pageWindowHeight,
          overflow: "hidden",
        }}
      >
        <View onLayout={handleTopBarLayout}>
          <TopBar theme="dark" showSearchBar={false} />
        </View>
        <View
          style={{
            backgroundColor: primitives.secondary100,
            height: Math.max(pageWindowHeight - topBarHeight, 0),
            overflow: "hidden",
          }}
        >
          <View
            style={{
              flex: 1,
              alignSelf: "center",
              maxWidth: CHAT_LAYOUT_MAX_WIDTH,
              overflow: "hidden",
              paddingHorizontal: isDesktop ? 0 : horizontalPadding.mobile,
              paddingTop: isDesktop ? 48 : 14,
              position: "relative",
              width: "100%",
            }}
          >
            <AterbyggarenPageHeader
              isDesktop={isDesktop}
              showHistory={isLoggedIn}
              onHistoryPress={() =>
                router.navigate("/aterbyggaren/history" as never)
              }
              onNewChat={startNewChat}
            />
            {loadingChat ? (
              <View
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ActivityIndicator color={colors.logo.vector} />
              </View>
            ) : (
              <ScrollView
                ref={scrollRef}
                style={{ flex: 1 }}
                contentContainerStyle={{
                  flexGrow: 1,
                  justifyContent: "flex-start",
                  paddingBottom: isDesktop ? 24 : 20,
                  paddingTop: 32,
                }}
                onContentSizeChange={scrollToLatestMessage}
              >
                <View
                  style={{
                    gap: 24,
                    width: "100%",
                  }}
                >
                  <ConversationTitle
                    title={messages.length ? activeChatTitle : "Ny chatt"}
                  />
                  {messages.length === 0 ? (
                    <EmptyState
                      isDesktop={isDesktop}
                      examples={examples}
                      onExamplePress={sendMessage}
                    />
                  ) : (
                    messages.map((message) => (
                      <MessageBubble
                        key={message.id}
                        message={message}
                        onSearchMaterials={sendMaterialSearch}
                      />
                    ))
                  )}
                </View>
              </ScrollView>
            )}

            {error && (
              <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
                <Body size="small" color="error">
                  {error}
                </Body>
              </View>
            )}

            <View
              style={{
                backgroundColor: primitives.secondary100,
                borderTopColor: colors.dividers.neutral,
                borderTopWidth: isDesktop ? 0 : 1,
                paddingBottom: isDesktop ? 18 : 22,
                paddingTop: isDesktop ? 10 : 20,
              }}
            >
              <View
                style={{
                  alignSelf: "center",
                  maxWidth: CHAT_LAYOUT_MAX_WIDTH,
                  width: "100%",
                }}
              >
                <AterbyggarenPromptBox
                  ref={inputRef}
                  attachments={attachments}
                  autoFocus={isDesktop}
                  bordered
                  compact
                  disabled={
                    (!input.trim() && !attachments.length) ||
                    streaming ||
                    loadingChat
                  }
                  loading={streaming}
                  onChangeText={setInput}
                  onPickFile={handlePickFile}
                  onRemoveAttachment={handleRemoveAttachment}
                  onSubmit={() => sendMessage()}
                  value={input}
                />
                <Body size="small" color="primaryDark" style={{ marginTop: 8 }}>
                  Återbyggaren kan göra misstag. Kontrollera alltid kritiska
                  beslut med fackperson.
                </Body>
              </View>
            </View>
          </View>
        </View>
      </View>
    </>
  );
}

const ConversationTitle = ({ title }: { title?: string }) => {
  return (
    <Headline size="small" heading={1} style={{ color: primitives.primary800 }}>
      {title ?? "Ny chatt"}
    </Headline>
  );
};

const EmptyState = ({
  isDesktop,
  examples,
  onExamplePress,
}: {
  isDesktop: boolean;
  examples: string[];
  onExamplePress: (value: string) => void;
}) => {
  return (
    <View
      style={{
        gap: 14,
        maxWidth: CHAT_LAYOUT_MAX_WIDTH,
        width: "100%",
      }}
    >
      <Label size="small" color="secondary">
        Exempel på frågor till Återbyggaren:
      </Label>
      <View
        style={{
          alignItems: "flex-start",
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        {examples.map((example) => (
          <QuestionChip
            key={example}
            text={example}
            onPress={() => onExamplePress(example)}
          />
        ))}
      </View>
    </View>
  );
};

const QuestionChip = ({
  onPress,
  text,
}: {
  onPress: () => void;
  text: string;
}) => {
  return (
    <Pressable onPress={onPress}>
      {({ hovered, pressed }) => (
        <View
          style={{
            backgroundColor:
              hovered || pressed
                ? primitives.secondary200
                : primitives.neutrals100,
            borderColor:
              hovered || pressed
                ? primitives.primary300
                : primitives.neutrals300,
            borderRadius: borderRadius.small,
            borderWidth: 1,
            paddingHorizontal: 12,
            paddingVertical: 8,
          }}
        >
          <Label
            size="medium"
            style={{
              color: primitives.primary800,
              textAlign: "center",
            }}
          >
            {text}
          </Label>
        </View>
      )}
    </Pressable>
  );
};

const MessageBubble = ({
  message,
  onSearchMaterials,
}: {
  message: ChatMessage;
  onSearchMaterials: (items: MaterialListItem[]) => void;
}) => {
  const colors = useThemeColor();
  const isUser = message.role === "user";
  const contentParts = parseAssistantContent(message.content);
  let productDisplayIndex = 0;

  return (
    <View
      style={{
        alignSelf: isUser ? "flex-end" : "stretch",
        backgroundColor: isUser ? primitives.neutrals200 : "transparent",
        borderColor: primitives.neutrals200,
        borderRadius: isUser ? borderRadius.medium : 0,
        borderWidth: isUser ? 1 : 0,
        maxWidth: isUser ? "82%" : undefined,
        paddingHorizontal: isUser ? 14 : 0,
        paddingVertical: isUser ? 12 : 0,
        width: isUser ? undefined : "100%",
      }}
    >
      {message.pending && !message.content ? (
        <View
          style={{
            alignSelf: "center",
            maxWidth: CHAT_LAYOUT_MAX_WIDTH,
            width: "100%",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <InlineThinkingSpinner />
            <Body color="secondary">Tänker...</Body>
          </View>
        </View>
      ) : isUser ? (
        <View style={{ gap: 8 }}>
          {Boolean(message.attachments?.length) && (
            <UserAttachmentList attachments={message.attachments ?? []} />
          )}
          <Body color="secondary">{message.content}</Body>
        </View>
      ) : (
        <View style={{ gap: 12, width: "100%" }}>
          {contentParts.map((part, index) => {
            if (part.type === "text") {
              if (!part.content.trim()) return null;
              return (
                <View
                  key={`${message.id}-text-${index}`}
                  style={{
                    alignSelf: "center",
                    maxWidth: CHAT_LAYOUT_MAX_WIDTH,
                    width: "100%",
                  }}
                >
                  <FadingMarkdown
                    content={part.content}
                    streaming={Boolean(message.streaming)}
                    colors={colors}
                  />
                </View>
              );
            }

            if (part.type === "materialList") {
              return (
                <MaterialListCard
                  key={`${message.id}-materials-${index}`}
                  display={part.display}
                  onSearch={onSearchMaterials}
                />
              );
            }

            const productDisplay =
              message.productDisplays?.[productDisplayIndex++];
            if (!productDisplay?.products.length) return null;
            return (
              <ChatProductDisplay
                key={`${message.id}-products-${index}`}
                display={productDisplay}
              />
            );
          })}
          {contentParts.every((part) => part.type !== "productDisplay") &&
            message.productDisplays?.map((display, index) => (
              <ChatProductDisplay
                key={`${message.id}-fallback-products-${index}`}
                display={display}
              />
            ))}
        </View>
      )}
    </View>
  );
};

const UserAttachmentList = ({
  attachments,
}: {
  attachments: AterbyggarenPromptAttachment[];
}) => {
  return (
    <View style={{ gap: 6 }}>
      {attachments.map((attachment) => (
        <View
          key={attachment.id}
          style={{
            alignItems: "center",
            backgroundColor: primitives.neutrals100,
            borderColor: primitives.neutrals300,
            borderRadius: 8,
            borderWidth: 1,
            flexDirection: "row",
            gap: 8,
            maxWidth: 220,
            minHeight: 34,
            paddingHorizontal: 8,
            paddingVertical: 6,
          }}
        >
          {attachment.kind === "image" && (attachment.uri || attachment.url) ? (
            <Image
              source={{ uri: attachment.uri ?? attachment.url }}
              style={{ borderRadius: 5, height: 24, width: 24 }}
            />
          ) : (
            <Icon
              icon="paperclip"
              customColor={primitives.neutrals600}
              size={18}
            />
          )}
          <Text
            numberOfLines={1}
            style={{
              color: primitives.neutrals800,
              flexShrink: 1,
              fontFamily: "Inter-Regular",
              fontSize: 12,
              lineHeight: 16,
            }}
          >
            {attachment.name}
          </Text>
        </View>
      ))}
    </View>
  );
};

const InlineThinkingSpinner = () => {
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: false,
      }),
    ).start();
  }, [rotation]);

  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View
      style={{
        alignItems: "center",
        height: 28,
        justifyContent: "center",
        width: 28,
      }}
    >
      <View
        style={{
          alignItems: "center",
          backgroundColor: "rgba(0,0,0,0.28)",
          borderRadius: borderRadius.xSmall,
          height: 28,
          justifyContent: "center",
          overflow: "hidden",
          width: 28,
        }}
      >
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <Image
            source={require("../../../assets/images/loader-icon.png")}
            style={{ height: 52, width: 52 }}
          />
        </Animated.View>
      </View>
    </View>
  );
};

const FadingMarkdown = ({
  content,
  colors,
  streaming,
}: {
  content: string;
  colors: ReturnType<typeof useThemeColor>;
  streaming: boolean;
}) => {
  const [animated, setAnimated] = useState(streaming);
  const wordStatesRef = useRef<Map<number, WordFadeState>>(new Map());
  const previousContentRef = useRef(content);
  const previousVisibleWordCountRef = useRef(0);
  const visibleWords = useMemo(
    () => getMarkdownVisibleWords(content),
    [content],
  );

  useEffect(() => {
    if (streaming) {
      setAnimated(true);
      return;
    }

    const id = setTimeout(
      () => setAnimated(false),
      STREAM_TEXT_FADE_DURATION + STREAM_TEXT_FADE_TAIL,
    );
    return () => clearTimeout(id);
  }, [streaming]);

  useLayoutEffect(() => {
    if (!animated) return;

    const visibleWordCount = visibleWords.length;
    for (const wordIndex of wordStatesRef.current.keys()) {
      if (wordIndex >= visibleWordCount)
        wordStatesRef.current.delete(wordIndex);
    }
    previousVisibleWordCountRef.current = visibleWordCount;
    previousContentRef.current = content;
  }, [animated, content, visibleWords.length]);

  if (!animated) {
    return <Markdown style={markdownStyle(colors)}>{content}</Markdown>;
  }

  if (
    content.length < previousContentRef.current.length ||
    (previousContentRef.current &&
      !content.startsWith(previousContentRef.current))
  ) {
    wordStatesRef.current.clear();
    previousVisibleWordCountRef.current = 0;
  }

  const previousVisibleWordCount = previousVisibleWordCountRef.current;

  const getWordState = (wordIndex: number) => {
    const existingState = wordStatesRef.current.get(wordIndex);
    if (existingState) return existingState;

    const shouldAnimate = animated && wordIndex >= previousVisibleWordCount;
    const delay = shouldAnimate
      ? Math.min(
          (wordIndex - previousVisibleWordCount) * STREAM_TEXT_FADE_STAGGER,
          STREAM_TEXT_MAX_BACKLOG,
        )
      : 0;
    const nextState: WordFadeState = {
      delay,
      status: shouldAnimate ? "pending" : "done",
      value: new Animated.Value(shouldAnimate ? 0 : 1),
    };
    wordStatesRef.current.set(wordIndex, nextState);
    return nextState;
  };

  const visibleWordSlots = visibleWords.map((word, index) => ({
    state: getWordState(index),
    word,
  }));
  const wordStateQueues = createWordStateQueues(visibleWordSlots);

  const consumeWordState = (word: string) => {
    const queue = wordStateQueues.get(word);
    return queue?.shift();
  };

  const getListItemMarkerState = (node: MarkdownNode) => {
    const listItemWords = getMarkdownNodeVisibleWords(node);
    const firstListItemWordIndex = findWordSequenceIndex(
      visibleWords,
      listItemWords,
    );
    return firstListItemWordIndex >= 0
      ? wordStatesRef.current.get(firstListItemWordIndex)
      : undefined;
  };

  const rules = {
    list_item: (
      node: MarkdownNode,
      children: React.ReactNode,
      parent: MarkdownNode[],
      styles: MarkdownStyleMap,
      inheritedStyles: object = {},
    ) => {
      const markerState = getListItemMarkerState(node);

      if (hasMarkdownParent(parent, "bullet_list")) {
        return (
          <View key={node.key} style={styles._VIEW_SAFE_list_item}>
            <FadingListMarker
              state={markerState}
              style={[inheritedStyles, styles.bullet_list_icon]}
            >
              {Platform.select({
                android: "\u2022",
                ios: "\u00B7",
                default: "\u2022",
              })}
            </FadingListMarker>
            <View style={styles._VIEW_SAFE_bullet_list_content}>
              {children}
            </View>
          </View>
        );
      }

      if (hasMarkdownParent(parent, "ordered_list")) {
        const orderedList = parent.find((item) => item.type === "ordered_list");
        const start = Number(orderedList?.attributes?.start ?? 1);
        const listItemNumber = start + node.index;

        return (
          <View key={node.key} style={styles._VIEW_SAFE_list_item}>
            <FadingListMarker
              state={markerState}
              style={[inheritedStyles, styles.ordered_list_icon]}
            >
              {listItemNumber}
              {node.markup}
            </FadingListMarker>
            <View style={styles._VIEW_SAFE_ordered_list_content}>
              {children}
            </View>
          </View>
        );
      }

      return (
        <View key={node.key} style={styles._VIEW_SAFE_list_item}>
          {children}
        </View>
      );
    },
    text: (
      node: MarkdownNode,
      _children: React.ReactNode,
      _parent: unknown,
      styles: MarkdownStyleMap,
      inheritedStyles: object = {},
    ) => (
      <Text key={node.key} style={[inheritedStyles, styles.text]}>
        {(node.content?.match(/\s+|\S+/g) ?? []).map((segment, localIndex) => {
          if (/^\s+$/.test(segment)) return segment;
          return (
            <FadingWord key={localIndex} state={consumeWordState(segment)}>
              {segment}
            </FadingWord>
          );
        })}
      </Text>
    ),
  };

  return (
    <Markdown rules={rules} style={markdownStyle(colors)}>
      {content}
    </Markdown>
  );
};

const FadingWord = ({
  children,
  state,
}: {
  children: React.ReactNode;
  state?: WordFadeState;
}) => {
  useEffect(() => {
    if (!state) return;
    if (state.status !== "pending") return;
    state.status = "running";
    Animated.sequence([
      Animated.delay(state.delay),
      Animated.timing(state.value, {
        duration: STREAM_TEXT_FADE_DURATION,
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start(() => {
      state.status = "done";
    });
  }, [state]);
  if (!state) return <Text>{children}</Text>;
  return (
    <Animated.Text style={{ opacity: state.value }}>{children}</Animated.Text>
  );
};

const FadingListMarker = ({
  children,
  state,
  style,
}: {
  children: React.ReactNode;
  state?: WordFadeState;
  style: object;
}) => {
  if (!state) return <Text style={style}>{children}</Text>;
  return (
    <Animated.Text style={[style, { opacity: state.value }]} accessible={false}>
      {children}
    </Animated.Text>
  );
};

const getMarkdownVisibleWords = (content: string) => {
  const words: string[] = [];
  const tokens = markdownFadeParser.parse(content, {}) as MarkdownFadeToken[];
  tokens.forEach((token) => collectMarkdownTokenVisibleWords(token, words));
  return words;
};

const collectMarkdownTokenVisibleWords = (
  token: MarkdownFadeToken,
  words: string[],
) => {
  if (token.children?.length) {
    token.children.forEach((child) =>
      collectMarkdownTokenVisibleWords(child, words),
    );
    return;
  }

  if (["code_block", "fence", "text", "code_inline"].includes(token.type)) {
    appendWords(words, token.content);
  }
};

const getMarkdownNodeVisibleWords = (node: MarkdownNode) => {
  const words: string[] = [];
  collectMarkdownNodeVisibleWords(node, words);
  return words;
};

const collectMarkdownNodeVisibleWords = (
  node: MarkdownNode,
  words: string[],
) => {
  if (node.type === "text") appendWords(words, node.content);
  node.children?.forEach((child) =>
    collectMarkdownNodeVisibleWords(child, words),
  );
};

const appendWords = (words: string[], value?: string) => {
  words.push(...(value?.match(/\S+/g) ?? []));
};

const createWordStateQueues = (slots: WordFadeSlot[]) => {
  const queues = new Map<string, WordFadeState[]>();
  slots.forEach((slot) => {
    const queue = queues.get(slot.word) ?? [];
    queue.push(slot.state);
    queues.set(slot.word, queue);
  });
  return queues;
};

const findWordSequenceIndex = (words: string[], sequence: string[]) => {
  if (!sequence.length || sequence.length > words.length) return -1;

  for (let index = 0; index <= words.length - sequence.length; index++) {
    if (sequence.every((word, offset) => words[index + offset] === word)) {
      return index;
    }
  }

  return -1;
};

const hasMarkdownParent = (parents: MarkdownNode[], type: string) =>
  parents.some((parent) => parent.type === type);

type WordFadeSlot = {
  state: WordFadeState;
  word: string;
};

type WordFadeState = {
  delay: number;
  status: "pending" | "running" | "done";
  value: Animated.Value;
};

type MarkdownFadeToken = {
  children?: MarkdownFadeToken[];
  content?: string;
  type: string;
};

type MarkdownNode = {
  attributes?: Record<string, string | number>;
  children?: MarkdownNode[];
  content?: string;
  index: number;
  key: string;
  markup?: string;
  type: string;
};

type MarkdownStyleMap = Record<string, object>;

const markdownStyle = (colors: ReturnType<typeof useThemeColor>) => ({
  body: {
    color: colors.text.primaryDark,
    fontFamily: "Inter-Regular",
    fontSize: 15,
    lineHeight: 23,
  },
  text: {
    color: colors.text.primaryDark,
    fontFamily: "Inter-Regular",
    fontSize: 15,
    lineHeight: 23,
  },
  paragraph: {
    marginBottom: 10,
    marginTop: 0,
  },
  bullet_list: {
    marginBottom: 10,
    marginTop: 2,
  },
  ordered_list: {
    marginBottom: 10,
    marginTop: 2,
  },
  _VIEW_SAFE_list_item: {
    flexDirection: "row" as const,
    marginBottom: 6,
  },
  _VIEW_SAFE_bullet_list_content: {
    flex: 1,
    paddingLeft: 4,
  },
  _VIEW_SAFE_ordered_list_content: {
    flex: 1,
    paddingLeft: 6,
  },
  bullet_list_icon: {
    color: colors.text.primaryDark,
    fontFamily: "Inter-Regular",
    fontSize: 15,
    lineHeight: 23,
    width: 16,
  },
  ordered_list_icon: {
    color: colors.text.primaryDark,
    fontFamily: "Inter-Regular",
    fontSize: 15,
    lineHeight: 23,
    minWidth: 22,
  },
  heading1: {
    color: colors.text.primaryDark,
    fontFamily: "Poppins-SemiBold",
    fontSize: 20,
    lineHeight: 27,
    marginBottom: 10,
    marginTop: 4,
  },
  heading2: {
    color: colors.text.primaryDark,
    fontFamily: "Poppins-SemiBold",
    fontSize: 17,
    lineHeight: 24,
    marginBottom: 8,
    marginTop: 4,
  },
  heading3: {
    color: colors.text.primaryDark,
    fontFamily: "Poppins-SemiBold",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 6,
    marginTop: 4,
  },
  link: {
    color: colors.text.link,
    fontFamily: "Inter-Regular",
  },
  strong: {
    color: colors.text.primaryDark,
    fontFamily: "Poppins-SemiBold",
  },
  em: {
    color: colors.text.primaryDark,
    fontStyle: "italic" as const,
  },
  blockquote: {
    backgroundColor: colors.background.primary,
    borderColor: primitives.primary300,
    borderLeftWidth: 3,
    marginBottom: 12,
    marginTop: 2,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  code_inline: {
    backgroundColor: colors.background.primary,
    borderColor: colors.dividers.secondary,
    borderRadius: 5,
    borderWidth: 1,
    color: colors.text.primaryDark,
    fontFamily: Platform.select({
      android: "monospace",
      default: "monospace",
      ios: "Menlo",
    }),
    fontSize: 14,
    lineHeight: 21,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  code_block: {
    backgroundColor: colors.background.primary,
    borderColor: colors.dividers.secondary,
    borderRadius: 8,
    borderWidth: 1,
    color: colors.text.primaryDark,
    fontFamily: Platform.select({
      android: "monospace",
      default: "monospace",
      ios: "Menlo",
    }),
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 14,
    marginTop: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  fence: {
    backgroundColor: colors.background.primary,
    borderColor: colors.dividers.secondary,
    borderRadius: 8,
    borderWidth: 1,
    color: colors.text.primaryDark,
    fontFamily: Platform.select({
      android: "monospace",
      default: "monospace",
      ios: "Menlo",
    }),
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 14,
    marginTop: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  hr: {
    backgroundColor: colors.dividers.secondary,
    height: 1,
    marginBottom: 14,
    marginTop: 6,
  },
  table: {
    borderColor: primitives.secondary500,
    borderRadius: 6,
    borderWidth: 1,
    marginBottom: 14,
    marginTop: 4,
    overflow: "hidden" as const,
  },
  th: {
    backgroundColor: colors.background.primary,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  tr: {
    borderBottomColor: colors.dividers.secondary,
    borderBottomWidth: 1,
  },
  td: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
});

type AssistantContentPart =
  | { type: "text"; content: string }
  | { type: "productDisplay" }
  | { type: "materialList"; display: MaterialListDisplay };

const parseAssistantContent = (content: string): AssistantContentPart[] => {
  const parts: AssistantContentPart[] = [];
  const tagRegex = /<rebuildr-(products|material-list)\s+([^>]*?)\s*\/?\s*>/g;
  let cursor = 0;

  for (const match of content.matchAll(tagRegex)) {
    if (match.index === undefined) continue;
    parts.push({ type: "text", content: content.slice(cursor, match.index) });

    if (match[1] === "products") {
      parts.push({ type: "productDisplay" });
    } else {
      const materialList = parseMaterialListAttributes(match[2]);
      if (materialList) {
        parts.push({ type: "materialList", display: materialList });
      }
    }

    cursor = match.index + match[0].length;
  }

  const tail = content.slice(cursor).replace(/<rebuildr-[^>]*$/g, "");
  parts.push({ type: "text", content: tail });

  return parts;
};

const parseMaterialListAttributes = (
  attributes: string,
): MaterialListDisplay | undefined => {
  const title = readTagAttribute(attributes, "title") ?? "Materiallista";
  const rawItems = readTagAttribute(attributes, "items");
  if (!rawItems) return undefined;

  const items = rawItems
    .split("|")
    .map((rawItem, index) => {
      const [label, query] = rawItem.split("::").map((part) => part.trim());
      if (!label) return undefined;
      return {
        id: `${index}-${label}`,
        label,
        query: query || label,
      };
    })
    .filter((item): item is MaterialListItem => !!item);

  if (!items.length) return undefined;
  return { title, items };
};

const readTagAttribute = (attributes: string, name: string) => {
  const match = attributes.match(new RegExp(`${name}=(["'])(.*?)\\1`));
  return match?.[2]?.replace(/&quot;/g, '"').replace(/&apos;/g, "'");
};

const MaterialListCard = ({
  display,
  onSearch,
}: {
  display: MaterialListDisplay;
  onSearch: (items: MaterialListItem[]) => void;
}) => {
  const [selectedIds, setSelectedIds] = useState(
    () => new Set(display.items.map((item) => item.id)),
  );
  const selectedItems = display.items.filter((item) =>
    selectedIds.has(item.id),
  );

  const toggleItem = (itemId: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  return (
    <View
      style={{
        alignSelf: "center",
        backgroundColor: primitives.neutrals100,
        borderColor: primitives.neutrals300,
        borderRadius: 12,
        borderWidth: 1,
        maxWidth: CHAT_LAYOUT_MAX_WIDTH,
        overflow: "hidden",
        width: "100%",
      }}
    >
      <View style={{ gap: 4, padding: 16 }}>
        <Title size="small">{display.title}</Title>
        <Body size="small" color="secondary">
          {display.items.length} delar • välj vad du vill söka efter
        </Body>
      </View>
      <View
        style={{
          borderTopColor: primitives.neutrals200,
          borderTopWidth: 1,
          gap: 12,
          padding: 16,
        }}
      >
        {display.items.map((item) => {
          const selected = selectedIds.has(item.id);
          return (
            <Pressable
              key={item.id}
              onPress={() => toggleItem(item.id)}
              style={{ alignItems: "center", flexDirection: "row", gap: 12 }}
            >
              <View
                style={{
                  alignItems: "center",
                  backgroundColor: selected
                    ? primitives.accent500
                    : primitives.neutrals100,
                  borderColor: selected
                    ? primitives.accent500
                    : primitives.neutrals400,
                  borderRadius: 6,
                  borderWidth: 2,
                  height: 28,
                  justifyContent: "center",
                  width: 28,
                }}
              >
                {selected && (
                  <Icon icon="check" color="primaryLight" size={16} />
                )}
              </View>
              <Label size="medium" style={{ flex: 1 }}>
                {item.label}
              </Label>
            </Pressable>
          );
        })}
      </View>
      <View
        style={{
          flexDirection: "row",
          gap: 12,
          padding: 16,
          paddingTop: 0,
        }}
      >
        <MaterialSearchButton
          disabled={!selectedItems.length}
          label="Sök markerade"
          primary
          onPress={() => onSearch(selectedItems)}
        />
        <MaterialSearchButton
          label="Sök alla"
          onPress={() => onSearch(display.items)}
        />
      </View>
    </View>
  );
};

const MaterialSearchButton = ({
  disabled = false,
  label,
  primary = false,
  onPress,
}: {
  disabled?: boolean;
  label: string;
  primary?: boolean;
  onPress: () => void;
}) => {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        alignItems: "center",
        backgroundColor: primary
          ? primitives.accent500
          : primitives.neutrals100,
        borderColor: primary ? primitives.accent500 : primitives.neutrals300,
        borderRadius: 12,
        borderWidth: 1,
        flex: 1,
        opacity: disabled ? 0.48 : pressed ? 0.78 : 1,
        paddingHorizontal: 12,
        paddingVertical: 13,
      })}
    >
      <Label color={primary ? "primaryLight" : "primaryDark"} size="medium">
        {label}
      </Label>
    </Pressable>
  );
};

const ChatProductDisplay = ({ display }: { display: ProductDisplay }) => {
  const { isDesktop } = useScreenType();
  const products = display.products.slice(0, 8);

  if (isDesktop) {
    return (
      <View
        style={{
          alignSelf: "center",
          flexDirection: "row",
          flexWrap: "wrap",
          gap: CHAT_PRODUCT_GRID_GAP,
          maxWidth: CHAT_LAYOUT_MAX_WIDTH,
          width: "100%",
        }}
      >
        {products.map((product) => (
          <View
            key={product.id}
            style={{ width: CHAT_PRODUCT_DESKTOP_CARD_WIDTH }}
          >
            <ChatProductCard product={product} />
          </View>
        ))}
      </View>
    );
  }

  return (
    <View style={{ gap: 10, marginRight: -horizontalPadding.mobile }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          gap: 12,
          paddingRight: horizontalPadding.mobile,
        }}
      >
        {products.map((product) => (
          <View key={product.id} style={{ width: 114 }}>
            <ChatProductCard product={product} />
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const ChatProductCard = ({ product }: { product: DisplayedProduct }) => {
  const colors = useThemeColor();
  const { isDesktop } = useScreenType();
  const isLoggedIn = useReactiveVar(isLoggedInVar);
  const { onToggleProductHeart } = useLikeProduct();
  const [liked, setLiked] = useState(!!product.likedByMe);
  const detail = [
    product.category,
    product.brand,
    conditions[product.condition]?.name,
  ]
    .filter(Boolean)
    .join(" • ");
  const fulfillment = product.pickupEnabled
    ? "Hämtning"
    : product.deliveryEnabled
      ? "Leverans"
      : undefined;

  useEffect(() => {
    setLiked(!!product.likedByMe);
  }, [product.likedByMe]);

  const toggleFavorite = useCallback(() => {
    setLiked((currentLiked) => !currentLiked);
    onToggleProductHeart({
      productId: product.id,
      likedByMe: liked,
    });
  }, [liked, onToggleProductHeart, product.id]);

  return (
    <Pressable
      onPress={() =>
        router.navigate({
          pathname: "/product/[productId]",
          params: { productId: product.id },
        })
      }
      style={({ pressed }) => ({
        backgroundColor: isDesktop ? primitives.neutrals100 : "transparent",
        borderColor: primitives.neutrals200,
        borderRadius: isDesktop ? 8 : 10,
        borderWidth: 0,
        flexDirection: "column",
        gap: 8,
        opacity: pressed ? 0.82 : 1,
        overflow: "hidden",
        padding: isDesktop ? 8 : 0,
        width: "100%",
      })}
    >
      <View>
        <Image
          source={product.imageUrl ?? PlaceholderProduct.uri}
          style={{
            aspectRatio: 1,
            backgroundColor: primitives.neutrals200,
            borderRadius: isDesktop ? 6 : 10,
            width: "100%",
          }}
        />
        {isLoggedIn && (
          <Pressable
            pointerEvents="box-only"
            onPress={toggleFavorite}
            style={({ pressed }) => ({
              opacity: pressed ? 0.7 : 1,
              position: "absolute",
              right: 8,
              top: 8,
            })}
          >
            <Icon
              strokeColor="primaryLight"
              color={liked ? "link" : undefined}
              opacity={liked ? undefined : "99"}
              icon="heartFilled"
            />
          </Pressable>
        )}
      </View>
      <View style={{ flex: 1, gap: 6, padding: isDesktop ? 2 : 0 }}>
        <View style={{ gap: 4 }}>
          <Label
            size={isDesktop ? "small" : "medium"}
            numberOfLines={2}
            style={{ height: CHAT_PRODUCT_TITLE_HEIGHT }}
          >
            {product.title}
          </Label>
          <View style={{ height: CHAT_PRODUCT_DETAIL_HEIGHT }}>
            {!!detail && (
              <Body size="small" color="secondary" numberOfLines={1}>
                {detail}
              </Body>
            )}
          </View>
        </View>
        <View style={{ gap: isDesktop ? 8 : 6, marginTop: "auto" }}>
          <Label size={isDesktop ? "medium" : "large"}>
            {product.isGiveaway ? "Gratis" : formatPrice(product.price)}
          </Label>
          <View
            style={{
              flexDirection: "row",
              flexWrap: isDesktop ? "nowrap" : "wrap",
              gap: 6,
              display: isDesktop ? "flex" : "none",
            }}
          >
            {!!fulfillment && (
              <View
                style={{
                  alignItems: "center",
                  backgroundColor: primitives.secondary100,
                  borderRadius: borderRadius.xSmall,
                  flexShrink: 0,
                  paddingHorizontal: 6,
                  paddingVertical: 3,
                }}
              >
                <Label size="small" color="secondary" numberOfLines={1}>
                  {fulfillment}
                </Label>
              </View>
            )}
            <View
              style={{
                alignItems: "center",
                backgroundColor: colors.buttons.tonal.enabled,
                borderRadius: borderRadius.xSmall,
                flex: 1,
                flexDirection: "row",
                gap: 2,
                justifyContent: "center",
                minWidth: 0,
                paddingHorizontal: 6,
                paddingVertical: 3,
              }}
            >
              <Label size="small" color="link" numberOfLines={1}>
                Visa annons
              </Label>
              <Icon icon="arrowRight" color="link" size={12} />
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
};

const readEventStream = async (
  stream: ReadableStream<Uint8Array>,
  onEvent: (event: StreamEvent) => void,
) => {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const parts = buffer.split("\n\n");
    buffer = parts.pop() ?? "";

    for (const part of parts) {
      const event = parseStreamEvent(part);
      if (event) onEvent(event);
    }
  }
};

const readResponseErrorMessage = async (response: Response) => {
  try {
    const payload = (await response.json()) as { message?: string | string[] };
    if (Array.isArray(payload.message)) return payload.message.join("\n");
    return payload.message;
  } catch {
    return undefined;
  }
};

const isAbortError = (error: unknown) => {
  return error instanceof Error && error.name === "AbortError";
};

const parseStreamEvent = (rawEvent: string): StreamEvent | undefined => {
  const event = rawEvent
    .split("\n")
    .find((line) => line.startsWith("event: "))
    ?.replace("event: ", "");
  const data = rawEvent
    .split("\n")
    .filter((line) => line.startsWith("data: "))
    .map((line) => line.replace("data: ", ""))
    .join("\n");

  if (!event || !data) return undefined;
  return { event, data: JSON.parse(data) };
};
