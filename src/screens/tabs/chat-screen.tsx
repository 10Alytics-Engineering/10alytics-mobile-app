import { router } from "expo-router";
import { SymbolView } from "expo-symbols";
import { PressableScale } from "pressto";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Image,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, { FadeInRight } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import useThemeColors from "@/contexts/ThemeColors";
import {
  formatChatPreview,
  getConversationTitle,
  useChatConversations,
  useChatRealtime,
} from "@/hooks/use-chat";
import type { ChatConversation } from "@/lib/api-client";
import { useAuthStore } from "@/utils/auth-store";

type FilterKey = "all" | "pod" | "classroom" | "instructor_dm";
const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "classroom", label: "Classroom" },
  { key: "pod", label: "POD Group" },
  { key: "instructor_dm", label: "Instructors" },
];

const BRAND = "#DA6728";
const ONLINE = "#2BC177";

function getConversationAvatar(
  conversation: ChatConversation,
  selfId?: string | number | null,
): string | undefined {
  if (conversation.type === "instructor_dm") {
    const other = conversation.participants?.find(
      (p) => p.user && String(p.user.id) !== String(selfId ?? ""),
    );
    return other?.user?.profile_photo_url ?? undefined;
  }
  const firstWithPhoto = conversation.participants?.find(
    (p) => p.user?.profile_photo_url,
  );
  return firstWithPhoto?.user?.profile_photo_url ?? undefined;
}


function isConversationOnline(conversation: ChatConversation): boolean {
  // Heuristic: treat conversations with recent activity (last 5min) as online.
  if (!conversation.last_message_at) return false;
  const diff = Date.now() - new Date(conversation.last_message_at).getTime();
  return diff >= 0 && diff < 1000 * 60 * 60 * 24;
}

