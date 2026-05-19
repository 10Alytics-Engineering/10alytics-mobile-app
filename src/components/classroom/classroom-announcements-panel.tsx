import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Pressable, Text, View } from "react-native";

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
      className="h-11 w-11 items-center justify-center rounded-full"
      style={{ backgroundColor: "rgba(143, 96, 226, 0.14)" }}
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

  return (
    <View className="gap-4">
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
        <View className="flex-row items-start justify-between">
          <View className="flex-1 pr-4">
            <Text className="font-outfit-bold text-base text-white">
              {session?.title ?? "Classroom"}
            </Text>
            <Text className="mt-1 text-sm text-white opacity-90">
              {session?.shift || "Latest classroom activity"}
            </Text>
          </View>
          <Ionicons name="sparkles-outline" size={22} color="rgba(255,255,255,0.8)" />
        </View>
      </LinearGradient>

      <View className="rounded-2xl border border-border bg-secondary/40 p-4">
        <View className="flex-row items-center gap-2">
          <Ionicons name="calendar-outline" size={18} color={ACCENT} />
          <Text className="font-outfit-bold text-base text-text">
            Upcoming Sessions & Deadlines
          </Text>
        </View>

        {nextEvent ? (
          <View
            className="mt-3 flex-row items-center rounded-xl px-4 py-3"
            style={{ backgroundColor: "rgba(47, 111, 237, 0.08)" }}
          >
            <View className="w-12 items-center">
              <Text
                className="font-outfit-bold text-xs"
                style={{ color: BLUE, letterSpacing: 1 }}
              >
                {formatEventMonth(getCalendarEventTime(nextEvent))}
              </Text>
              <Text
                className="font-outfit-bold"
                style={{ color: BLUE, fontSize: 18 }}
              >
                {formatEventDay(getCalendarEventTime(nextEvent))}
              </Text>
            </View>
            <View className="ml-3 flex-1">
              <Text className="font-outfit-bold text-base text-text">
                {nextEvent.title ?? "Upcoming event"}
              </Text>
              <Text
                className="mt-0.5 text-sm text-text opacity-70"
                style={{ textDecorationLine: "underline" }}
              >
                {formatClassroomTime(getCalendarEventTime(nextEvent))}
              </Text>
            </View>
          </View>
        ) : (
          <View
            className="mt-3 flex-row items-center rounded-xl px-4 py-4"
            style={{ backgroundColor: "rgba(47, 111, 237, 0.08)" }}
          >
            <View
              className="h-11 w-11 items-center justify-center rounded-full"
              style={{ backgroundColor: "rgba(47, 111, 237, 0.12)" }}
            >
              <Ionicons name="calendar-clear-outline" size={20} color={BLUE} />
            </View>
            <View className="ml-3 flex-1">
              <Text className="font-outfit-bold text-base text-text">
                No live class scheduled
              </Text>
              <Text className="mt-0.5 text-sm text-text opacity-70">
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
          className="rounded-2xl border border-border bg-secondary/40 p-4"
        >
          <Text className="text-center font-semibold text-text">
            {isClassworkLoading ? "Loading activity..." : "Unable to load activity. Tap to retry."}
          </Text>
        </Pressable>
      ) : null}

      {!isClassworkLoading && !isClassworkError && activities.length === 0 ? (
        <View className="rounded-2xl border border-border bg-secondary/40 p-4">
          <Text className="text-center font-semibold text-text">No activity yet.</Text>
        </View>
      ) : null}

      {activities.map((activity) => (
        <View
          key={activity.id}
          className="rounded-2xl border border-border bg-secondary/40 p-4"
        >
          <View className="flex-row items-start gap-3">
            <ActivityIcon kind={activity.kind} />
            <View className="flex-1">
              <Text className="text-base leading-6 text-text">
                <Text className="text-text">{activity.actor} </Text>
                <Text className="font-outfit-bold text-text">
                  {activity.action}:
                </Text>{" "}
                <Text className="font-outfit-bold text-text">
                  {activity.title}
                </Text>
              </Text>
              <Text
                className="mt-3 text-sm font-semibold"
                style={{ color: ACCENT }}
              >
                {activity.ago}
              </Text>
              <View className="mt-3 self-start rounded-full border border-border bg-background px-3 py-1.5">
                <Text className="text-xs font-semibold text-text">
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
