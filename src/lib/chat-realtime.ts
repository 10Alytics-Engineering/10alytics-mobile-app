import Echo from "laravel-echo";
import PusherModule, { type Options as PusherOptions } from "pusher-js/react-native";

import { apiClient, type ChatMessage } from "@/lib/api-client";

type EchoInstance = Echo<"reverb">;
type PusherInstance = InstanceType<typeof PusherModule>;
type PusherConstructor = new (
  key: string,
  options: PusherOptions,
) => PusherInstance;
type PrivateConversationChannel = ReturnType<EchoInstance["private"]>;
type PresenceConversationChannel = ReturnType<EchoInstance["join"]>;
type RetainedChannel<T> = {
  channel: T;
  release: () => void;
};

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
const channelRefs = new Map<string, number>();

const ResolvedPusher = (
  (
    PusherModule as unknown as {
      Pusher?: PusherConstructor;
      default?: PusherConstructor;
    }
  ).Pusher ??
  (
    PusherModule as unknown as {
      default?: PusherConstructor;
    }
  ).default ??
  PusherModule
) as PusherConstructor;

export async function getChatEcho() {
  const token = await apiClient.getAuthToken();
  const key = process.env.EXPO_PUBLIC_REVERB_APP_KEY;
  const host = process.env.EXPO_PUBLIC_REVERB_HOST;

  if (!token || !key || !host) return null;
  if (echo) return echo;

  try {
    echo = new Echo({
      broadcaster: "reverb",
      client: new ResolvedPusher(key, {
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
            ...apiClient.getTimezoneHeaders(),
          },
        },
      }),
    });
  } catch (error) {
    // Realtime chat is non-critical — fail quietly instead of crashing
    // the screen with an unhandled rejection.
    console.warn("Chat realtime unavailable:", error);
    echo = null;
    return null;
  }

  return echo;
}

export function disconnectChatEcho() {
  echo?.disconnect();
  echo = null;
  channelRefs.clear();
}

function retainChannel<T>(
  instance: EchoInstance,
  echoChannelName: string,
  getChannel: () => T,
): RetainedChannel<T> {
  const channel = getChannel();
  channelRefs.set(echoChannelName, (channelRefs.get(echoChannelName) ?? 0) + 1);

  let released = false;

  return {
    channel,
    release: () => {
      if (released) return;
      released = true;

      const nextCount = (channelRefs.get(echoChannelName) ?? 1) - 1;
      if (nextCount <= 0) {
        channelRefs.delete(echoChannelName);
        instance.leaveChannel(echoChannelName);
        return;
      }

      channelRefs.set(echoChannelName, nextCount);
    },
  };
}

function retainPrivateConversationChannel(
  instance: EchoInstance,
  channelName: string,
) {
  return retainChannel<PrivateConversationChannel>(
    instance,
    `private-${channelName}`,
    () => instance.private(channelName),
  );
}

function retainPresenceConversationChannel(
  instance: EchoInstance,
  channelName: string,
) {
  return retainChannel<PresenceConversationChannel>(
    instance,
    `presence-${channelName}`,
    () => instance.join(channelName),
  );
}

export async function subscribeToChatConversation(
  conversationId: number | string,
  handlers: ChatEventHandlers,
  options: { presence?: boolean } = {},
) {
  const instance = await getChatEcho();
  if (!instance) return () => {};

  const channelName = `conversation.${conversationId}`;
  const privateRef = retainPrivateConversationChannel(instance, channelName);
  const privateChannel = privateRef.channel;
  const presenceRef =
    options.presence || handlers.onTyping
      ? retainPresenceConversationChannel(instance, channelName)
      : null;
  const onMessageSent = (event: ChatMessage) => {
    handlers.onMessageSent?.(event);
  };
  const onMessageEdited = handlers.onMessageEdited ?? (() => {});
  const onMessageDeleted = handlers.onMessageDeleted ?? (() => {});
  const onConversationRead = handlers.onConversationRead ?? (() => {});
  const onTyping = handlers.onTyping;

  privateChannel
    .listen(".message.sent", onMessageSent)
    .listen(".message.edited", onMessageEdited)
    .listen(".message.deleted", onMessageDeleted)
    .listen(".conversation.read", onConversationRead);

  if (presenceRef && onTyping) {
    presenceRef.channel.listenForWhisper("typing", onTyping);
  }

  return () => {
    privateChannel
      .stopListening(".message.sent", onMessageSent)
      .stopListening(".message.edited", onMessageEdited)
      .stopListening(".message.deleted", onMessageDeleted)
      .stopListening(".conversation.read", onConversationRead);

    if (presenceRef && onTyping) {
      presenceRef.channel.stopListeningForWhisper("typing", onTyping);
    }

    privateRef.release();
    presenceRef?.release();
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
