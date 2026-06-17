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
  NativeSyntheticEvent,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TextInputKeyPressEventData,
  useWindowDimensions,
  View,
} from "react-native";

import { ProductConditionEnum } from "@/gql/graphql";
import { isLoggedInVar } from "@/apollo/config";
import { formatPrice } from "@/utils/formattings";
import PlaceholderProduct from "@assets/images/placeholder-product.png";
import { Button } from "@components/buttons/button";
import TopBar from "@components/navigation/top-bar/top-bar";
import { Pictogram } from "@components/pictograms/pictogram";
import { Body, Label, Title } from "@components/typography/text";
import { primitives } from "@constants/colors";
import { conditions } from "@constants/conditions";
import { borderRadius, horizontalPadding } from "@constants/sizes";
import { useScreenType } from "@hooks/useScreenType";
import { useThemeColor } from "@hooks/useThemeColor";
import { Icon } from "@icons/icon";

type ChatSummary = {
  id: string;
  title?: string;
  createdAt: string;
  updatedAt: string;
};

type ChatMessage = {
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
  url: string;
  imageUrl?: string;
};

type ProductDisplay = {
  type: "products";
  products: DisplayedProduct[];
};

type StreamEvent = {
  event: string;
  data: unknown;
};

const GUEST_ID_KEY = "bygghjalpen_guest_id";
const CHAT_CONTENT_MAX_WIDTH = 760;
const STREAM_TEXT_FADE_DURATION = 260;
const STREAM_TEXT_FADE_STAGGER = 28;
const STREAM_TEXT_FADE_TAIL = 260;
const STREAM_TEXT_MAX_BACKLOG = 180;

const markdownFadeParser = MarkdownIt({ typographer: true });

const apiUrl = process.env.EXPO_PUBLIC_API_URL;

