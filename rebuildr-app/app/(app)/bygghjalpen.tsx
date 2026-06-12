import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";
import Head from "expo-router/head";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Markdown from "react-native-markdown-display";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  TextInput,
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

const getAuthHeaders = async () => {
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

export default function BygghjalpenPage() {
  const colors = useThemeColor();
  const { isDesktop } = useScreenType();
  const scrollRef = useRef<ScrollView>(null);
  const isLoggedIn = isLoggedInVar();
  const [chats, setChats] = useState<ChatSummary[]>([]);
  const [activeChatId, setActiveChatId] = useState<string>();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loadingChat, setLoadingChat] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string>();

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

  const selectedChat = useMemo(
    () => chats.find((chat) => chat.id === activeChatId),
    [activeChatId, chats],
  );

  const loadMessages = async (chatId: string) => {
    setLoadingChat(true);
    setError(undefined);
    try {
      const nextMessages = await readJson<ChatMessage[]>(
        `/bygghjalpen/chats/${chatId}/messages`,
      );
      setActiveChatId(chatId);
      setMessages(nextMessages);
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
  };

  const deleteActiveChat = async () => {
    if (!activeChatId || !isLoggedIn) return;
    try {
      await fetch(`${apiUrl}/bygghjalpen/chats/${activeChatId}`, {
        method: "DELETE",
        headers: await getAuthHeaders(),
      });
      startNewChat();
      loadChats();
    } catch {
      setError("Kunde inte ta bort chatten.");
    }
  };

  const sendMessage = async () => {
    const message = input.trim();
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
  };

  const examples = [
    "Vilket virke passar till en enkel altan?",
    "Hitta begagnade innerdörrar på RebuildR",
    "Hur planerar jag materialåtgång för gipsvägg?",
  ];

  return (
    <>
      <Head>
        <title>Bygghjälpen | RebuildR</title>
        <meta
          name="description"
          content="Bygghjälpen hjälper dig med bygg, renovering, hemmafix och återbruk av byggmaterial."
        />
      </Head>

      <View style={{ flex: 1, backgroundColor: colors.background.secondary }}>
        <TopBar theme="light" showSearchBar={false} />
        <View
          style={{
            flex: 1,
            flexDirection: isDesktop ? "row" : "column",
            paddingHorizontal: isDesktop
              ? horizontalPadding.desktop
              : horizontalPadding.mobile,
            paddingVertical: isDesktop ? 24 : 12,
            gap: 16,
          }}
        >
          {isDesktop && isLoggedIn && (
            <HistorySidebar
              chats={chats}
              activeChatId={activeChatId}
              onSelect={loadMessages}
              onNewChat={startNewChat}
            />
          )}

          <View
            style={{
              flex: 1,
              minHeight: 0,
              backgroundColor: colors.background.neutral,
              borderColor: colors.dividers.secondary,
              borderRadius: borderRadius.medium,
              borderWidth: 1,
              overflow: "hidden",
            }}
          >
            <View
              style={{
                borderBottomColor: colors.dividers.neutral,
                borderBottomWidth: 1,
                flexDirection: "row",
                justifyContent: "space-between",
                gap: 12,
                padding: 16,
              }}
            >
              <View style={{ flex: 1, gap: 4 }}>
                <Title size="medium">Bygghjälpen</Title>
                <Body size="small" color="secondary">
                  {selectedChat?.title ??
                    "Fråga om bygg, hemmafix, materialval eller publika RebuildR-annonser."}
                </Body>
              </View>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <Button
                  type="tonal"
                  icon="+"
                  label="Ny chat"
                  onPress={startNewChat}
                />
                {activeChatId && isLoggedIn && (
                  <Button
                    type="danger"
                    icon="trash"
                    onPress={deleteActiveChat}
                  />
                )}
              </View>
            </View>

            {!isDesktop && isLoggedIn && chats.length > 0 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{
                  borderBottomColor: colors.dividers.neutral,
                  borderBottomWidth: 1,
                }}
                contentContainerStyle={{ gap: 8, padding: 12 }}
              >
                {chats.map((chat) => {
                  const active = chat.id === activeChatId;
                  return (
                    <Pressable
                      key={chat.id}
                      onPress={() => loadMessages(chat.id)}
                    >
                      <View
                        style={{
                          backgroundColor: active
                            ? colors.background.primary
                            : primitives.secondary100,
                          borderColor: colors.dividers.secondary,
                          borderRadius: borderRadius.small,
                          borderWidth: 1,
                          maxWidth: 220,
                          paddingHorizontal: 10,
                          paddingVertical: 8,
                        }}
                      >
                        <Label size="small" numberOfLines={1}>
                          {chat.title ?? "Ny chat"}
                        </Label>
                      </View>
                    </Pressable>
                  );
                })}
              </ScrollView>
            )}

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
                  padding: isDesktop ? 24 : 16,
                }}
              >
                {messages.length === 0 ? (
                  <EmptyState examples={examples} onExamplePress={setInput} />
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
                borderTopColor: colors.dividers.neutral,
                borderTopWidth: 1,
                padding: 12,
              }}
            >
              <View
                style={{
                  alignItems: "flex-end",
                  backgroundColor: primitives.secondary100,
                  borderColor: colors.dividers.secondary,
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
                    if (nativeEvent.key === "Enter" && !input.includes("\n")) {
                      sendMessage();
                    }
                  }}
                  style={{
                    color: colors.text.primaryDark,
                    flex: 1,
                    fontFamily: "Poppins-Regular",
                    fontSize: 15,
                    maxHeight: 132,
                    minHeight: 28,
                    outlineStyle: "none",
                  }}
                />
                <Button
                  type="filled"
                  icon={streaming ? undefined : "arrowUp"}
                  loading={streaming}
                  disabled={!input.trim()}
                  onPress={sendMessage}
                />
              </View>
              <Label size="small" color="secondary" style={{ marginTop: 8 }}>
                Bygghjälpen kan göra misstag. Kontrollera alltid kritiska beslut
                med fackperson.
              </Label>
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
}: {
  chats: ChatSummary[];
  activeChatId?: string;
  onSelect: (chatId: string) => void;
  onNewChat: () => void;
}) => {
  const colors = useThemeColor();
  return (
    <View
      style={{
        backgroundColor: colors.background.neutral,
        borderColor: colors.dividers.secondary,
        borderRadius: borderRadius.medium,
        borderWidth: 1,
        gap: 12,
        padding: 12,
        width: 300,
      }}
    >
      <Button type="filled" icon="+" label="Ny chat" onPress={onNewChat} />
      <ScrollView contentContainerStyle={{ gap: 6 }}>
        {chats.map((chat) => {
          const active = chat.id === activeChatId;
          return (
            <Pressable key={chat.id} onPress={() => onSelect(chat.id)}>
              <View
                style={{
                  backgroundColor: active
                    ? colors.background.primary
                    : "transparent",
                  borderRadius: borderRadius.small,
                  gap: 4,
                  paddingHorizontal: 10,
                  paddingVertical: 10,
                }}
              >
                <Label size="medium" numberOfLines={1}>
                  {chat.title ?? "Ny chat"}
                </Label>
                <Body size="small" color="secondary">
                  {new Date(chat.updatedAt).toLocaleDateString("sv-SE")}
                </Body>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
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
  const colors = useThemeColor();
  return (
    <View
      style={{ alignSelf: "center", gap: 18, maxWidth: 720, width: "100%" }}
    >
      <View style={{ alignItems: "center", gap: 10 }}>
        <View
          style={{
            alignItems: "center",
            backgroundColor: colors.logo.vector,
            borderRadius: 16,
            height: 52,
            justifyContent: "center",
            width: 52,
          }}
        >
          <Icon icon="magic" color="primaryLight" size={24} />
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
                borderColor: colors.dividers.secondary,
                borderRadius: borderRadius.small,
                borderWidth: 1,
                padding: 12,
              }}
            >
              <Body>{example}</Body>
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
        backgroundColor: isUser ? colors.logo.vector : primitives.secondary100,
        borderColor: isUser ? colors.logo.vector : colors.dividers.secondary,
        borderRadius: borderRadius.medium,
        borderWidth: 1,
        maxWidth: "82%",
        paddingHorizontal: 14,
        paddingVertical: 12,
      }}
    >
      {message.pending && !message.content ? (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <ActivityIndicator color={colors.logo.vector} />
          <Body color="secondary">Tänker...</Body>
        </View>
      ) : isUser ? (
        <Body color="primaryLight">{message.content}</Body>
      ) : (
        <Markdown
          style={{
            body: {
              color: colors.text.primaryDark,
              fontFamily: "Poppins-Regular",
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
              borderColor: colors.dividers.secondary,
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
