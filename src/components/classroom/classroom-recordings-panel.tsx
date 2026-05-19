import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View } from "react-native";

import { formatClassroomDate, useClassroomRecordings } from "@/hooks/use-classroom";
import type { ClassroomRecording } from "@/lib/api-client";

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

export function ClassroomRecordingsPanel({
  courseEnrollmentId,
}: {
  courseEnrollmentId?: number | string;
}) {
  const { data: rows = [], isLoading, isError, refetch } =
    useClassroomRecordings(courseEnrollmentId);
  const recordings = rows.map(mapRecording);

  return (
    <View className="gap-4">
      <Text className="font-outfit-bold text-xl text-text">Class Recordings</Text>

      {isLoading || isError ? (
        <Pressable
          onPress={() => refetch()}
          className="rounded-2xl border border-border bg-secondary/40 p-5"
        >
          <Text className="text-center font-semibold text-text">
            {isLoading ? "Loading recordings..." : "Unable to load recordings. Tap to retry."}
          </Text>
        </Pressable>
      ) : null}

      {!isLoading && !isError && recordings.length === 0 ? (
        <View className="rounded-2xl border border-border bg-secondary/40 p-5">
          <Text className="text-center font-semibold text-text">No recordings yet.</Text>
        </View>
      ) : null}

      {recordings.map((recording) => (
        <RecordingCard key={recording.id} recording={recording} />
      ))}
    </View>
  );
}

function mapRecording(row: ClassroomRecording): Recording {
  return {
    id: String(row.id),
    title: row.title,
    module: row.recording_status ?? row.status ?? "Recording",
    date: formatClassroomDate(row.scheduled_at),
    duration: row.duration_minutes ? `${row.duration_minutes} min` : "--",
    progress: row.viewer_attended ? 1 : 0,
    thumbBg: "#E1E5F8",
  };
}