const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const token = await AsyncStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

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
  const response = await fetch(`${apiUrl}${path}`, {
    headers: await getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Request failed");
  return response.json();
};

export default function BygghjalpenChatPage() {
  const colors = useThemeColor();
  const { isDesktop } = useScreenType();
  const { height: windowHeight } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);
  const initialQuestionSentRef = useRef(false);
  const params = useLocalSearchParams<{ question?: string }>();
  const isLoggedIn = useReactiveVar(isLoggedInVar);
  const [chats, setChats] = useState<ChatSummary[]>([]);
  const [activeChatId, setActiveChatId] = useState<string>();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loadingChat, setLoadingChat] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string>();
  const [showMobileHistory, setShowMobileHistory] = useState(false);
  const [topBarHeight, setTopBarHeight] = useState(0);
  const [desktopActionsChatId, setDesktopActionsChatId] = useState<string>();
  const [mobileActionsChatId, setMobileActionsChatId] = useState<string>();

  const handleTopBarLayout = useCallback((event: LayoutChangeEvent) => {
    setTopBarHeight(event.nativeEvent.layout.height);
  }, []);

  const focusChatInput = useCallback(() => {
    requestAnimationFrame(() => inputRef.current?.focus());
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (typeof document === "undefined") return;
      document.body.style.backgroundColor = colors.background.secondary;
      return () => {
        document.body.style.backgroundColor = "";
      };
    }, [colors.background.secondary]),
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
      const nextChats = await readJson<ChatSummary[]>("/bygghjalpen/chats");
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
    requestAnimationFrame(() =>
      scrollRef.current?.scrollToEnd({ animated: true }),
    );
  }, [messages]);

  const loadMessages = async (chatId: string) => {
    setLoadingChat(true);
    setError(undefined);
    try {
      const nextMessages = await readJson<ChatMessage[]>(
        `/bygghjalpen/chats/${chatId}/messages`,
      );
      setActiveChatId(chatId);
      setMessages(nextMessages);
      setShowMobileHistory(false);
    } catch {
      setError("Kunde inte öppna chatten.");
    } finally {
      setLoadingChat(false);
      focusChatInput();
    }
  };

  const startNewChat = () => {
    setActiveChatId(undefined);
    setMessages([]);
    setError(undefined);
    setShowMobileHistory(false);
    setDesktopActionsChatId(undefined);
    setMobileActionsChatId(undefined);
    focusChatInput();
  };

  const deleteChat = async (chatId: string) => {
    if (!isLoggedIn) return;
    try {
      await fetch(`${apiUrl}/bygghjalpen/chats/${chatId}`, {
        method: "DELETE",
        headers: await getAuthHeaders(),
      });
      if (chatId === activeChatId) {
        startNewChat();
      }
      setDesktopActionsChatId(undefined);
      setMobileActionsChatId(undefined);
      loadChats();
    } catch {
      setError("Kunde inte ta bort chatten.");
    }
  };

  const sendMessage = useCallback(
    async (overrideMessage?: string) => {
      const message = (overrideMessage ?? input).trim();
      if (!message || streaming) return;

      setInput("");
      setStreaming(true);
      setError(undefined);
      focusChatInput();

      const assistantId = `assistant-${Date.now()}`;
      setMessages((current) => [
        ...current,
        { id: `user-${Date.now()}`, role: "user", content: message },
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
        const response = await fetch(`${apiUrl}/bygghjalpen/chat/stream`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(await getAuthHeaders()),
          },
          body: JSON.stringify({ chatId: activeChatId, message, guestId }),
        });

        if (!response.ok || !response.body) {
          throw new Error("Stream failed");
        }

        await readEventStream(response.body, (streamEvent) => {
          if (streamEvent.event === "chat") {
            const chat = streamEvent.data as ChatSummary;
            setActiveChatId(chat.id);
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
        });

        setMessages((current) =>
          current.map((item) =>
            item.id === assistantId
              ? { ...item, pending: false, streaming: false }
              : item,
          ),
        );
        loadChats();
      } catch (e) {
        const messageText = e instanceof Error ? e.message : undefined;
        setError(messageText ?? "Något gick fel. Försök igen.");
        setMessages((current) =>
          current.filter((item) => item.id !== assistantId),
        );
      } finally {
        setStreaming(false);
        focusChatInput();
      }
    },
    [activeChatId, focusChatInput, input, isLoggedIn, loadChats, streaming],
  );

  const handleInputKeyPress = useCallback(
    (event: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
      if (event.nativeEvent.key !== "Enter" || !input.trim() || streaming) {
        return;
      }

      event.preventDefault();
      sendMessage();
    },
    [input, sendMessage, streaming],
  );

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

  return (
    <>
      <Head>
        <title>RebuildR - Bygghjälpen</title>
        <meta
          name="description"
          content="Chatta med Bygghjälpen om bygg, renovering, hemmafix och återbruk av byggmaterial."
        />
      </Head>

      <View
        style={{
          flex: 1,
          backgroundColor: isDesktop
            ? primitives.secondary200
            : primitives.neutrals100,
          height: windowHeight,
          overflow: "hidden",
        }}
      >
        <View onLayout={handleTopBarLayout}>
          <TopBar theme="dark" showSearchBar={false} />
        </View>
        <View
          style={{
            backgroundColor: isDesktop
              ? primitives.secondary200
              : primitives.neutrals100,
            height: Math.max(windowHeight - topBarHeight, 0),
            overflow: "hidden",
          }}
        >
          <View
            style={{
              flex: 1,
              flexDirection: isDesktop ? "row" : "column",
              alignSelf: "center",
              backgroundColor: isDesktop
                ? primitives.secondary200
                : primitives.neutrals100,
              gap: isDesktop ? 16 : 0,
              maxWidth: isDesktop ? 1200 : undefined,
              overflow: "hidden",
              paddingHorizontal: isDesktop ? 24 : horizontalPadding.mobile,
              paddingVertical: isDesktop ? 24 : 0,
              position: "relative",
              width: "100%",
            }}
          >
            {isDesktop && desktopActionsChatId && (
              <Pressable
                onPress={() => setDesktopActionsChatId(undefined)}
                style={{
                  bottom: 0,
                  left: 0,
                  position: "absolute",
                  right: 0,
                  top: 0,
                  zIndex: 9999,
                }}
              />
            )}
            {!isDesktop && isLoggedIn && showMobileHistory && (
              <MobileHistoryOverlay
                chats={chats}
                activeChatId={activeChatId}
                openActionsChatId={mobileActionsChatId}
                onClose={() => {
                  setMobileActionsChatId(undefined);
                  setShowMobileHistory(false);
                }}
                onDelete={deleteChat}
                onSelect={loadMessages}
                onToggleActions={(chatId) =>
                  setMobileActionsChatId((current) =>
                    current === chatId ? undefined : chatId,
                  )
                }
                onCloseActions={() => setMobileActionsChatId(undefined)}
              />
            )}

            {isDesktop && isLoggedIn && (
              <HistorySidebar
                chats={chats}
                activeChatId={activeChatId}
                openActionsChatId={desktopActionsChatId}
                onSelect={loadMessages}
                onNewChat={startNewChat}
                onDelete={deleteChat}
                onToggleActions={(chatId) =>
                  setDesktopActionsChatId((current) =>
                    current === chatId ? undefined : chatId,
                  )
                }
              />
            )}

            <View
              style={{
                flex: 1,
                backgroundColor: primitives.neutrals100,
                borderRadius: isDesktop ? 16 : 0,
                overflow: "hidden",
              }}
            >
              <ChatHeader
                isDesktop={isDesktop}
                showHistory={isLoggedIn}
                historyOpen={showMobileHistory}
                onHistoryPress={() =>
                  setShowMobileHistory((current) => !current)
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
                    justifyContent: messages.length ? "flex-start" : "center",
                    paddingBottom: isDesktop ? 24 : 16,
                    paddingHorizontal: isDesktop ? 24 : 0,
                    paddingTop: isDesktop ? 24 : 16,
                  }}
                >
                  <View
                    style={{
                      gap: 14,
                      width: "100%",
                    }}
                  >
                    {messages.length === 0 ? (
                      <EmptyState
                        examples={examples}
                        onExamplePress={sendMessage}
                      />
                    ) : (
                      messages.map((message) => (
                        <MessageBubble key={message.id} message={message} />
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
                  backgroundColor: primitives.neutrals100,
                  paddingBottom: 12,
                  paddingTop: 12,
                }}
              >
                <View
                  style={{
                    alignSelf: "center",
                    maxWidth: CHAT_CONTENT_MAX_WIDTH,
                    width: "100%",
                  }}
                >
                  <View
                    style={{
                      alignItems: "flex-end",
                      backgroundColor: primitives.neutrals100,
                      borderColor: primitives.neutrals400,
                      borderRadius: borderRadius.medium,
                      borderWidth: 1,
                      flexDirection: "row",
                      gap: 8,
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                    }}
                  >
                    <TextInput
                      ref={inputRef}
                      value={input}
                      onChangeText={setInput}
                      placeholder="Skriv din fråga..."
                      placeholderTextColor={colors.text.secondary}
                      multiline
                      autoFocus
                      onKeyPress={handleInputKeyPress}
                      style={{
                        color: colors.text.primaryDark,
                        flex: 1,
                        fontFamily: "Inter-Regular",
                        fontSize: 15,
                        maxHeight: 132,
                        minHeight: 28,
                        outlineColor: "transparent",
                        outlineWidth: 0,
                      }}
                    />
                    <Button
                      type="filled"
                      icon={streaming ? undefined : "arrowRight"}
                      loading={streaming}
                      disabled={!input.trim() || streaming}
                      onPress={() => sendMessage()}
                    />
                  </View>
                  <Label
                    size="small"
                    color="secondary"
                    style={{ marginTop: 8 }}
                  >
                    Bygghjälpen kan göra misstag. Kontrollera alltid kritiska
                    beslut med fackperson.
                  </Label>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>
    </>
  );
}

