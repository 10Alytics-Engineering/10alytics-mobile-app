import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Pressable, Text, View } from "react-native";

import useThemeColors from "@/contexts/ThemeColors";
import {
  flattenClassworkPosts,
  formatClassroomDate,
  formatClassroomTime,
  getCalendarEventTime,
  getClassroomPostTime,
  useClassroomClasswork,
  useClassroomLatest,
} from "@/hooks/use-classroom";
import type { ClassroomPost, ClassroomSession } from "@/lib/api-client";

const ACCENT = "#DA6728";
const BLUE = "#2F6FED";

type ActivityKind = "assignment" | "resource" | "announcement" | "live";

type Activity = {
  id: string;
  kind: ActivityKind;
  actor: string;
  action: string;
  title: string;
  ago: string;
  date: string;
};

function ActivityIcon({ kind }: { kind: ActivityKind }) {
  const name =
    kind === "assignment"
      ? "document-text-outline"
      : kind === "announcement"
        ? "megaphone-outline"
        : kind === "live"
          ? "videocam-outline"
          : "document-attach-outline";
  return (
    <View
      style={{ height: 44, width: 44, alignItems: "center", justifyContent: "center", borderRadius: 9999, backgroundColor: "rgba(143, 96, 226, 0.14)" }}
    >
      <Ionicons name={name} size={20} color="#7C57D4" />
    </View>
  );
}

