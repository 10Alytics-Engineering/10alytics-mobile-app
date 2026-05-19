import { router, useLocalSearchParams } from "expo-router";
import { SymbolView } from "expo-symbols";
import { PressableScale } from "pressto";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import useThemeColors from "@/contexts/ThemeColors";
import {
  createClientMessageId,
  getChatMessageText,
  getConversationTitle,
  useChatConversation,
  useChatMessages,
  useChatPresenceHeartbeat,
  useChatRealtime,
  useSendChatMessage,
} from "@/hooks/use-chat";
import type { ChatConversation, ChatMessage } from "@/lib/api-client";
import { apiClient } from "@/lib/api-client";
import { whisperTyping } from "@/lib/chat-realtime";
import { setActiveConversation } from "@/lib/notifications";
import { useAuthStore } from "@/utils/auth-store";

const BRAND = "#DA6728";
const ONLINE = "#2BC177";

function getHeaderSubtitle(
  conversation: ChatConversation | undefined | null,
  selfId?: string | number | null,
): string {
  if (!conversation) return "";
  const others =
    conversation.participants
      ?.map((p) => p.user)
      .filter(
        (u): u is NonNullable<typeof u> =>
          !!u && String(u.id) !== String(selfId ?? ""),
      ) ?? [];
  if (others.length === 0) return "";
  const names = others.map((u) => u.first_name).filter(Boolean);
  if (names.length <= 4) return names.join(", ");
  return `${names.slice(0, 4).join(", ")}... +${names.length - 4}`;
}

function getHeaderAvatar(
  conversation: ChatConversation | undefined | null,
  selfId?: string | number | null,
): { url?: string; initial: string } {
  if (!conversation) return { initial: "?" };
  const others =
    conversation.participants
      ?.map((p) => p.user)
      .filter(
        (u): u is NonNullable<typeof u> =>
          !!u && String(u.id) !== String(selfId ?? ""),
      ) ?? [];
  const first = others.find((u) => u.profile_photo_url) ?? others[0];
  return {
    url: first?.profile_photo_url ?? undefined,
    initial: (first?.first_name?.[0] ?? "?").toUpperCase(),
  };
}

