import { ClassroomCalendarPanel } from "@/components/classroom/classroom-calendar-panel";
import useThemedNavigation from "@/hooks/useThemedNavigation";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import "../../../global.css";

const ACCENT = "#DA6728";
const ACCENT_SOFT = "rgba(218, 103, 40, 0.12)";

type SegmentId =
  | "calendar"
  | "announcements"
  | "resources"
  | "assessments"
  | "recordings"
  | "participants";

const SEGMENTS: { id: SegmentId; label: string }[] = [
  { id: "calendar", label: "Calendar" },
  { id: "announcements", label: "Announcements" },
  { id: "resources", label: "Resources" },
  { id: "assessments", label: "Assessments" },
  { id: "recordings", label: "Recordings" },
  { id: "participants", label: "Participants" },
];

const PLACEHOLDER_COPY: Record<
  Exclude<SegmentId, "calendar">,
  { title: string; subtitle: string }
> = {
  announcements: {
    title: "Announcements",
    subtitle: "No announcements yet. Class updates will appear here when your instructor posts them.",
  },
  resources: {
    title: "Resources",
    subtitle: "No resources yet. Slides, links, and files will show up here.",
  },
  assessments: {
    title: "Assessments",
    subtitle: "No assessments yet. Quizzes and assignments will appear here.",
  },
  recordings: {
    title: "Recordings",
    subtitle: "No recordings yet. Past sessions and replays will be listed here.",
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
  colors: { secondary: string; text: string; border: string };
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
  const [segment, setSegment] = useState<SegmentId>("calendar");

  const calendarColors = useMemo(
    () => ({
      bg: colors.bg,
      text: colors.text,
      secondary: colors.secondary,
      invert: colors.invert,
      border: colors.border,
    }),
    [colors],
  );

  const bottomPad = insets.bottom + 100;

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
        className="max-h-[52px] border-b border-border/30 py-3"
        contentContainerStyle={{ paddingHorizontal: 20, gap: 8, alignItems: "center" }}
      >
        {SEGMENTS.map((s) => {
          const active = segment === s.id;
          return (
            <Pressable
              key={s.id}
              onPress={() => setSegment(s.id)}
              className={`rounded-full px-4 py-2.5 ${active ? "" : "bg-secondary/60"}`}
              style={active ? { backgroundColor: ACCENT_SOFT } : undefined}
            >
              <Text
                className="text-sm font-semibold"
                style={{
                  color: active ? ACCENT : undefined,
                  opacity: active ? 1 : 0.55,
                }}
              >
                {s.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View className="flex-1 px-5 pt-4">
        {segment === "calendar" ? (
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: bottomPad }}
          >
            <ClassroomCalendarPanel colors={calendarColors} />
          </ScrollView>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              flexGrow: 1,
              paddingBottom: bottomPad,
              justifyContent: "center",
            }}
          >
            <PlaceholderSegment
              title={PLACEHOLDER_COPY[segment].title}
              subtitle={PLACEHOLDER_COPY[segment].subtitle}
              colors={colors}
            />
          </ScrollView>
        )}
      </View>
    </View>
  );
}