const HistorySidebar = ({
  chats,
  activeChatId,
  openActionsChatId,
  onSelect,
  onNewChat,
  onDelete,
  onToggleActions,
}: {
  chats: ChatSummary[];
  activeChatId?: string;
  openActionsChatId?: string;
  onSelect: (chatId: string) => void;
  onNewChat: () => void;
  onDelete: (chatId: string) => void;
  onToggleActions: (chatId: string) => void;
}) => {
  return (
    <View
      style={{
        backgroundColor: primitives.neutrals100,
        borderRadius: 16,
        gap: 12,
        overflow: "visible",
        padding: 12,
        position: "relative",
        width: 300,
      }}
    >
      <View style={{ gap: 4 }}>
        <Title size="medium">Tidigare frågor</Title>
        <Body size="small" color="secondary">
          Fortsätt där du slutade.
        </Body>
      </View>
      <Button type="filled" icon="+" label="Ny chatt" onPress={onNewChat} />
      <ScrollView
        contentContainerStyle={{ gap: 6, overflow: "visible" }}
        showsVerticalScrollIndicator={false}
      >
        {chats.map((chat) => {
          const active = chat.id === activeChatId;
          return (
            <HistoryChatRow
              key={chat.id}
              chat={chat}
              active={active}
              actionsOpen={openActionsChatId === chat.id}
              showActionsOnHover
              onDelete={() => {
                onDelete(chat.id);
              }}
              onToggleActions={() => onToggleActions(chat.id)}
              onSelect={() => onSelect(chat.id)}
            />
          );
        })}
      </ScrollView>
    </View>
  );
};

