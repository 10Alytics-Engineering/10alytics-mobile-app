import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useMemo } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HtmlContentView } from "@/components/html-content-view";
import { formatClassroomDate, useClassroomResources } from "@/hooks/use-classroom";
import type { ClassroomAttachment, ClassroomResourcePost } from "@/lib/api-client";
import { resolveMediaUrl } from "@/utils/resolve-media-url";

const ACCENT = "#DA6728";
const ACCENT_SOFT = "rgba(218, 103, 40, 0.12)";

function AttachmentRow({ attachment }: { attachment: ClassroomAttachment }) {
  const name = attachment.name ?? "Resource";
  const url = attachment.url ? resolveMediaUrl(attachment.url) : null;
  const sizeLabel = attachment.size
    ? `${Math.round(attachment.size / 1024)} KB`
    : null;

  return (
    <Pressable
      disabled={!url}
      onPress={() => {
        if (url) void WebBrowser.openBrowserAsync(url);
      }}
      className="mt-2 flex-row items-center rounded-xl bg-background px-3 py-3"
    >
      <View
        className="h-12 w-12 items-center justify-center rounded-xl"
        style={{ backgroundColor: ACCENT_SOFT }}
      >
        <Ionicons name="document-outline" size={22} color={ACCENT} />
      </View>
      <View className="ml-3 flex-1">
        <Text className="font-outfit-bold text-sm text-text" numberOfLines={2}>
          {name}
        </Text>
        <Text className="mt-0.5 text-xs text-text opacity-60">
          {[sizeLabel, attachment.mime_type, attachment.type]
            .filter(Boolean)
            .join(" • ")}
        </Text>
      </View>
      {url ? <Ionicons name="download-outline" size={22} color={ACCENT} /> : null}
    </Pressable>
  );
}

export function ClassroomResourceDetailScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    resourceId?: string | string[];
    courseEnrollmentId?: string | string[];
  }>();

  const resourceId = Array.isArray(params.resourceId)
    ? params.resourceId[0]
    : params.resourceId;
  const courseEnrollmentId = Array.isArray(params.courseEnrollmentId)
    ? params.courseEnrollmentId[0]
    : params.courseEnrollmentId;

  const { data: posts = [], isLoading, isError, refetch } =
    useClassroomResources(courseEnrollmentId);

  const post = useMemo(
    () => posts.find((item) => String(item.id) === String(resourceId)),
    [posts, resourceId],
  );

  return (
    <View className="flex-1 bg-background">
      <View
        className="flex-row items-center border-b border-border/40 px-4 pb-3"
        style={{ paddingTop: insets.top + 8 }}
      >
        <Pressable
          onPress={() => router.back()}
          className="mr-2 h-10 w-10 items-center justify-center rounded-full bg-secondary/80"
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={24} color={ACCENT} />
        </Pressable>
        <Text className="flex-1 font-outfit-bold text-lg text-text" numberOfLines={1}>
          Material
        </Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={ACCENT} />
        </View>
      ) : isError ? (
        <Pressable
          onPress={() => refetch()}
          className="m-5 rounded-2xl border border-border bg-secondary/40 p-6"
        >
          <Text className="text-center font-semibold text-text">
            Unable to load material. Tap to retry.
          </Text>
        </Pressable>
      ) : !post ? (
        <View className="m-5 rounded-2xl border border-border bg-secondary/40 p-6">
          <Text className="text-center font-semibold text-text">
            This material could not be found.
          </Text>
        </View>
      ) : (
        <ResourceContent post={post} bottomInset={insets.bottom} />
      )}
    </View>
  );
}

function ResourceContent({
  post,
  bottomInset,
}: {
  post: ClassroomResourcePost;
  bottomInset: number;
}) {
  const body = post.body ?? post.description ?? "";
  const published = post.published_at ?? post.created_at;

  return (
    <ScrollView
      className="flex-1 px-5 pt-4"
      contentContainerStyle={{ paddingBottom: bottomInset + 24 }}
      showsVerticalScrollIndicator={false}
    >
      <Text className="font-outfit-bold text-2xl leading-8 text-text">
        {post.title}
      </Text>

      {published ? (
        <Text className="mt-2 text-sm text-text opacity-60">
          Posted {formatClassroomDate(published)}
        </Text>
      ) : null}

      {body ? (
        <HtmlContentView
          html={body}
          className="mt-4"
          textClassName="mt-4 text-base leading-6 text-text opacity-80"
        />
      ) : null}

      {(post.attachments ?? []).length > 0 ? (
        <View className="mt-6">
          <Text className="font-outfit-bold text-base text-text">Attachments</Text>
          {(post.attachments ?? []).map((attachment) => (
            <AttachmentRow key={String(attachment.id)} attachment={attachment} />
          ))}
        </View>
      ) : (
        <View className="mt-6 rounded-2xl border border-border bg-secondary/40 p-5">
          <Text className="text-center text-sm text-text opacity-70">
            No files attached to this material.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}
