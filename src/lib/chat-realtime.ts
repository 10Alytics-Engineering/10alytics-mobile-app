import Echo from "laravel-echo";
import Pusher from "pusher-js/react-native";

import { apiClient, type ChatMessage } from "@/lib/api-client";

type EchoInstance = Echo<"reverb">;

type ChatEventHandlers = {
  onMessageSent?: (event: ChatMessage) => void;
  onMessageEdited?: (event: {
    id: string;
    conversation_id: number | string;
    body: string;
    edited_at: string;
  }) => void;
  onMessageDeleted?: (event: {
    id: string;
    conversation_id: number | string;
    deleted_at: string;
  }) => void;
  onConversationRead?: (event: {
    conversation_id: number | string;
    user_id: number | string;
    last_read_message_id: string;
    last_read_at: string;
  }) => void;
  onTyping?: (event: { user_id: number | string; name?: string }) => void;
};

let echo: EchoInstance | null = null;

export async function getChatEcho() {
  const token = await apiClient.getAuthToken();
  const key = process.env.EXPO_PUBLIC_REVERB_APP_KEY;
  const host = process.env.EXPO_PUBLIC_REVERB_HOST;

  if (!token || !key || !host) return null;
  if (echo) return echo;

  echo = new Echo({
    broadcaster: "reverb",
    client: new Pusher(key, {
      cluster: process.env.EXPO_PUBLIC_REVERB_CLUSTER ?? "mt1",
      wsHost: host,
      wsPort: Number(process.env.EXPO_PUBLIC_REVERB_WS_PORT ?? 443),
      wssPort: Number(process.env.EXPO_PUBLIC_REVERB_WSS_PORT ?? 443),
      forceTLS: process.env.EXPO_PUBLIC_REVERB_FORCE_TLS !== "false",
      enabledTransports: ["ws", "wss"],
      authEndpoint: `${apiClient.getApiBaseURL()}/broadcasting/auth`,
      auth: {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      },
    }),
  });

  return echo;
}

export function disconnectChatEcho() {
  echo?.disconnect();
  echo = null;
}

export async function subscribeToChatConversation(
  conversationId: number | string,
  handlers: ChatEventHandlers,
  options: { presence?: boolean } = {},
) {
  const instance = await getChatEcho();
  if (!instance) return () => {};

  const channelName = `conversation.${conversationId}`;
  const channel = options.presence
    ? instance.join(channelName)
    : instance.private(channelName);

  channel
    .listen(".message.sent", (event: ChatMessage) => {
      handlers.onMessageSent?.(event);
    })
    .listen(".message.edited", handlers.onMessageEdited ?? (() => {}))
    .listen(".message.deleted", handlers.onMessageDeleted ?? (() => {}))
    .listen(".conversation.read", handlers.onConversationRead ?? (() => {}));

  if ("listenForWhisper" in channel && handlers.onTyping) {
    channel.listenForWhisper("typing", handlers.onTyping);
  }

  return () => {
    instance.leave(channelName);
  };
}

export async function whisperTyping(
  conversationId: number | string,
  payload: { user_id: number | string; name?: string },
) {
  const instance = await getChatEcho();
  if (!instance) return;

  const channel = instance.join(`conversation.${conversationId}`);
  if ("whisper" in channel) {
    channel.whisper("typing", payload);
  }
}