const ChatHeader = ({
  isDesktop,
  showHistory,
  historyOpen,
  onHistoryPress,
  onNewChat,
}: {
  isDesktop: boolean;
  showHistory: boolean;
  historyOpen: boolean;
  onHistoryPress: () => void;
  onNewChat: () => void;
}) => {
  return (
    <View
      style={{
        alignItems: isDesktop ? "flex-start" : "center",
        flexDirection: isDesktop ? "column" : "row",
        gap: isDesktop ? 0 : 12,
        justifyContent: isDesktop ? "flex-start" : "flex-start",
        minHeight: isDesktop ? undefined : 64,
        paddingHorizontal: isDesktop ? 24 : 0,
        paddingVertical: isDesktop ? 16 : 12,
      }}
    >
      {!isDesktop && (
        <MobileChatActions
          showHistory={showHistory}
          open={historyOpen}
          onHistoryPress={onHistoryPress}
          onNewChat={onNewChat}
        />
      )}
      <Title size={isDesktop ? "medium" : "small"}>Bygghjälpen</Title>
    </View>
  );
};

const MobileChatActions = ({
  showHistory,
  open,
  onHistoryPress,
  onNewChat,
}: {
  showHistory: boolean;
  open: boolean;
  onHistoryPress: () => void;
  onNewChat: () => void;
}) => {
  return (
    <View
      style={{
        flexDirection: "row",
        gap: 8,
        zIndex: 30,
      }}
    >
      {showHistory && (
        <MobileIconButton icon={open ? "X" : "list"} onPress={onHistoryPress} />
      )}
      <MobileIconButton icon="+" onPress={onNewChat} />
    </View>
  );
};

const MobileIconButton = ({
  icon,
  onPress,
}: {
  icon: "list" | "+" | "X";
  onPress: () => void;
}) => {
  return (
    <Pressable
      onPress={onPress}
      style={{
        alignItems: "center",
        backgroundColor: primitives.neutrals100,
        borderColor: primitives.neutrals300,
        borderRadius: borderRadius.medium,
        borderWidth: 1,
        height: 40,
        justifyContent: "center",
        width: 40,
      }}
    >
      <Icon icon={icon} color="primaryDark" size={20} />
    </Pressable>
  );
};

const MobileHistoryOverlay = ({
  chats,
  activeChatId,
  openActionsChatId,
  onClose,
  onSelect,
  onDelete,
  onToggleActions,
  onCloseActions,
}: {
  chats: ChatSummary[];
  activeChatId?: string;
  openActionsChatId?: string;
  onClose: () => void;
  onSelect: (chatId: string) => void;
  onDelete: (chatId: string) => void;
  onToggleActions: (chatId: string) => void;
  onCloseActions: () => void;
}) => {
  return (
    <View
      style={{
        backgroundColor: "rgba(30, 30, 30, 0.24)",
        bottom: 0,
        left: 0,
        padding: 16,
        paddingTop: 68,
        position: "absolute",
        right: 0,
        top: 0,
        zIndex: 40,
      }}
    >
      <Pressable
        onPress={onClose}
        style={{
          bottom: 0,
          left: 0,
          position: "absolute",
          right: 0,
          top: 0,
        }}
      />
      <View
        style={{
          backgroundColor: primitives.neutrals100,
          borderRadius: 16,
          maxHeight: 420,
          overflow: "visible",
          padding: 12,
          position: "relative",
          width: "100%",
        }}
      >
        <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
          <View style={{ flex: 1 }}>
            <Title size="small">Tidigare frågor</Title>
          </View>
        </View>
        <ScrollView contentContainerStyle={{ gap: 6, overflow: "visible" }}>
          {chats.map((chat) => {
            const active = chat.id === activeChatId;
            return (
              <HistoryChatRow
                key={chat.id}
                chat={chat}
                active={active}
                actionsOpen={openActionsChatId === chat.id}
                onDelete={() => {
                  onDelete(chat.id);
                }}
                onToggleActions={() => onToggleActions(chat.id)}
                onSelect={() => {
                  onSelect(chat.id);
                  onClose();
                }}
              />
            );
          })}
        </ScrollView>
        {openActionsChatId && (
          <Pressable
            onPress={onCloseActions}
            style={{
              bottom: 0,
              left: 0,
              position: "absolute",
              right: 0,
              top: 0,
              zIndex: 10000,
            }}
          />
        )}
      </View>
    </View>
  );
};

