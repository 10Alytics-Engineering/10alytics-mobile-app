import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Text, View } from "react-native";

const ACCENT = "#DA6728";
const BLUE = "#2F6FED";

type ActivityKind = "assignment" | "resource";

type Activity = {
  id: string;
  kind: ActivityKind;
  actor: string;
  action: string;
  title: string;
  ago: string;
  date: string;
};

const ACTIVITIES: Activity[] = [
  {
    id: "a1",
    kind: "assignment",
    actor: "Fiyinfoluwa Aderoju",
    action: "posted a new assignment",
    title: "UTILIZING AI FOR JOB APPLICATION",
    ago: "2 hours ago",
    date: "Aug 28, 2025",
  },
  {
    id: "a2",
    kind: "resource",
    actor: "Fiyinfoluwa Aderoju",
    action: "posted a new resource",
    title: "UTILIZING AI FOR JOB APPLICATION",
    ago: "2 hours ago",
    date: "Aug 28, 2025",
  },
  {
    id: "a3",
    kind: "resource",
    actor: "Fiyinfoluwa Aderoju",
    action: "posted a new resource",
    title: "UTILIZING AI FOR JOB APPLICATION",
    ago: "2 hours ago",
    date: "Aug 28, 2025",
  },
];

function ActivityIcon({ kind }: { kind: ActivityKind }) {
  const name = kind === "assignment" ? "document-text-outline" : "document-attach-outline";
  return (
    <View
      className="h-11 w-11 items-center justify-center rounded-full"
      style={{ backgroundColor: "rgba(143, 96, 226, 0.14)" }}
    >
      <Ionicons name={name} size={20} color="#7C57D4" />
    </View>
  );
}

export function ClassroomAnnouncementsPanel() {
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
              Data Analytics Morning Class
            </Text>
            <Text className="mt-1 text-sm text-white opacity-90">
              C26 - March to September
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

        <View
          className="mt-3 flex-row items-center rounded-xl px-4 py-3"
          style={{ backgroundColor: "rgba(47, 111, 237, 0.08)" }}
        >
          <View className="w-12 items-center">
            <Text
              className="font-outfit-bold text-xs"
              style={{ color: BLUE, letterSpacing: 1 }}
            >
              JAN
            </Text>
            <Text
              className="font-outfit-bold"
              style={{ color: BLUE, fontSize: 18 }}
            >
              15
            </Text>
          </View>
          <View className="ml-3 flex-1">
            <Text className="font-outfit-bold text-base text-text">
              Live Class
            </Text>
            <Text
              className="mt-0.5 text-sm text-text opacity-70"
              style={{ textDecorationLine: "underline" }}
            >
              6:00 PM WAT
            </Text>
          </View>
        </View>
      </View>

      {ACTIVITIES.map((activity) => (
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