export function ClassroomAnnouncementsPanel({
  session,
}: {
  session?: ClassroomSession | null;
}) {
  const colors = useThemeColors();
  const { data: latest, refetch } = useClassroomLatest(
    session?.courseEnrollmentId,
  );
  const {
    data: classwork,
    isLoading: isClassworkLoading,
    isError: isClassworkError,
    refetch: refetchClasswork,
  } = useClassroomClasswork(session?.courseEnrollmentId);
  const nextEvent = [
    ...(latest?.upcoming_sessions ?? []),
    ...(latest?.upcoming_deadlines ?? []),
  ].sort((a, b) => {
    const aTime = getCalendarEventTime(a);
    const bTime = getCalendarEventTime(b);
    return new Date(aTime ?? 0).getTime() - new Date(bTime ?? 0).getTime();
  })[0];
  const activities = buildActivities(flattenClassworkPosts(classwork));

  const cardStyle = {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.secondary,
    padding: 16,
  } as const;

  return (
    <View style={{ gap: 16 }}>
      <LinearGradient
        colors={["#E07B3A", "#7A4A2A"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          borderRadius: 16,
          paddingHorizontal: 18,
          paddingVertical: 18,
          overflow: "hidden",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" }}>
          <View style={{ flex: 1, paddingRight: 16 }}>
            <Text style={{ fontWeight: "700", fontSize: 16, color: "#fff" }}>
              {session?.title ?? "Classroom"}
            </Text>
            <Text style={{ marginTop: 4, fontSize: 14, color: "#fff", opacity: 0.9 }}>
              {session?.shift || "Latest classroom activity"}
            </Text>
          </View>
          <Ionicons name="sparkles-outline" size={22} color="rgba(255,255,255,0.8)" />
        </View>
      </LinearGradient>

      <View style={cardStyle}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Ionicons name="calendar-outline" size={18} color={ACCENT} />
          <Text style={{ fontWeight: "700", fontSize: 16, color: colors.text }}>
            Upcoming Sessions & Deadlines
          </Text>
        </View>

        {nextEvent ? (
          <View
            style={{ marginTop: 12, flexDirection: "row", alignItems: "center", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: "rgba(47, 111, 237, 0.08)" }}
          >
            <View style={{ width: 48, alignItems: "center" }}>
              <Text style={{ fontWeight: "700", fontSize: 12, color: BLUE, letterSpacing: 1 }}>
                {formatEventMonth(getCalendarEventTime(nextEvent))}
              </Text>
              <Text style={{ fontWeight: "700", color: BLUE, fontSize: 18 }}>
                {formatEventDay(getCalendarEventTime(nextEvent))}
              </Text>
            </View>
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={{ fontWeight: "700", fontSize: 16, color: colors.text }}>
                {nextEvent.title ?? "Upcoming event"}
              </Text>
              <Text style={{ marginTop: 2, fontSize: 14, color: colors.text, opacity: 0.7, textDecorationLine: "underline" }}>
                {formatClassroomTime(getCalendarEventTime(nextEvent))}
              </Text>
            </View>
          </View>
        ) : (
          <View
            style={{ marginTop: 12, flexDirection: "row", alignItems: "center", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 16, backgroundColor: "rgba(47, 111, 237, 0.08)" }}
          >
            <View
              style={{ height: 44, width: 44, alignItems: "center", justifyContent: "center", borderRadius: 9999, backgroundColor: "rgba(47, 111, 237, 0.12)" }}
            >
              <Ionicons name="calendar-clear-outline" size={20} color={BLUE} />
            </View>
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={{ fontWeight: "700", fontSize: 16, color: colors.text }}>
                No live class scheduled
              </Text>
              <Text style={{ marginTop: 2, fontSize: 14, color: colors.text, opacity: 0.7 }}>
                New sessions and deadlines will appear here when instructors publish them.
              </Text>
            </View>
          </View>
        )}
      </View>

      {isClassworkLoading || isClassworkError ? (
        <Pressable
          onPress={() => {
            refetch();
            refetchClasswork();
          }}
          style={cardStyle}
        >
          <Text style={{ textAlign: "center", fontWeight: "600", color: colors.text }}>
            {isClassworkLoading ? "Loading activity..." : "Unable to load activity. Tap to retry."}
          </Text>
        </Pressable>
      ) : null}

      {!isClassworkLoading && !isClassworkError && activities.length === 0 ? (
        <View style={cardStyle}>
          <Text style={{ textAlign: "center", fontWeight: "600", color: colors.text }}>No activity yet.</Text>
        </View>
      ) : null}

      {activities.map((activity) => (
        <View key={activity.id} style={cardStyle}>
          <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
            <ActivityIcon kind={activity.kind} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, lineHeight: 24, color: colors.text }}>
                <Text style={{ color: colors.text }}>{activity.actor} </Text>
                <Text style={{ fontWeight: "700", color: colors.text }}>
                  {activity.action}:
                </Text>{" "}
                <Text style={{ fontWeight: "700", color: colors.text }}>
                  {activity.title}
                </Text>
              </Text>
              <Text style={{ marginTop: 12, fontSize: 14, fontWeight: "600", color: ACCENT }}>
                {activity.ago}
              </Text>
              <View style={{ marginTop: 12, alignSelf: "flex-start", borderRadius: 9999, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bg, paddingHorizontal: 12, paddingVertical: 6 }}>
                <Text style={{ fontSize: 12, fontWeight: "600", color: colors.text }}>
                  {activity.date}
                </Text>
              </View>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

function buildActivities(posts: ClassroomPost[]): Activity[] {
  return posts.map((post) => {
    const kind = getActivityKind(post.type);
    const date = formatClassroomDate(getClassroomPostTime(post));
    const creatorName = [post.creator?.first_name, post.creator?.other_names]
      .filter(Boolean)
      .join(" ");

    return {
      id: `${post.type}-${post.id}`,
      kind,
      actor: creatorName || "Instructor",
      action: getActivityAction(post.type),
      title: post.title ?? post.body ?? "Classroom update",
      ago: date,
      date,
    };
  });
}

function getActivityKind(type: string): ActivityKind {
  if (type === "announcement") return "announcement";
  if (type === "material") return "resource";
  if (type === "live_session") return "live";
  return "assignment";
}

function getActivityAction(type: string) {
  switch (type) {
    case "announcement":
      return "posted an announcement";
    case "material":
      return "posted a new resource";
    case "live_session":
      return "scheduled a live class";
    case "capstone_project":
      return "posted a new capstone";
    default:
      return "posted a new assignment";
  }
}

function formatEventMonth(value?: string | null) {
  if (!value) return "--";
  return new Date(value).toLocaleDateString("en-US", { month: "short" }).toUpperCase();
}

function formatEventDay(value?: string | null) {
  if (!value) return "--";
  return String(new Date(value).getDate());
}
