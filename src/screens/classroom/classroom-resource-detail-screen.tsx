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
import useThemeColors from "@/contexts/ThemeColors";
import { formatClassroomDate, useClassroomResources } from "@/hooks/use-classroom";
import type { ClassroomAttachment, ClassroomResourcePost } from "@/lib/api-client";
import { resolveMediaUrl } from "@/utils/resolve-media-url";

const ACCENT = "#DA6728";
const ACCENT_SOFT = "rgba(218, 103, 40, 0.12)";

function AttachmentRow({ attachment }: { attachment: ClassroomAttachment }) {
  const colors = useThemeColors();
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
      style={{ marginTop: 8, flexDirection: "row", alignItems: "center", borderRadius: 12, backgroundColor: colors.bg, paddingHorizontal: 12, paddingVertical: 12 }}
    >
      <View
        style={{ height: 48, width: 48, alignItems: "center", justifyContent: "center", borderRadius: 12, backgroundColor: ACCENT_SOFT }}
      >
        <Ionicons name="document-outline" size={22} color={ACCENT} />
      </View>
      <View style={{ marginLeft: 12, flex: 1 }}>
        <Text style={{ fontWeight: "700", fontSize: 14, color: colors.text }} numberOfLines={2}>
          {name}
        </Text>
        <Text style={{ marginTop: 2, fontSize: 12, color: colors.text, opacity: 0.6 }}>
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
  const colors = useThemeColors();
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
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View
        style={{ flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderBottomColor: colors.border, paddingHorizontal: 16, paddingBottom: 12, paddingTop: insets.top + 8 }}
      >
        <Pressable
          onPress={() => router.back()}
          style={{ marginRight: 8, height: 40, width: 40, alignItems: "center", justifyContent: "center", borderRadius: 9999, backgroundColor: colors.secondary }}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={24} color={ACCENT} />
        </Pressable>
        <Text style={{ flex: 1, fontWeight: "700", fontSize: 18, color: colors.text }} numberOfLines={1}>
          Material
        </Text>
      </View>

      {isLoading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={ACCENT} />
        </View>
      ) : isError ? (
        <Pressable
          onPress={() => refetch()}
          style={{ margin: 20, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.secondary, padding: 24 }}
        >
          <Text style={{ textAlign: "center", fontWeight: "600", color: colors.text }}>
            Unable to load material. Tap to retry.
          </Text>
        </Pressable>
      ) : !post ? (
        <View style={{ margin: 20, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.secondary, padding: 24 }}>
          <Text style={{ textAlign: "center", fontWeight: "600", color: colors.text }}>
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
  const colors = useThemeColors();
  const body = post.body ?? post.description ?? "";
  const published = post.published_at ?? post.created_at;

  return (
    <ScrollView
      style={{ flex: 1, paddingHorizontal: 20, paddingTop: 16 }}
      contentContainerStyle={{ paddingBottom: bottomInset + 24 }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={{ fontWeight: "700", fontSize: 24, lineHeight: 32, color: colors.text }}>
        {post.title}
      </Text>

      {published ? (
        <Text style={{ marginTop: 8, fontSize: 14, color: colors.text, opacity: 0.6 }}>
          Posted {formatClassroomDate(published)}
        </Text>
      ) : null}

      {body ? (
        <HtmlContentView
          html={body}
          style={{ marginTop: 16 }}
          textStyle={{ marginTop: 16, fontSize: 16, lineHeight: 24, color: colors.text, opacity: 0.8 }}
        />
      ) : null}

      {(post.attachments ?? []).length > 0 ? (
        <View style={{ marginTop: 24 }}>
          <Text style={{ fontWeight: "700", fontSize: 16, color: colors.text }}>Attachments</Text>
          {(post.attachments ?? []).map((attachment) => (
            <AttachmentRow key={String(attachment.id)} attachment={attachment} />
          ))}
        </View>
      ) : (
        <View style={{ marginTop: 24, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.secondary, padding: 20 }}>
          <Text style={{ textAlign: "center", fontSize: 14, color: colors.text, opacity: 0.7 }}>
            No files attached to this material.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}