export function ChatScreen() {
  const colors = useThemeColors();
  const isDark = colors.isDark;
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const user = useAuthStore((state) => state.user);
  const {
    data: conversations = [],
    isLoading,
    isError,
    refetch,
  } = useChatConversations();

  const conversationIds = conversations.map((c) => c.id);

  useChatRealtime(conversationIds);

  const filteredConversations = useMemo(() => {
    const lower = searchQuery.toLowerCase();
    return conversations.filter((c) => {
      const matchesFilter = filter === "all" ? true : c.type === filter;
      const matchesSearch = getConversationTitle(c)
        .toLowerCase()
        .includes(lower);
      return matchesFilter && matchesSearch;
    });
  }, [conversations, filter, searchQuery]);

  const dividerColor = isDark ? "#262626" : "#e3e3e3";
  const mutedText = isDark ? "#9CA3AF" : "#6B7280";
  const placeholderText = isDark ? "#6B7280" : "#9CA3AF";
  const surface = isDark ? "#171717" : "#FFFFFF";
  const inputBorder = isDark ? "#262626" : "#E5E7EB";

  const renderItem = ({
    item,
    index,
  }: {
    item: ChatConversation;
    index: number;
  }) => {
    const title = getConversationTitle(item);
    const unread = item.unread_count ?? 0;
    const avatarUrl = getConversationAvatar(item, user?.id);
    const online = isConversationOnline(item);

    return (
      <Animated.View entering={FadeInRight.delay(80 + index * 40).springify()}>
        <PressableScale
          onPress={() =>
            router.push({
              pathname: "/chat-room" as never,
              params: { id: String(item.id), name: title },
            })
          }
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingVertical: 16,
            paddingHorizontal: 16,
          }}
        >
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: isDark ? "#262626" : "#F4F4F5",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            {avatarUrl ? (
              <Image
                source={{ uri: avatarUrl }}
                style={{ width: "100%", height: "100%" }}
              />
            ) : (
              <Text style={{ color: mutedText, fontWeight: "700", fontSize: 20 }}>
                {title.slice(0, 1).toUpperCase()}
              </Text>
            )}
          </View>
          {/* Status dot */}
          <View
            style={{
              position: "absolute",
              left: 16 + 56 - 14,
              top: 16 + 56 - 14,
              width: 14,
              height: 14,
              borderRadius: 7,
              backgroundColor: online ? ONLINE : "#D1D5DB",
              borderWidth: 2,
              borderColor: colors.bg,
            }}
          />

          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text
              numberOfLines={1}
              style={{
                color: colors.text,
                fontSize: 16,
                fontWeight: "700",
                marginBottom: 4,
              }}
            >
              {title}
            </Text>
            <Text
              numberOfLines={1}
              style={{ color: mutedText, fontSize: 14 }}
            >
              {formatChatPreview(item.last_message)}
            </Text>
          </View>

          <View style={{ alignItems: "flex-end", marginLeft: 8, minWidth: 50 }}>
            <Text style={{ color: mutedText, fontSize: 13, marginBottom: 6 }}>
              {formatConversationTime(item.last_message_at)}
            </Text>
            {unread > 0 && (
              <View
                style={{
                  minWidth: 22,
                  height: 22,
                  paddingHorizontal: 6,
                  borderRadius: 11,
                  backgroundColor: ONLINE,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{ color: "#fff", fontSize: 12, fontWeight: "700" }}
                >
                  {unread > 99 ? "99+" : unread}
                </Text>
              </View>
            )}
          </View>
        </PressableScale>
        <View
          style={{
            height: 1,
            backgroundColor: dividerColor,
            marginHorizontal: 16,
          }}
        />
      </Animated.View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 16 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            paddingVertical: 8,
          }}
        >
          <PressableScale onPress={() => router.back()}>
            <SymbolView
              name="chevron.left"
              size={20}
              tintColor={colors.text}
            />
          </PressableScale>
          <Text
            style={{ color: colors.text, fontSize: 24, fontWeight: "800" }}
          >
            Chatroom
          </Text>
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: surface,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: inputBorder,
            paddingHorizontal: 14,
            height: 48,
            marginTop: 12,
            marginBottom: 16,
          }}
        >
          <SymbolView
            name="magnifyingglass"
            size={18}
            tintColor={mutedText}
          />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search"
            placeholderTextColor={placeholderText}
            style={{
              flex: 1,
              marginLeft: 10,
              fontSize: 15,
              color: colors.text,
            }}
          />
        </View>

        <View style={{ flexDirection: "row", gap: 24, marginBottom: 8 }}>
          {FILTERS.map((f) => {
            const active = filter === f.key;
            return (
              <PressableScale
                key={f.key}
                onPress={() => setFilter(f.key)}
                style={{ paddingBottom: 8 }}
              >
                <Text
                  style={{
                    color: active ? BRAND : mutedText,
                    fontSize: 15,
                    fontWeight: active ? "700" : "500",
                  }}
                >
                  {f.label}
                </Text>
                {active && (
                  <View
                    style={{
                      height: 3,
                      borderRadius: 2,
                      backgroundColor: BRAND,
                      marginTop: 6,
                    }}
                  />
                )}
              </PressableScale>
            );
          })}
        </View>
        <View
          style={{
            height: 1,
            backgroundColor: dividerColor,
            marginHorizontal: -16,
          }}
        />
      </View>

      <FlatList
        data={filteredConversations}
        renderItem={renderItem}
        keyExtractor={(item) => String(item.id)}
        showsVerticalScrollIndicator={false}
        refreshing={isLoading}
        onRefresh={refetch}
        contentContainerStyle={{ paddingBottom: 120 }}
        ListEmptyComponent={
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              paddingTop: 60,
              paddingHorizontal: 32,
            }}
          >
            <Text
              style={{
                color: colors.text,
                fontSize: 16,
                fontWeight: "600",
                textAlign: "center",
              }}
            >
              {isError ? "Unable to load conversations" : "No conversations yet"}
            </Text>
            <Text
              style={{
                color: mutedText,
                fontSize: 14,
                marginTop: 6,
                textAlign: "center",
              }}
            >
              {isError
                ? "Pull to retry when your connection is back."
                : "Your classroom, pod, and instructor chats will appear here."}
            </Text>
          </View>
        }
      />
    </View>
  );
}

function formatConversationTime(value?: string | null) {
  if (!value) return "";

  const date = new Date(value);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  if (isToday) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
  }

  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}
