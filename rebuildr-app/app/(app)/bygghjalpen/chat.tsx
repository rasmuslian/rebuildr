import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import Head from "expo-router/head";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Markdown from "react-native-markdown-display";
import {
  ActivityIndicator,
  LayoutChangeEvent,
  Pressable,
  ScrollView,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";

import { isLoggedInVar } from "@/apollo/config";
import { Button } from "@components/buttons/button";
import TopBar from "@components/navigation/top-bar/top-bar";
import { Body, Label, Title } from "@components/typography/text";
import { primitives } from "@constants/colors";
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
};

type StreamEvent = {
  event: string;
  data: unknown;
};

const GUEST_ID_KEY = "bygghjalpen_guest_id";

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
  const isLoggedIn = isLoggedInVar();
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
    "Hitta begagnade innerdörrar på RebuildR",
    "Hur planerar jag materialåtgång för gipsvägg?",
  ];

  return (
    <>
      <Head>
        <title>Bygghjälpen chat | RebuildR</title>
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
                    flexGrow: 1,
                    gap: 14,
                    justifyContent: messages.length ? "flex-start" : "center",
                    paddingBottom: isDesktop ? 24 : 16,
                    paddingHorizontal: isDesktop ? 24 : 0,
                    paddingTop: isDesktop ? 24 : 72,
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
                  borderTopColor: primitives.secondary500,
                  borderTopWidth: 1,
                  padding: 12,
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
                    }}
                  />
                  <Button
                    type="filled"
                    icon={streaming ? undefined : "arrowUp"}
                    loading={streaming}
                    disabled={!input.trim()}
                    onPress={() => sendMessage()}
                  />
                </View>
                <Label size="small" color="secondary" style={{ marginTop: 8 }}>
                  Bygghjälpen kan göra misstag. Kontrollera alltid kritiska
                  beslut med fackperson.
                </Label>
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
  onDelete,
  onSelect,
  onToggleActions,
}: {
  chat: ChatSummary;
  active: boolean;
  actionsOpen: boolean;
  onDelete: () => void;
  onSelect: () => void;
  onToggleActions: () => void;
}) => {
  return (
    <View
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
        style={{
          alignItems: "center",
          borderRadius: borderRadius.medium,
          height: 36,
          justifyContent: "center",
          width: 36,
        }}
      >
        <Icon icon="kebab" color="primaryDark" size={18} />
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
      style={{ alignSelf: "center", gap: 20, maxWidth: 760, width: "100%" }}
    >
      <View style={{ alignItems: "center", gap: 12 }}>
        <View
          style={{
            alignItems: "center",
            backgroundColor: primitives.primary200,
            borderRadius: 999,
            height: 64,
            justifyContent: "center",
            width: 64,
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
            <Icon icon="magic" color="primaryLight" size={22} />
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
  return (
    <View
      style={{
        alignSelf: isUser ? "flex-end" : "flex-start",
        backgroundColor: isUser ? primitives.primary800 : "transparent",
        borderColor: primitives.primary800,
        borderRadius: isUser ? borderRadius.medium : 0,
        borderWidth: isUser ? 1 : 0,
        maxWidth: "82%",
        paddingHorizontal: isUser ? 14 : 0,
        paddingVertical: isUser ? 12 : 0,
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
        <Markdown
          style={{
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
          }}
        >
          {message.content}
        </Markdown>
      )}
    </View>
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
