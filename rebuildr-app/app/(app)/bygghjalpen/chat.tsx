import { useReactiveVar } from "@apollo/client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import Head from "expo-router/head";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Markdown from "react-native-markdown-display";
import {
  ActivityIndicator,
  Image,
  LayoutChangeEvent,
  Pressable,
  ScrollView,
  TextInput,
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

  const handleTopBarLayout = useCallback((event: LayoutChangeEvent) => {
    setTopBarHeight(event.nativeEvent.layout.height);
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
    }
  };

  const startNewChat = () => {
    setActiveChatId(undefined);
    setMessages([]);
    setError(undefined);
    setShowMobileHistory(false);
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

      const assistantId = `assistant-${Date.now()}`;
      setMessages((current) => [
        ...current,
        { id: `user-${Date.now()}`, role: "user", content: message },
        { id: assistantId, role: "assistant", content: "", pending: true },
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
            item.id === assistantId ? { ...item, pending: false } : item,
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
      }
    },
    [activeChatId, input, isLoggedIn, loadChats, streaming],
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
            {!isDesktop && (
              <MobileChatActions
                showHistory={isLoggedIn}
                open={showMobileHistory}
                onHistoryPress={() =>
                  setShowMobileHistory((current) => !current)
                }
                onNewChat={startNewChat}
              />
            )}

            {!isDesktop && isLoggedIn && showMobileHistory && (
              <MobileHistoryOverlay
                chats={chats}
                activeChatId={activeChatId}
                onClose={() => setShowMobileHistory(false)}
                onDelete={deleteChat}
                onSelect={loadMessages}
              />
            )}

            {isDesktop && isLoggedIn && (
              <HistorySidebar
                chats={chats}
                activeChatId={activeChatId}
                onSelect={loadMessages}
                onNewChat={startNewChat}
                onDelete={deleteChat}
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
                    paddingTop: isDesktop ? 24 : 72,
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
                      value={input}
                      onChangeText={setInput}
                      placeholder="Skriv din fråga..."
                      placeholderTextColor={colors.text.secondary}
                      multiline
                      editable={!streaming}
                      onKeyPress={({ nativeEvent }) => {
                        if (
                          nativeEvent.key === "Enter" &&
                          !input.includes("\n")
                        ) {
                          sendMessage();
                        }
                      }}
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
                      disabled={!input.trim()}
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
  onSelect,
  onNewChat,
  onDelete,
}: {
  chats: ChatSummary[];
  activeChatId?: string;
  onSelect: (chatId: string) => void;
  onNewChat: () => void;
  onDelete: (chatId: string) => void;
}) => {
  const [openActionsChatId, setOpenActionsChatId] = useState<string>();

  return (
    <View
      style={{
        backgroundColor: primitives.neutrals100,
        borderRadius: 16,
        gap: 12,
        padding: 12,
        width: 300,
      }}
    >
      <View style={{ gap: 4 }}>
        <Title size="small">Tidigare frågor</Title>
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
                setOpenActionsChatId(undefined);
                onDelete(chat.id);
              }}
              onToggleActions={() =>
                setOpenActionsChatId((current) =>
                  current === chat.id ? undefined : chat.id,
                )
              }
              onSelect={() => onSelect(chat.id)}
            />
          );
        })}
      </ScrollView>
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
        left: horizontalPadding.mobile,
        position: "absolute",
        top: 16,
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
  onClose,
  onSelect,
  onDelete,
}: {
  chats: ChatSummary[];
  activeChatId?: string;
  onClose: () => void;
  onSelect: (chatId: string) => void;
  onDelete: (chatId: string) => void;
}) => {
  const [openActionsChatId, setOpenActionsChatId] = useState<string>();

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
                  setOpenActionsChatId(undefined);
                  onDelete(chat.id);
                }}
                onToggleActions={() =>
                  setOpenActionsChatId((current) =>
                    current === chat.id ? undefined : chat.id,
                  )
                }
                onSelect={() => {
                  onSelect(chat.id);
                  onClose();
                }}
              />
            );
          })}
        </ScrollView>
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
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <ActivityIndicator color={primitives.primary800} />
          <Body color="secondary">Tänker...</Body>
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
                  <Markdown style={markdownStyle(colors)}>
                    {part.content}
                  </Markdown>
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

const markdownStyle = (colors: ReturnType<typeof useThemeColor>) => ({
  body: {
    color: colors.text.primaryDark,
    fontFamily: "Inter-Regular",
    fontSize: 15,
    lineHeight: 23,
  },
  bullet_list: { marginBottom: 8 },
  ordered_list: { marginBottom: 8 },
  heading1: {
    color: colors.text.primaryDark,
    fontFamily: "Poppins-SemiBold",
    fontSize: 20,
    marginBottom: 8,
  },
  heading2: {
    color: colors.text.primaryDark,
    fontFamily: "Poppins-SemiBold",
    fontSize: 17,
    marginBottom: 6,
  },
  link: { color: colors.text.link },
  table: {
    borderColor: primitives.secondary500,
    borderWidth: 1,
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
        boxShadow: "0px 6px 18px rgba(30, 30, 30, 0.08)",
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
                  borderColor: primitives.secondary500,
                  borderRadius: borderRadius.xSmall,
                  borderWidth: 1,
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
