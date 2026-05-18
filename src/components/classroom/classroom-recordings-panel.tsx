import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View } from "react-native";

const ACCENT = "#DA6728";

type Recording = {
  id: string;
  title: string;
  module: string;
  date: string;
  duration: string;
  progress: number;
  thumbBg: string;
};

const RECORDINGS: Recording[] = [
  {
    id: "py-1",
    title: "Python Fundamentals Part 1",
    module: "Module 1 | Week 2",
    date: "Jan 5, 2026",
    duration: "00:12:52",
    progress: 0.35,
    thumbBg: "#E1E5F8",
  },
  {
    id: "pandas",
    title: "Data Wrangling with Pandas",
    module: "Module 2 | Week 3",
    date: "Jan 5, 2026",
    duration: "00:12:52",
    progress: 0.35,
    thumbBg: "#D6F2E2",
  },
];

function RecordingCard({ recording }: { recording: Recording }) {
  return (
    <View className="overflow-hidden rounded-2xl border border-border bg-secondary/40">
      <View
        className="h-44 items-center justify-center"
        style={{ backgroundColor: recording.thumbBg }}
      >
        <View
          className="h-16 w-16 items-center justify-center rounded-full bg-white"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <Ionicons name="play" size={26} color={ACCENT} style={{ marginLeft: 3 }} />
        </View>
        <View
          className="absolute bottom-3 right-3 rounded-md px-2 py-1"
          style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
        >
          <Text className="text-xs font-semibold text-white">
            {recording.duration}
          </Text>
        </View>
      </View>

      <View className="p-4">
        <Text className="font-outfit-bold text-base text-text">
          {recording.title}
        </Text>
        <Text className="mt-1 text-sm text-text opacity-60">
          {recording.module}
        </Text>

        <View className="mt-4 flex-row items-center justify-between gap-3">
          <Text className="text-sm text-text opacity-60">
            {recording.date}
          </Text>
          <View className="flex-1 flex-row items-center gap-2">
            <View
              className="h-1.5 flex-1 overflow-hidden rounded-full"
              style={{ backgroundColor: "rgba(0,0,0,0.08)" }}
            >
              <View
                className="h-full rounded-full"
                style={{
                  width: `${Math.round(recording.progress * 100)}%`,
                  backgroundColor: ACCENT,
                }}
              />
            </View>
            <Text className="text-xs text-text opacity-60">
              {Math.round(recording.progress * 100)}%
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

export function ClassroomRecordingsPanel() {
  return (
    <View className="gap-4">
      <Text className="font-outfit-bold text-xl text-text">Class Recordings</Text>

      {RECORDINGS.map((recording) => (
        <RecordingCard key={recording.id} recording={recording} />
      ))}
    </View>
  );
}