const HistoryChatRow = ({
  chat,
  active,
  actionsOpen,
  showActionsOnHover = false,
  onDelete,
  onSelect,
  onToggleActions,
}: {
  chat: ChatSummary;
  active: boolean;
  actionsOpen: boolean;
  showActionsOnHover?: boolean;
  onDelete: () => void;
  onSelect: () => void;
  onToggleActions: () => void;
}) => {
  const [hovered, setHovered] = useState(false);
  const showActions = !showActionsOnHover || hovered || actionsOpen;

  return (
    <View
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      style={{
        backgroundColor: active ? primitives.primary100 : "transparent",
        borderColor: active ? primitives.primary300 : "transparent",
        borderRadius: borderRadius.medium,
        borderWidth: 1,
        flexDirection: "row",
        gap: 8,
        paddingLeft: 10,
        paddingRight: 4,
        paddingVertical: 6,
        position: "relative",
        alignItems: "center",
        zIndex: actionsOpen ? 10000 : 1,
      }}
    >
      <Pressable onPress={onSelect} style={{ flex: 1, gap: 4, paddingTop: 4 }}>
        <Label size="medium" numberOfLines={1}>
          {chat.title ?? "Ny chatt"}
        </Label>
        <Body size="small" color="secondary">
          {new Date(chat.updatedAt).toLocaleDateString("sv-SE")}
        </Body>
      </Pressable>
      <Pressable
        onPress={onToggleActions}
        pointerEvents={showActions ? "auto" : "none"}
        style={{
          alignItems: "center",
          borderRadius: borderRadius.medium,
          height: 36,
          justifyContent: "center",
          opacity: showActions ? 1 : 0,
          width: 36,
        }}
      >
        <Icon icon="kebabHorizontal" color="disabled" size={14} />
      </Pressable>
      {actionsOpen && (
        <View
          style={{
            backgroundColor: primitives.neutrals100,
            borderColor: primitives.neutrals300,
            borderRadius: borderRadius.medium,
            borderWidth: 1,
            boxShadow: "0px 4px 12px rgba(30, 30, 30, 0.12)",
            padding: 6,
            position: "absolute",
            right: 0,
            top: 42,
            width: 160,
            zIndex: 10001,
          }}
        >
          <Pressable onPress={onDelete}>
            <View style={{ padding: 10 }}>
              <Label size="medium">Ta bort chatten</Label>
            </View>
          </Pressable>
        </View>
      )}
    </View>
  );
};

