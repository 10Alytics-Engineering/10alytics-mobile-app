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
import useThemeColors from "@/contexts/ThemeColors";
import { useClassroomSession } from "@/hooks/use-classroom";
import useThemedNavigation from "@/hooks/useThemedNavigation";


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
  const tc = useThemeColors();
  return (
    <View style={{ borderRadius: 16, borderWidth: 1, borderColor: tc.border, backgroundColor: tc.secondary, paddingHorizontal: 20, paddingVertical: 32 }}>
      <Text style={{ textAlign: "center", fontWeight: "700", fontSize: 18, color: colors.text }}>
        {title}
      </Text>
      <Text
        style={{ marginTop: 8, textAlign: "center", fontSize: 14, opacity: 0.7, color: colors.text }}
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
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ThemedStatusBar />
      <View
        style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingBottom: 12, paddingTop: insets.top + 8 }}
      >
        <View style={{ width: 26 }} />
        <Text
          style={{ flex: 1, textAlign: "center", color: colors.text, fontSize: 24, fontWeight: "800" }}
        >
          Classroom
        </Text>
        <Pressable
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
        style={{ maxHeight: 64, paddingVertical: 12 }}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 10, alignItems: "center" }}
      >
        {SEGMENTS.map((s) => {
          const active = segment === s.id;
          return (
            <Pressable
              key={s.id}
              onPress={() => setSegment(s.id)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                borderRadius: 16,
                paddingHorizontal: 16,
                paddingVertical: 10,
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
                style={{
                  marginLeft: 8,
                  fontSize: 14,
                  fontWeight: "600",
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

      <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 16 }}>
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
