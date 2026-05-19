import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import React, { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import { useClassroomResources } from "@/hooks/use-classroom";
import type { ClassroomAttachment, ClassroomResourcePost } from "@/lib/api-client";
import { openClassroomResourceDetail } from "@/lib/classroom-navigation";
import { resolveMediaUrl } from "@/utils/resolve-media-url";

const ACCENT = "#DA6728";
const ACCENT_SOFT = "rgba(218, 103, 40, 0.12)";

type ResourceKind = "pdf" | "ppt" | "link";

type Resource = {
  id: string;
  kind: ResourceKind;
  title: string;
  meta: string;
};

type Section = {
  id: string;
  index: number;
  title: string;
  resources: Resource[];
  attachments: ClassroomAttachment[];
};

function ResourceIcon({ kind }: { kind: ResourceKind }) {
  if (kind === "pdf") {
    return (
      <View
        className="h-12 w-12 items-center justify-center rounded-xl"
        style={{ backgroundColor: "#E84B4B" }}
      >
        <Text className="font-outfit-bold text-xs text-white">PDF</Text>
      </View>
    );
  }
  if (kind === "ppt") {
    return (
      <View
        className="h-12 w-12 items-center justify-center rounded-xl"
        style={{ backgroundColor: "#2F6FED" }}
      >
        <Text className="font-outfit-bold text-xs text-white">PPT</Text>
      </View>
    );
  }
  return (
    <View
      className="h-12 w-12 items-center justify-center rounded-xl"
      style={{ backgroundColor: "#8F60E2" }}
    >
      <Ionicons name="open-outline" size={20} color="#fff" />
    </View>
  );
}

function ResourceRow({
  resource,
  attachment,
}: {
  resource: Resource;
  attachment?: ClassroomAttachment;
}) {
  const url = attachment?.url ? resolveMediaUrl(attachment.url) : null;

  return (
    <Pressable
      disabled={!url}
      onPress={() => {
        if (url) void WebBrowser.openBrowserAsync(url);
      }}
      className="mt-2 flex-row items-center rounded-xl bg-background px-3 py-3"
    >
      <ResourceIcon kind={resource.kind} />
      <View className="ml-3 flex-1">
        <Text className="font-outfit-bold text-sm text-text" numberOfLines={1}>
          {resource.title}
        </Text>
        <Text className="mt-0.5 text-xs text-text opacity-60">
          {resource.meta}
        </Text>
      </View>
      {url ? (
        <View className="h-10 w-10 items-center justify-center rounded-lg border border-border bg-background">
          <Ionicons name="download-outline" size={20} color={ACCENT} />
        </View>
      ) : null}
    </Pressable>
  );
}

export function ClassroomResourcesPanel({
  courseEnrollmentId,
}: {
  courseEnrollmentId?: number | string;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<Record<string, boolean>>({
    "0": true,
  });
  const { data: posts = [], isLoading, isError, refetch } =
    useClassroomResources(courseEnrollmentId);
  const sections = posts
    .map(mapResourceSection)
    .filter((section) =>
      section.title.toLowerCase().includes(query.toLowerCase()) ||
      section.resources.some((item) =>
        item.title.toLowerCase().includes(query.toLowerCase()),
      ),
    );

  return (
    <View className="gap-4">
      <Text className="font-outfit-bold text-xl text-text">Course Resources</Text>

      <View className="flex-row items-center rounded-xl border border-border bg-secondary/40 px-3 py-2.5">
        <Ionicons name="search" size={18} color="#9A9A9A" />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search resources"
          placeholderTextColor="#9A9A9A"
          className="ml-2 flex-1 text-sm text-text"
        />
      </View>

      {isLoading || isError ? (
        <Pressable
          onPress={() => refetch()}
          className="rounded-2xl border border-border bg-secondary/40 p-5"
        >
          <Text className="text-center font-semibold text-text">
            {isLoading ? "Loading resources..." : "Unable to load resources. Tap to retry."}
          </Text>
        </Pressable>
      ) : null}

      {!isLoading && !isError && sections.length === 0 ? (
        <View className="rounded-2xl border border-border bg-secondary/40 p-5">
          <Text className="text-center font-semibold text-text">No resources yet.</Text>
        </View>
      ) : null}

      {sections.map((section) => {
        const isOpen = !!open[section.id];
        return (
          <View
            key={section.id}
            className="rounded-2xl border border-border bg-secondary/40 p-4"
          >
            <View className="flex-row items-center">
              <Pressable
                onPress={() => {
                  if (courseEnrollmentId) {
                    openClassroomResourceDetail({
                      courseEnrollmentId,
                      resourceId: section.id,
                    });
                  }
                }}
                className="flex-1 flex-row items-center"
              >
                <View
                  className="h-10 w-10 items-center justify-center rounded-lg"
                  style={{ backgroundColor: ACCENT_SOFT }}
                >
                  <Text className="font-outfit-bold text-base" style={{ color: ACCENT }}>
                    {section.index}
                  </Text>
                </View>
                <View className="ml-3 flex-1">
                  <Text className="font-outfit-bold text-base text-text">
                    {section.title}
                  </Text>
                  <Text className="text-xs text-text opacity-60">
                    {section.resources.length} Resources
                  </Text>
                </View>
              </Pressable>
              <Pressable
                onPress={() =>
                  setOpen((prev) => ({ ...prev, [section.id]: !prev[section.id] }))
                }
                className="h-10 w-10 items-center justify-center"
                hitSlop={8}
              >
                <Ionicons
                  name={isOpen ? "chevron-up" : "chevron-down"}
                  size={20}
                  color="#9A9A9A"
                />
              </Pressable>
            </View>

            {isOpen && section.resources.length > 0 ? (
              <View className="mt-2">
                {section.resources.map((r, attachmentIndex) => (
                  <ResourceRow
                    key={r.id}
                    resource={r}
                    attachment={section.attachments[attachmentIndex]}
                  />
                ))}
              </View>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

function mapResourceSection(post: ClassroomResourcePost, index: number): Section {
  const attachments = post.attachments ?? [];
  return {
    id: String(post.id),
    index: index + 1,
    title: post.title,
    attachments,
    resources: attachments.map(mapAttachmentResource),
  };
}

function mapAttachmentResource(attachment: ClassroomAttachment): Resource {
  const mime = attachment.mime_type ?? "";
  const name = attachment.name ?? "Resource";
  const kind: ResourceKind = mime.includes("pdf")
    ? "pdf"
    : mime.includes("presentation") || name.endsWith(".pptx") || name.endsWith(".ppt")
      ? "ppt"
      : "link";
  const size = attachment.size ? `${Math.round(attachment.size / 1024)} KB` : "Attachment";

  return {
    id: String(attachment.id),
    kind,
    title: name,
    meta: `${size}${attachment.type ? ` • ${attachment.type}` : ""}`,
  };
}
