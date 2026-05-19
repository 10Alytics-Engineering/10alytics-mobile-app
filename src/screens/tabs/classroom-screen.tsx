import { Ionicons } from "@expo/vector-icons";
import { useIsFetching, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import { Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ClassroomAnnouncementsPanel } from "@/components/classroom/classroom-announcements-panel";
import { ClassroomAssignmentsPanel } from "@/components/classroom/classroom-assignments-panel";
import { ClassroomParticipantsPanel } from "@/components/classroom/classroom-participants-panel";
import { ClassroomRecordingsPanel } from "@/components/classroom/classroom-recordings-panel";
import { ClassroomResourcesPanel } from "@/components/classroom/classroom-resources-panel";
import { ClassroomTimetablePanel } from "@/components/classroom/classroom-timetable-panel";
import { useClassroomSession } from "@/hooks/use-classroom";
import useThemedNavigation from "@/hooks/useThemedNavigation";

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
> = {};

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
  const queryClient = useQueryClient();
  const isClassroomFetching = useIsFetching({ queryKey: ["classroom"] }) > 0;
  const { data: session, isLoading, isError, refetch } = useClassroomSession();

  const bottomPad = insets.bottom + 100;
  const placeholder = PLACEHOLDER_COPY[segment];
  const courseEnrollmentId = session?.courseEnrollmentId;
  const refreshControl = (
    <RefreshControl
      refreshing={isClassroomFetching && !isLoading}
      onRefresh={() => {
        queryClient.invalidateQueries({ queryKey: ["classroom"] });
        refetch();
      }}
      tintColor={ACCENT}
    />
  );

  const renderPanel = () => {
    switch (segment) {
      case "timetable":
        return <ClassroomTimetablePanel courseEnrollmentId={courseEnrollmentId} />;
      case "announcements":
        return <ClassroomAnnouncementsPanel session={session} />;
      case "resources":
        return <ClassroomResourcesPanel courseEnrollmentId={courseEnrollmentId} />;
      case "assignments":
        return (
          <ClassroomAssignmentsPanel
            courseEnrollmentId={courseEnrollmentId}
            kind="assignment"
          />
        );
      case "capstone":
        return (
          <ClassroomAssignmentsPanel
            courseEnrollmentId={courseEnrollmentId}
            kind="capstone"
          />
        );
      case "recordings":
        return <ClassroomRecordingsPanel courseEnrollmentId={courseEnrollmentId} />;
      case "participants":
        return (
          <ClassroomParticipantsPanel
            classroomId={session?.classroomId}
            sessionLoading={isLoading}
          />
        );
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
        <Text className="font-outfit-bold text-xl text-text">
          {session?.title ?? "Classroom"}
        </Text>
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
        className="max-h-[64px] py-3"
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
        {isLoading || isError || !session ? (
          <ScrollView
            showsVerticalScrollIndicator={false}
            refreshControl={refreshControl}
            contentContainerStyle={{
              flexGrow: 1,
              paddingBottom: bottomPad,
              justifyContent: "center",
            }}
          >
            <Pressable onPress={() => refetch()}>
              <PlaceholderSegment
                title={
                  isLoading
                    ? "Loading classroom"
                    : isError
                      ? "Unable to load classroom"
                      : "No classroom yet"
                }
                subtitle={
                  isLoading
                    ? "Fetching your current classroom..."
                    : isError
                      ? "Tap to retry when your connection is back."
                      : "Your active classroom will appear here once available."
                }
                colors={colors}
              />
            </Pressable>
          </ScrollView>
        ) : placeholder ? (
          <ScrollView
            showsVerticalScrollIndicator={false}
            refreshControl={refreshControl}
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
            refreshControl={refreshControl}
            contentContainerStyle={{ paddingBottom: bottomPad }}
          >
            {renderPanel()}
          </ScrollView>
        )}
      </View>
    </View>
  );
}
