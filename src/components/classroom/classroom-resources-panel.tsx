import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

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
};

const SECTIONS: Section[] = [
  {
    id: "important",
    index: 1,
    title: "IMPORTANT MATERIALS",
    resources: [
      {
        id: "intro",
        kind: "pdf",
        title: "Introduction to Analytics.pdf",
        meta: "2.3 MB • Updated Jan 5",
      },
      {
        id: "slides-w1",
        kind: "ppt",
        title: "Lecture Slides - Week 1.pptx",
        meta: "5.1 MB • Updated Jan 5",
      },
      {
        id: "python-setup",
        kind: "link",
        title: "Python Setup Guide",
        meta: "External Link",
      },
    ],
  },
  {
    id: "mentorship",
    index: 2,
    title: "MENTORSHIP SESSION",
    resources: [],
  },
  {
    id: "drop-in",
    index: 3,
    title: "DROP IN SESSION",
    resources: [],
  },
];

const SECTION_COUNTS: Record<string, number> = {
  important: 4,
  mentorship: 5,
  "drop-in": 3,
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

function ResourceRow({ resource }: { resource: Resource }) {
  return (
    <View className="mt-2 flex-row items-center rounded-xl bg-background px-3 py-3">
      <ResourceIcon kind={resource.kind} />
      <View className="ml-3 flex-1">
        <Text className="font-outfit-bold text-sm text-text" numberOfLines={1}>
          {resource.title}
        </Text>
        <Text className="mt-0.5 text-xs text-text opacity-60">
          {resource.meta}
        </Text>
      </View>
      {resource.kind !== "link" ? (
        <Pressable className="h-10 w-10 items-center justify-center rounded-lg border border-border bg-background">
          <Ionicons name="download-outline" size={20} color={ACCENT} />
        </Pressable>
      ) : null}
    </View>
  );
}

export function ClassroomResourcesPanel() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<Record<string, boolean>>({
    important: true,
  });

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

      {SECTIONS.map((section) => {
        const isOpen = !!open[section.id];
        return (
          <View
            key={section.id}
            className="rounded-2xl border border-border bg-secondary/40 p-4"
          >
            <Pressable
              onPress={() =>
                setOpen((prev) => ({ ...prev, [section.id]: !prev[section.id] }))
              }
              className="flex-row items-center"
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
                  {SECTION_COUNTS[section.id]} Resources
                </Text>
              </View>
              <Ionicons
                name={isOpen ? "chevron-up" : "chevron-down"}
                size={20}
                color="#9A9A9A"
              />
            </Pressable>

            {isOpen && section.resources.length > 0 ? (
              <View className="mt-2">
                {section.resources.map((r) => (
                  <ResourceRow key={r.id} resource={r} />
                ))}
              </View>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}
