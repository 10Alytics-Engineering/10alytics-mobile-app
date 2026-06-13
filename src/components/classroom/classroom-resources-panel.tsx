import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import React, { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import useThemeColors from "@/contexts/ThemeColors";
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
      <View style={{ height: 48, width: 48, alignItems: "center", justifyContent: "center", borderRadius: 12, backgroundColor: "#E84B4B" }}>
        <Text style={{ fontWeight: "700", fontSize: 12, color: "#fff" }}>PDF</Text>
      </View>
    );
  }
  if (kind === "ppt") {
    return (
      <View style={{ height: 48, width: 48, alignItems: "center", justifyContent: "center", borderRadius: 12, backgroundColor: "#2F6FED" }}>
        <Text style={{ fontWeight: "700", fontSize: 12, color: "#fff" }}>PPT</Text>
      </View>
    );
  }
  return (
    <View style={{ height: 48, width: 48, alignItems: "center", justifyContent: "center", borderRadius: 12, backgroundColor: "#8F60E2" }}>
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
  const colors = useThemeColors();
  const url = attachment?.url ? resolveMediaUrl(attachment.url) : null;

  return (
    <Pressable
      disabled={!url}
      onPress={() => {
        if (url) void WebBrowser.openBrowserAsync(url);
      }}
      style={{ marginTop: 8, flexDirection: "row", alignItems: "center", borderRadius: 12, backgroundColor: colors.bg, paddingHorizontal: 12, paddingVertical: 12 }}
    >
      <ResourceIcon kind={resource.kind} />
      <View style={{ marginLeft: 12, flex: 1 }}>
        <Text style={{ fontWeight: "700", fontSize: 14, color: colors.text }} numberOfLines={1}>
          {resource.title}
        </Text>
        <Text style={{ marginTop: 2, fontSize: 12, color: colors.text, opacity: 0.6 }}>
          {resource.meta}
        </Text>
      </View>
      {url ? (
        <View style={{ height: 40, width: 40, alignItems: "center", justifyContent: "center", borderRadius: 8, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bg }}>
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
  const colors = useThemeColors();
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

  const cardStyle = {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.secondary,
    padding: 20,
  } as const;

  return (
    <View style={{ gap: 16 }}>
      <Text style={{ fontWeight: "700", fontSize: 20, color: colors.text }}>Course Resources</Text>

      <View style={{ flexDirection: "row", alignItems: "center", borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.secondary, paddingHorizontal: 12, paddingVertical: 10 }}>
        <Ionicons name="search" size={18} color="#9A9A9A" />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search resources"
          placeholderTextColor="#9A9A9A"
          style={{ marginLeft: 8, flex: 1, fontSize: 14, color: colors.text }}
        />
      </View>

      {isLoading || isError ? (
        <Pressable onPress={() => refetch()} style={cardStyle}>
          <Text style={{ textAlign: "center", fontWeight: "600", color: colors.text }}>
            {isLoading ? "Loading resources..." : "Unable to load resources. Tap to retry."}
          </Text>
        </Pressable>
      ) : null}

      {!isLoading && !isError && sections.length === 0 ? (
        <View style={cardStyle}>
          <Text style={{ textAlign: "center", fontWeight: "600", color: colors.text }}>No resources yet.</Text>
        </View>
      ) : null}

      {sections.map((section) => {
        const isOpen = !!open[section.id];
        return (
          <View
            key={section.id}
            style={{ borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.secondary, padding: 16 }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Pressable
                onPress={() => {
                  if (courseEnrollmentId) {
                    openClassroomResourceDetail({
                      courseEnrollmentId,
                      resourceId: section.id,
                    });
                  }
                }}
                style={{ flex: 1, flexDirection: "row", alignItems: "center" }}
              >
                <View
                  style={{ height: 40, width: 40, alignItems: "center", justifyContent: "center", borderRadius: 8, backgroundColor: ACCENT_SOFT }}
                >
                  <Text style={{ fontWeight: "700", fontSize: 16, color: ACCENT }}>
                    {section.index}
                  </Text>
                </View>
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={{ fontWeight: "700", fontSize: 16, color: colors.text }}>
                    {section.title}
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.text, opacity: 0.6 }}>
                    {section.resources.length} Resources
                  </Text>
                </View>
              </Pressable>
              <Pressable
                onPress={() =>
                  setOpen((prev) => ({ ...prev, [section.id]: !prev[section.id] }))
                }
                style={{ height: 40, width: 40, alignItems: "center", justifyContent: "center" }}
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
              <View style={{ marginTop: 8 }}>
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
