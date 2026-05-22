import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { AppState, Platform } from "react-native";

import { apiClient } from "@/lib/api-client";

type NotificationData = {
  type?: "chat" | "classroom_post" | "classroom";
  conversation_id?: number | string;
  conversation_type?: string;
  message_id?: number | string;
  sender_id?: number | string;
  classroom_id?: number | string;
  pod_id?: number | string | null;
  post_id?: number | string;
};

type SocketChatMessageEvent = {
  id: number | string;
  conversation_id: number | string;
  type?: "image" | "file" | "text" | string;
  body?: string | null;
  sender?: {
    id?: number | string;
    first_name?: string | null;
  } | null;
};

let activeConversationId: string | null = null;
let cachedExpoPushToken: string | null = null;
let responseSubscription: Notifications.EventSubscription | null = null;
const pushTokenStorageKey = "expo_push_token";

Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    const data = notification.request.content.data as NotificationData;
    const isCurrentChat =
      data.type === "chat" &&
      data.conversation_id != null &&
      String(data.conversation_id) === activeConversationId;

    return {
      shouldShowAlert: !isCurrentChat,
      shouldShowBanner: !isCurrentChat,
      shouldShowList: !isCurrentChat,
      shouldPlaySound: !isCurrentChat,
      shouldSetBadge: true,
    };
  },
});

export function setActiveConversation(conversationId: string | number | null) {
  activeConversationId = conversationId == null ? null : String(conversationId);
}

export function isOnConversationScreen(conversationId: string | number) {
  return activeConversationId === String(conversationId);
}

export async function initializeNotifications(isLoggedIn: boolean) {
  if (Platform.OS === "web") return;

  await configureNotificationChannels();
  attachNotificationListeners();

  if (isLoggedIn) {
    await registerForPushNotifications();
  }
}

export async function unregisterPushNotifications() {
  const token =
    cachedExpoPushToken ?? (await SecureStore.getItemAsync(pushTokenStorageKey));

  if (!token) return;

  cachedExpoPushToken = null;
  await SecureStore.deleteItemAsync(pushTokenStorageKey);
  await apiClient.deleteChatDevice(token);
}

export async function registerForPushNotifications() {
  if (Platform.OS === "web") return null;

  try {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    const finalStatus =
      existingStatus === "granted"
        ? existingStatus
        : (
            await Notifications.requestPermissionsAsync({
              ios: {
                allowAlert: true,
                allowSound: true,
                allowBadge: true,
              },
            })
          ).status;

    if (finalStatus !== "granted") return null;

    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.expoConfig?.extra?.projectId ??
      Constants.easConfig?.projectId;

    if (!projectId) {
      console.warn("Missing EAS projectId; cannot register Expo push token.");
      return null;
    }

    const token = (await Notifications.getExpoPushTokenAsync({ projectId }))
      .data;
    cachedExpoPushToken = token;
    await SecureStore.setItemAsync(pushTokenStorageKey, token);

    if (Platform.OS === "ios" || Platform.OS === "android") {
      await apiClient.registerChatDevice({
        token,
        platform: Platform.OS,
        device_name: Device.deviceName,
        app_version: Constants.expoConfig?.version ?? null,
      });
    }

    return token;
  } catch (error) {
    // Push isn't available on simulators / unconfigured environments —
    // skip quietly instead of throwing an unhandled rejection.
    console.warn("Push notification registration skipped:", error);
    return null;
  }
}

export async function showLocalChatNotification(event: SocketChatMessageEvent) {
  if (isOnConversationScreen(event.conversation_id)) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: event.sender?.first_name ?? "New message",
      body: buildChatPreview(event),
      data: {
        type: "chat",
        conversation_id: event.conversation_id,
        message_id: event.id,
      },
      sound: true,
    },
    trigger: Platform.OS === "android" ? { channelId: "chat" } : null,
  });
}

export async function showLocalClassroomPostNotification(notif: {
  classroom_title?: string | null;
  post_title?: string | null;
  classroom_id: number | string;
  post_id: number | string;
}) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: notif.classroom_title ?? "Classroom update",
      body: notif.post_title ?? "New post",
      data: {
        type: "classroom_post",
        classroom_id: notif.classroom_id,
        post_id: notif.post_id,
      },
      sound: true,
    },
    trigger: Platform.OS === "android" ? { channelId: "classroom" } : null,
  });
}

async function configureNotificationChannels() {
  if (Platform.OS !== "android") return;

  await Notifications.setNotificationChannelAsync("chat", {
    name: "Chat",
    importance: Notifications.AndroidImportance.HIGH,
    enableVibrate: true,
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PRIVATE,
  });

  await Notifications.setNotificationChannelAsync("classroom", {
    name: "Classroom updates",
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

function attachNotificationListeners() {
  if (responseSubscription) return;

  Notifications.getLastNotificationResponseAsync().then((response) => {
    if (response) handleNotificationResponse(response);
  });

  responseSubscription =
    Notifications.addNotificationResponseReceivedListener(
      handleNotificationResponse,
    );

  AppState.addEventListener("change", (state) => {
    if (state === "active") {
      Notifications.setBadgeCountAsync(0);
    }
  });
}

function handleNotificationResponse(
  response: Notifications.NotificationResponse,
) {
  const data = response.notification.request.content.data as NotificationData;

  switch (data.type) {
    case "chat":
      if (data.conversation_id == null) return;
      router.push({
        pathname: "/chat-room" as never,
        params: {
          id: String(data.conversation_id),
          focus: data.message_id == null ? undefined : String(data.message_id),
        },
      });
      break;
    case "classroom_post":
      if (data.classroom_id == null) return;
      router.push({
        pathname: "/(tabs)/classroom",
        params: {
          id: String(data.classroom_id),
          post: data.post_id == null ? undefined : String(data.post_id),
        },
      });
      break;
    case "classroom":
      if (data.classroom_id == null) return;
      router.push({
        pathname: "/(tabs)/classroom",
        params: { id: String(data.classroom_id) },
      });
      break;
  }
}

function buildChatPreview(event: SocketChatMessageEvent) {
  if (event.type === "image") return "Photo";
  if (event.type === "file") return "File";
  return (event.body ?? "").slice(0, 80) || "New message";
}
