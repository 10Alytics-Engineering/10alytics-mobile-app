import { ClassroomAnnouncementsPanel } from "@/components/classroom/classroom-announcements-panel";
import { ClassroomAssignmentsPanel } from "@/components/classroom/classroom-assignments-panel";
import { ClassroomRecordingsPanel } from "@/components/classroom/classroom-recordings-panel";
import { ClassroomResourcesPanel } from "@/components/classroom/classroom-resources-panel";
import { ClassroomTimetablePanel } from "@/components/classroom/classroom-timetable-panel";
import useThemedNavigation from "@/hooks/useThemedNavigation";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import "../../../global.css";

const ACCENT = "#DA6728";

type SegmentId =
  | "announcements"
  | "timetable"
  | "resources"
  | "assignments"
  | "capstone"
  | "recordings"
  | "participants";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

const SEGMENTS: { id: SegmentId; label: string; icon: IoniconName }[] = [
  { id: "announcements", label: "Announcements", icon: "megaphone-outline" },
  { id: "timetable", label: "Time Table", icon: "calendar-outline" },
  { id: "resources", label: "Resources", icon: "folder-outline" },
  { id: "assignments", label: "Assignments", icon: "document-text-outline" },
  { id: "capstone", label: "Capstone", icon: "trophy-outline" },
  { id: "recordings", label: "Recordings", icon: "play-circle-outline" },
  { id: "participants", label: "Participants", icon: "people-outline" },
];

const PLACEHOLDER_COPY: Partial<
  Record<SegmentId, { title: string; subtitle: string }>
> = {
  capstone: {
    title: "Capstone",
    subtitle: "Your capstone brief and submissions will appear here.",
  },
  participants: {
    title: "Participants",
    subtitle: "No roster yet. Teachers, TAs, and classmates will appear here.",
  },
};

function PlaceholderSegment({
  title,
  subtitle,
  colors,
}: {
  title: string;
  subtitle: string;
  colors: { text: string };
}) {
  return (
    <View className="rounded-2xl border border-border bg-secondary/80 px-5 py-8">
      <Text className="text-center font-outfit-bold text-lg text-text">
        {title}
      </Text>
      <Text
        className="mt-2 text-center text-sm opacity-70"
        style={{ color: colors.text }}
      >
        {subtitle}
      </Text>
    </View>
  );
}

export default function ClassroomScreen() {
  const { ThemedStatusBar, colors } = useThemedNavigation();
  const insets = useSafeAreaInsets();
  const [segment, setSegment] = useState<SegmentId>("announcements");

  const bottomPad = insets.bottom + 100;
  const placeholder = PLACEHOLDER_COPY[segment];

  const renderPanel = () => {
    switch (segment) {
      case "timetable":
        return <ClassroomTimetablePanel />;
      case "announcements":
        return <ClassroomAnnouncementsPanel />;
      case "resources":
        return <ClassroomResourcesPanel />;
      case "assignments":
        return <ClassroomAssignmentsPanel />;
      case "recordings":
        return <ClassroomRecordingsPanel />;
      default:
        return null;
    }
  };

  return (
    <View className="flex-1 bg-background">
      <ThemedStatusBar />
      <View
        className="flex-row items-center justify-between border-b border-border/40 px-5 pb-3"
        style={{ paddingTop: insets.top + 8 }}
      >
        <Text className="font-outfit-bold text-xl text-text">Classroom</Text>
        <Pressable
          className="active:opacity-70"
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Notifications"
        >
          <Ionicons name="notifications-outline" size={26} color={ACCENT} />
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="max-h-[64px] border-b border-border/30 py-3"
        contentContainerStyle={{ paddingHorizontal: 20, gap: 10, alignItems: "center" }}
      >
        {SEGMENTS.map((s) => {
          const active = segment === s.id;
          return (
            <Pressable
              key={s.id}
              onPress={() => setSegment(s.id)}
              className="flex-row items-center rounded-2xl px-4 py-2.5"
              style={{
                backgroundColor: active ? ACCENT : colors.secondary,
                shadowColor: active ? ACCENT : "transparent",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: active ? 0.25 : 0,
                shadowRadius: active ? 8 : 0,
                elevation: active ? 3 : 0,
              }}
            >
              <Ionicons
                name={s.icon}
                size={16}
                color={active ? "#fff" : colors.text}
                style={{ opacity: active ? 1 : 0.6 }}
              />
              <Text
                className="ml-2 text-sm font-semibold"
                style={{
                  color: active ? "#fff" : colors.text,
                  opacity: active ? 1 : 0.65,
                }}
              >
                {s.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View className="flex-1 px-5 pt-4">
        {placeholder ? (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              flexGrow: 1,
              paddingBottom: bottomPad,
              justifyContent: "center",
            }}
          >
            <PlaceholderSegment
              title={placeholder.title}
              subtitle={placeholder.subtitle}
              colors={colors}
            />
          </ScrollView>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: bottomPad }}
          >
            {renderPanel()}
          </ScrollView>
        )}
      </View>
    </View>
  );
}
