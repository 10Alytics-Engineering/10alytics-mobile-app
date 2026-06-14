import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";

import {
  apiClient,
  type ChatConversation,
  type ChatMessage,
  type SendChatMessagePayload,
} from "@/lib/api-client";
import { subscribeToChatConversation } from "@/lib/chat-realtime";
import { showLocalChatNotification } from "@/lib/notifications";

export const chatKeys = {
  conversations: ["chat", "conversations"] as const,
  conversation: (id: string | number) =>
    ["chat", "conversation", String(id)] as const,
  messages: (id: string | number) => ["chat", "messages", String(id)] as const,
  unread: ["chat", "unread"] as const,
};

export function useChatConversations() {
  return useQuery({
    queryKey: chatKeys.conversations,
    queryFn: async () => {
      const result = await apiClient.getChatConversations();
      if (result.error) throw new Error(result.error.message);

      const payload = result.data?.data;
      if (Array.isArray(payload)) return payload;
      return payload?.data ?? [];
    },
  });
}

export function useChatConversation(conversationId?: string | number | null) {
  return useQuery({
    queryKey: conversationId
      ? chatKeys.conversation(conversationId)
      : ["chat", "conversation", "missing"],
    enabled: conversationId != null,
    queryFn: async () => {
      const result = await apiClient.getChatConversation(conversationId!);
      if (result.error) throw new Error(result.error.message);
      return result.data?.data;
    },
  });
}

export function useChatMessages(conversationId?: string | number | null) {
  return useQuery({
    queryKey: conversationId
      ? chatKeys.messages(conversationId)
      : ["chat", "messages", "missing"],
    enabled: conversationId != null,
    queryFn: async () => {
      const result = await apiClient.getChatMessages(conversationId!, {
        limit: 50,
      });
      if (result.error) throw new Error(result.error.message);
      return result.data?.data.data ?? [];
    },
  });
}

export function useSendChatMessage(conversationId: string | number) {
  const queryClient = useQueryClient();
  const queryKey = chatKeys.messages(conversationId);

  return useMutation({
    mutationFn: async (payload: SendChatMessagePayload) => {
      const result = await apiClient.sendChatMessage(conversationId, payload);
      if (result.error) throw new Error(result.error.message);
      return result.data?.data;
    },
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<ChatMessage[]>(queryKey) ?? [];
      const optimistic: ChatMessage = {
        id: payload.client_message_id,
        client_message_id: payload.client_message_id,
        conversation_id: conversationId,
        sender: {
          id: "me",
          first_name: "Me",
          other_names: null,
        },
        body: payload.body ?? null,
        type: payload.type,
        attachment_url: payload.attachment_url ?? null,
        attachment_meta: payload.attachment_meta ?? null,
        reply_to_id: payload.reply_to_id ?? null,
        edited_at: null,
        created_at: new Date().toISOString(),
        status: "sending",
      };

      queryClient.setQueryData<ChatMessage[]>(queryKey, (current = []) =>
        dedupeMessages([...current, optimistic]),
      );

      return { previous, optimisticId: optimistic.id };
    },
    onError: (_error, _payload, context) => {
      queryClient.setQueryData<ChatMessage[]>(queryKey, (current = []) =>
        current.map((message) =>
          message.id === context?.optimisticId
            ? { ...message, status: "failed" }
            : message,
        ),
      );
    },
    onSuccess: (serverMessage, _payload, context) => {
      if (!serverMessage) return;
      queryClient.setQueryData<ChatMessage[]>(queryKey, (current = []) =>
        dedupeMessages(
          current
            .filter((message) => message.id !== context?.optimisticId)
            .concat({ ...serverMessage, status: "delivered" }),
        ),
      );
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations });
    },
  });
}

