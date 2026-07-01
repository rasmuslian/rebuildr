import { useReactiveVar } from "@apollo/client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";
import Head from "expo-router/head";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  LayoutChangeEvent,
  Pressable,
  ScrollView,
  useWindowDimensions,
  View,
} from "react-native";

import { isLoggedInVar } from "@/apollo/config";
import { AterbyggarenPageHeader } from "@components/aterbyggaren/page-header";
import TopBar from "@components/navigation/top-bar/top-bar";
import { Body, Headline } from "@components/typography/text";
import { primitives } from "@constants/colors";
import { horizontalPadding } from "@constants/sizes";
import { useScreenType } from "@hooks/useScreenType";
import { useThemeColor } from "@hooks/useThemeColor";

type ChatSummary = {
  id: string;
  title?: string;
  createdAt: string;
  updatedAt: string;
};

const HISTORY_PAGE_MAX_WIDTH = 640;
const apiUrl = process.env.EXPO_PUBLIC_API_URL;

const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const token = await AsyncStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const readJson = async <T,>(path: string): Promise<T> => {
  const response = await fetch(`${apiUrl}${path}`, {
    headers: await getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Request failed");
  return response.json();
};

export default function AterbyggarenHistoryPage() {
  const colors = useThemeColor();
  const { isDesktop } = useScreenType();
  const { height: windowHeight } = useWindowDimensions();
  const isLoggedIn = useReactiveVar(isLoggedInVar);
  const [topBarHeight, setTopBarHeight] = useState(0);
  const [chats, setChats] = useState<ChatSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  const handleTopBarLayout = useCallback((event: LayoutChangeEvent) => {
    setTopBarHeight(event.nativeEvent.layout.height);
  }, []);

  const loadChats = useCallback(async () => {
    if (!isLoggedIn) {
      setChats([]);
      return;
    }

    setLoading(true);
    setError(undefined);
    try {
      const nextChats = await readJson<ChatSummary[]>("/aterbyggaren/chats");
      setChats(nextChats);
    } catch {
      setError("Kunde inte hämta tidigare frågor.");
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn]);

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
      loadChats();
    }, [loadChats]),
  );

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  return (
    <>
      <Head>
        <title>RebuildR - Tidigare frågor</title>
        <meta
          name="description"
          content="Fortsätt med dina tidigare frågor till Återbyggaren."
        />
      </Head>

      <View
        style={{
          backgroundColor: primitives.secondary100,
          flex: 1,
          height: windowHeight,
          overflow: "hidden",
        }}
      >
        <View onLayout={handleTopBarLayout}>
          <TopBar theme="dark" showSearchBar={false} />
        </View>
        <View
          style={{
            backgroundColor: primitives.secondary100,
            height: Math.max(windowHeight - topBarHeight, 0),
            overflow: "hidden",
          }}
        >
          <View
            style={{
              alignSelf: "center",
              flex: 1,
              maxWidth: HISTORY_PAGE_MAX_WIDTH,
              paddingHorizontal: isDesktop ? 0 : horizontalPadding.mobile,
              paddingTop: isDesktop ? 48 : 14,
              width: "100%",
            }}
          >
            <AterbyggarenPageHeader
              isDesktop={isDesktop}
              onHistoryPress={loadChats}
              onNewChat={() => router.navigate("/aterbyggaren/chat")}
            />

            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingBottom: 28, paddingTop: 32 }}
              showsVerticalScrollIndicator={false}
            >
              <View style={{ gap: 18 }}>
                <Headline
                  size="small"
                  heading={1}
                  style={{ color: primitives.primary800 }}
                >
                  Tidigare frågor
                </Headline>

                {loading ? (
                  <View style={{ alignItems: "center", paddingTop: 40 }}>
                    <ActivityIndicator color={colors.logo.vector} />
                  </View>
                ) : error ? (
                  <Body color="error">{error}</Body>
                ) : chats.length ? (
                  <View>
                    {chats.map((chat) => (
                      <HistoryRow key={chat.id} chat={chat} />
                    ))}
                  </View>
                ) : (
                  <Body color="secondary">
                    Dina tidigare frågor visas här när du har startat en chatt.
                  </Body>
                )}
              </View>
            </ScrollView>
          </View>
        </View>
      </View>
    </>
  );
}

const HistoryRow = ({ chat }: { chat: ChatSummary }) => {
  const colors = useThemeColor();

  return (
    <Pressable
      onPress={() =>
        router.navigate({
          pathname: "/aterbyggaren/chat",
          params: { chatId: chat.id },
        })
      }
      style={({ pressed }) => ({
        borderBottomColor: colors.dividers.neutral,
        borderBottomWidth: 1,
        opacity: pressed ? 0.7 : 1,
        paddingVertical: 18,
      })}
    >
      <View
        style={{
          alignItems: "flex-start",
          flexDirection: "row",
          gap: 16,
          justifyContent: "space-between",
        }}
      >
        <Body style={{ flex: 1 }} numberOfLines={2}>
          {chat.title ?? "Ny fråga"}
        </Body>
        <Body color="secondary">{formatChatTimestamp(chat.updatedAt)}</Body>
      </View>
    </Pressable>
  );
};

const formatChatTimestamp = (value: string) => {
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const diffHours = Math.max(Math.floor(diffMs / 3_600_000), 0);

  if (diffHours < 24) return `${Math.max(diffHours, 1)}h`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} dagar`;

  return date.toISOString().slice(0, 10);
};