export function ChatDetailScreen() {
  const { id, name } = useLocalSearchParams();
  const conversationId = Array.isArray(id) ? id[0] : id;
  const colors = useThemeColors();
  const isDark = colors.isDark;
  const insets = useSafeAreaInsets();
  const [message, setMessage] = useState("");
  const lastTypingWhisperAt = useRef(0);
  const user = useAuthStore((state) => state.user);
  const { data: conversation } = useChatConversation(conversationId);
  const {
    data: messages = [],
    isLoading,
    isError,
    refetch,
  } = useChatMessages(conversationId);
  const sendMessage = useSendChatMessage(conversationId ?? "");
  const title =
    getConversationTitle(conversation) ||
    (Array.isArray(name) ? name[0] : name) ||
    "Chat Room";
  const subtitle = getHeaderSubtitle(conversation, user?.id);
  const headerAvatar = getHeaderAvatar(conversation, user?.id);
  const latestMessageId = useMemo(() => messages.at(-1)?.id, [messages]);

  useChatRealtime(conversationId ? [conversationId] : [], { presence: true });
  useChatPresenceHeartbeat(conversationId);

  useEffect(() => {
    if (conversationId != null) {
      setActiveConversation(conversationId);
    }
    return () => setActiveConversation(null);
  }, [conversationId]);

  useEffect(() => {
    if (conversationId && latestMessageId) {
      apiClient
        .markChatConversationRead(conversationId, latestMessageId)
        .catch(() => { });
    }
  }, [conversationId, latestMessageId]);

  const handleMessageChange = (value: string) => {
    setMessage(value);
    if (!conversationId || !value.trim() || !user) return;

    const now = Date.now();
    if (now - lastTypingWhisperAt.current < 2000) return;

    lastTypingWhisperAt.current = now;
    whisperTyping(conversationId, {
      user_id: user.id,
      name: user.first_name,
    });
  };

  const handleSend = () => {
    const body = message.trim();
    if (!body || !conversationId || sendMessage.isPending) return;

    setMessage("");
    sendMessage.mutate({
      type: "text",
      body,
      reply_to_id: null,
      client_message_id: createClientMessageId(),
    });
  };

  const dividerColor = isDark ? "#262626" : "#EEEEEE";
  const mutedText = isDark ? "#9CA3AF" : "#6B7280";
  const placeholderText = isDark ? "#6B7280" : "#9CA3AF";
  const bubbleBg = isDark ? "#1F1F1F" : "#FFFFFF";
  const myBubbleBg = isDark ? "#262626" : "#F1F1F2";
  const bubbleBorder = isDark ? "#2A2A2A" : "#EAEAEA";
  const surface = isDark ? "#171717" : "#FFFFFF";
  const inputBorder = isDark ? "#262626" : "#E5E7EB";

  const renderMessage = ({
    item,
    index,
  }: {
    item: ChatMessage;
    index: number;
  }) => {
    const senderId = item.sender?.id ?? item.sender_id;
    const isMe =
      String(senderId) === String(user?.id) || senderId === "me";
    const senderInitial =
      item.sender?.first_name?.slice(0, 1).toUpperCase() ?? "?";
    const senderName = item.sender?.first_name ?? "";
    const senderAvatar = item.sender?.profile_photo_url ?? undefined;

    const prev = messages[index - 1];
    const groupedWithPrev =
      prev &&
      String(prev.sender?.id) === String(item.sender?.id) &&
      !prev.deleted_at;

    const body = getChatMessageText(item);

    const statusIcon =
      item.status === "sending"
        ? "clock"
        : item.status === "failed"
          ? "exclamationmark.circle"
          : "checkmark";
    const statusTint =
      item.status === "failed" ? "#EF4444" : isMe ? mutedText : mutedText;
    const showDouble = item.status === "delivered" || !item.status;

    return (
      <Animated.View
        entering={
          isMe ? FadeInRight.delay(index * 15) : FadeInDown.delay(index * 15)
        }
        style={{
          flexDirection: "row",
          alignItems: "flex-end",
          marginBottom: groupedWithPrev ? 6 : 14,
          paddingHorizontal: 16,
          justifyContent: isMe ? "flex-end" : "flex-start",
        }}
      >
        {!isMe && (
          <View style={{ width: 36, marginRight: 8 }}>
            {!groupedWithPrev ? (
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: isDark ? "#262626" : "#F4F4F5",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                {senderAvatar ? (
                  <Image
                    source={{ uri: senderAvatar }}
                    style={{ width: "100%", height: "100%" }}
                  />
                ) : (
                  <Text
                    style={{
                      color: mutedText,
                      fontWeight: "700",
                      fontSize: 14,
                    }}
                  >
                    {senderInitial}
                  </Text>
                )}
              </View>
            ) : null}
          </View>
        )}

        <View style={{ maxWidth: "76%" }}>
          {!groupedWithPrev && (
            <Text
              style={{
                color: mutedText,
                fontSize: 13,
                marginBottom: 4,
                marginLeft: isMe ? 0 : 4,
                textAlign: isMe ? "right" : "left",
              }}
            >
              {isMe ? "You" : senderName}
            </Text>
          )}
          <View
            style={{
              backgroundColor: isMe ? myBubbleBg : bubbleBg,
              borderColor: isMe ? "transparent" : bubbleBorder,
              borderWidth: isMe ? 0 : 1,
              borderRadius: 18,
              paddingHorizontal: 14,
              paddingVertical: 10,
              flexDirection: "row",
              alignItems: "flex-end",
              flexWrap: "wrap",
            }}
          >
            <Text
              style={{
                color: colors.text,
                fontSize: 15,
                lineHeight: 21,
                flexShrink: 1,
              }}
            >
              {body}
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginLeft: 8,
                gap: 2,
                alignSelf: "flex-end",
                paddingBottom: 1,
              }}
            >
              <Text style={{ color: mutedText, fontSize: 11 }}>
                {formatMessageTime(item.created_at)}
              </Text>
              <SymbolView
                name={statusIcon as any}
                size={12}
                tintColor={statusTint}
              />
              {showDouble && (
                <SymbolView
                  name="checkmark"
                  size={12}
                  tintColor={statusTint}
                  style={{ marginLeft: -8 }}
                />
              )}
            </View>
          </View>
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View
        style={{
          paddingTop: insets.top + 8,
          paddingHorizontal: 16,
          paddingBottom: 12,
          backgroundColor: colors.bg,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
          }}
        >
          <PressableScale onPress={() => router.back()}>
            <SymbolView
              name="chevron.left"
              size={20}
              tintColor={colors.text}
            />
          </PressableScale>
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: isDark ? "#262626" : "#F4F4F5",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            {headerAvatar.url ? (
              <Image
                source={{ uri: headerAvatar.url }}
                style={{ width: "100%", height: "100%" }}
              />
            ) : (
              <Text
                style={{ color: mutedText, fontWeight: "700", fontSize: 16 }}
              >
                {headerAvatar.initial}
              </Text>
            )}
          </View>
          <View
            style={{
              position: "absolute",
              left: 16 + 20 + 12 + 40 - 12,
              top: insets.top + 8 + 40 - 12,
              width: 12,
              height: 12,
              borderRadius: 6,
              backgroundColor: ONLINE,
              borderWidth: 2,
              borderColor: colors.bg,
            }}
          />
          <View style={{ flex: 1 }}>
            <Text
              style={{ color: colors.text, fontSize: 17, fontWeight: "700" }}
              numberOfLines={1}
            >
              {title}
            </Text>
            {!!subtitle && (
              <Text
                style={{ color: mutedText, fontSize: 13, marginTop: 2 }}
                numberOfLines={1}
              >
                {subtitle}
              </Text>
            )}
          </View>
        </View>
      </View>
      <View style={{ height: 1, backgroundColor: dividerColor }} />

      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingVertical: 16 }}
        showsVerticalScrollIndicator={false}
        refreshing={isLoading}
        onRefresh={refetch}
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
                color: mutedText,
                fontSize: 15,
                fontWeight: "500",
                textAlign: "center",
              }}
            >
              {isError
                ? "Unable to load messages. Pull to retry."
                : "No messages yet"}
            </Text>
          </View>
        }
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={10}
      >
        <View
          style={{
            paddingHorizontal: 16,
            paddingTop: 10,
            paddingBottom: insets.bottom + 10,
            backgroundColor: colors.bg,
            borderTopWidth: 1,
            borderTopColor: dividerColor,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
            }}
          >
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: surface,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: inputBorder,
                paddingHorizontal: 14,
                minHeight: 50,
              }}
            >
              <PressableScale onPress={() => { }}>
                <SymbolView name="plus" size={20} tintColor={mutedText} />
              </PressableScale>
              <TextInput
                value={message}
                onChangeText={handleMessageChange}
                placeholder="Send a message"
                placeholderTextColor={placeholderText}
                multiline
                maxLength={8000}
                style={{
                  flex: 1,
                  marginLeft: 10,
                  fontSize: 15,
                  color: colors.text,
                  paddingVertical: 12,
                  maxHeight: 120,
                }}
              />
            </View>
            <PressableScale onPress={handleSend}>
              <View
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 14,
                  backgroundColor: BRAND,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <SymbolView
                  name="paperplane.fill"
                  size={20}
                  tintColor="#FFFFFF"
                />
              </View>
            </PressableScale>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

function formatMessageTime(value: string) {
  return new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