const EmptyState = ({
  examples,
  onExamplePress,
}: {
  examples: string[];
  onExamplePress: (value: string) => void;
}) => {
  return (
    <View
      style={{
        alignSelf: "center",
        gap: 20,
        maxWidth: CHAT_CONTENT_MAX_WIDTH,
        width: "100%",
      }}
    >
      <View style={{ alignItems: "center", gap: 12 }}>
        <View
          style={{
            alignItems: "center",
            backgroundColor: primitives.primary200,
            borderRadius: 999,
            height: 66,
            justifyContent: "center",
            width: 66,
          }}
        >
          <View
            style={{
              alignItems: "center",
              backgroundColor: primitives.primary800,
              borderRadius: 999,
              height: 44,
              justifyContent: "center",
              width: 44,
            }}
          >
            <Pictogram
              pictogram="sparkle"
              type="large"
              color="primaryLight"
              size={28}
            />
          </View>
        </View>
        <Title size="large" style={{ textAlign: "center" }}>
          Vad bygger du idag?
        </Title>
        <Body color="secondary" style={{ textAlign: "center" }}>
          Få hjälp att tänka igenom steg, material, verktyg och återbrukade
          fynd.
        </Body>
      </View>
      <View style={{ gap: 8 }}>
        {examples.map((example) => (
          <Pressable key={example} onPress={() => onExamplePress(example)}>
            <View
              style={{
                backgroundColor: primitives.secondary100,
                borderColor: primitives.secondary500,
                borderRadius: borderRadius.medium,
                borderWidth: 1,
                flexDirection: "row",
                gap: 10,
                padding: 12,
              }}
            >
              <View
                style={{
                  backgroundColor: primitives.accent500,
                  borderRadius: 999,
                  height: 8,
                  marginTop: 8,
                  width: 8,
                }}
              />
              <Body style={{ flex: 1 }}>{example}</Body>
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
};

const MessageBubble = ({ message }: { message: ChatMessage }) => {
  const colors = useThemeColor();
  const isUser = message.role === "user";
  const contentParts = parseAssistantContent(message.content);
  let productDisplayIndex = 0;

  return (
    <View
      style={{
        alignSelf: isUser ? "flex-end" : "stretch",
        backgroundColor: isUser ? primitives.primary800 : "transparent",
        borderColor: primitives.primary800,
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
            maxWidth: CHAT_CONTENT_MAX_WIDTH,
            width: "100%",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <InlineThinkingSpinner />
            <Body color="secondary">Tänker...</Body>
          </View>
        </View>
      ) : isUser ? (
        <Body color="primaryLight">{message.content}</Body>
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
                    maxWidth: CHAT_CONTENT_MAX_WIDTH,
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
  | { type: "productDisplay" };

const parseAssistantContent = (content: string): AssistantContentPart[] => {
  const parts: AssistantContentPart[] = [];
  const tagRegex = /<rebuildr-products\s+ids=(['"])(.*?)\1\s*\/?\s*>/g;
  let cursor = 0;

  for (const match of content.matchAll(tagRegex)) {
    if (match.index === undefined) continue;
    parts.push({ type: "text", content: content.slice(cursor, match.index) });
    parts.push({ type: "productDisplay" });
    cursor = match.index + match[0].length;
  }

  const tail = content.slice(cursor).replace(/<rebuildr-products[^>]*$/g, "");
  parts.push({ type: "text", content: tail });

  return parts;
};

const ChatProductDisplay = ({ display }: { display: ProductDisplay }) => {
  const products = display.products.slice(0, 8);
  if (products.length === 1) {
    return <ChatProductCard product={products[0]} variant="single" />;
  }

  return (
    <View style={{ gap: 10 }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 12, paddingRight: 4 }}
      >
        {products.map((product) => (
          <View key={product.id} style={{ width: 214 }}>
            <ChatProductCard product={product} variant="gallery" />
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const ChatProductCard = ({
  product,
  variant,
}: {
  product: DisplayedProduct;
  variant: "single" | "gallery";
}) => {
  const colors = useThemeColor();
  const isSingle = variant === "single";
  const detail = [
    product.category,
    product.brand,
    conditions[product.condition]?.name,
  ]
    .filter(Boolean)
    .join(" • ");
  const fulfillment = [
    product.pickupEnabled ? "Hämtning" : undefined,
    product.deliveryEnabled ? "Leverans" : undefined,
  ].filter(Boolean);

  return (
    <Pressable
      onPress={() =>
        router.navigate({
          pathname: "/product/[productId]",
          params: { productId: product.id },
        })
      }
      style={({ pressed }) => ({
        backgroundColor: primitives.neutrals100,
        borderColor: primitives.neutrals300,
        borderRadius: borderRadius.medium,
        borderWidth: 1,
        flexDirection: isSingle ? "row" : "column",
        gap: isSingle ? 12 : 9,
        opacity: pressed ? 0.82 : 1,
        overflow: "hidden",
        padding: 8,
        width: "100%",
      })}
    >
      <Image
        source={product.imageUrl ?? PlaceholderProduct.uri}
        style={{
          aspectRatio: 1,
          backgroundColor: primitives.neutrals200,
          borderRadius: borderRadius.small,
          height: isSingle ? 118 : undefined,
          width: isSingle ? 118 : "100%",
        }}
      />
      <View style={{ flex: 1, gap: 8, padding: isSingle ? 4 : 2 }}>
        <View style={{ gap: 4 }}>
          <Title size="small" numberOfLines={2}>
            {product.title}
          </Title>
          {!!detail && (
            <Body size="small" color="secondary" numberOfLines={1}>
              {detail}
            </Body>
          )}
        </View>
        <View style={{ gap: 8, marginTop: "auto" }}>
          <Label size="large">
            {product.isGiveaway ? "Gratis" : formatPrice(product.price)}
          </Label>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
            {fulfillment.map((label) => (
              <View
                key={label}
                style={{
                  backgroundColor: primitives.secondary100,
                  borderRadius: borderRadius.xSmall,
                  paddingHorizontal: 7,
                  paddingVertical: 3,
                }}
              >
                <Label size="small" color="secondary">
                  {label}
                </Label>
              </View>
            ))}
            <View
              style={{
                alignItems: "center",
                backgroundColor: colors.buttons.tonal.enabled,
                borderRadius: borderRadius.xSmall,
                flexDirection: "row",
                gap: 4,
                paddingHorizontal: 7,
                paddingVertical: 3,
              }}
            >
              <Label size="small" color="link">
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