export function useChatRealtime(
  conversationIds: (string | number)[],
  options: { presence?: boolean } = {},
) {
  const queryClient = useQueryClient();
  const { presence = false } = options;
  const idsKey = conversationIds.map(String).filter(Boolean).join(",");
  const stableIds = useMemo(() => idsKey.split(",").filter(Boolean), [idsKey]);

  useEffect(() => {
    let cleanupFns: (() => void)[] = [];
    let cancelled = false;

    async function subscribeAll() {
      const subscriptions = await Promise.all(
        stableIds.map((conversationId) =>
          subscribeToChatConversation(
            conversationId,
            {
              onMessageSent: (event) => {
                if (event.conversation_id == null) return;
                const deliveredEvent = {
                  ...event,
                  conversation_id: event.conversation_id,
                  status: "delivered" as const,
                };

                queryClient.setQueryData<ChatMessage[]>(
                  chatKeys.messages(deliveredEvent.conversation_id),
                  (current = []) =>
                    dedupeMessages([...current, deliveredEvent]),
                );
                queryClient.invalidateQueries({
                  queryKey: chatKeys.conversations,
                });
                showLocalChatNotification(deliveredEvent);
              },
              onMessageEdited: (event) => {
                queryClient.setQueryData<ChatMessage[]>(
                  chatKeys.messages(event.conversation_id),
                  (current = []) =>
                    current.map((message) =>
                      message.id === event.id
                        ? {
                            ...message,
                            body: event.body,
                            edited_at: event.edited_at,
                          }
                        : message,
                    ),
                );
              },
              onMessageDeleted: (event) => {
                queryClient.setQueryData<ChatMessage[]>(
                  chatKeys.messages(event.conversation_id),
                  (current = []) =>
                    current.map((message) =>
                      message.id === event.id
                        ? { ...message, deleted_at: event.deleted_at }
                        : message,
                    ),
                );
              },
              onConversationRead: () => {
                queryClient.invalidateQueries({
                  queryKey: chatKeys.conversations,
                });
                queryClient.invalidateQueries({ queryKey: chatKeys.unread });
              },
            },
            { presence },
          ),
        ),
      );

      if (cancelled) {
        subscriptions.forEach((cleanup) => cleanup());
        return;
      }

      cleanupFns = subscriptions;
    }

    subscribeAll();

    return () => {
      cancelled = true;
      cleanupFns.forEach((cleanup) => cleanup());
    };
  }, [presence, queryClient, stableIds]);
}

export function useChatPresenceHeartbeat(
  conversationId?: string | number | null,
) {
  useEffect(() => {
    if (conversationId == null) return;

    apiClient.markChatPresence(conversationId);
    const interval = setInterval(() => {
      apiClient.markChatPresence(conversationId);
    }, 25_000);

    return () => clearInterval(interval);
  }, [conversationId]);
}

export function getConversationTitle(conversation?: ChatConversation | null) {
  return conversation?.title ?? conversation?.name ?? "Chat Room";
}

export function getChatMessageText(message?: ChatMessage | null) {
  if (!message) return "";
  if (message.deleted_at) return "Message deleted";
  if (message.type === "image") return "Photo";
  if (message.type === "file") return "File";
  return message.body ?? message.body_preview ?? "";
}

export function formatChatPreview(message?: ChatMessage | null) {
  if (!message) return "Tap to start chatting";
  const text = getChatMessageText(message);
  return text || "Tap to start chatting";
}

export function createClientMessageId() {
  const randomUUID = globalThis.crypto?.randomUUID?.bind(globalThis.crypto);
  if (randomUUID) return randomUUID();

  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const random = Math.floor(Math.random() * 16);
    const value = char === "x" ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

function dedupeMessages(messages: ChatMessage[]) {
  const byKey = new Map<string, ChatMessage>();

  messages.forEach((message) => {
    const key = message.client_message_id ?? message.id;
    const existing = byKey.get(key);
    if (!existing || existing.status === "sending") {
      byKey.set(key, message);
    }
  });

  return Array.from(byKey.values()).sort((a, b) => {
    const byDate =
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    if (byDate !== 0) return byDate;
    return a.id.localeCompare(b.id);
  });
}
