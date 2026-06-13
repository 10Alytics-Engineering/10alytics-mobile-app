import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View } from "react-native";

import useThemeColors from "@/contexts/ThemeColors";
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
  const colors = useThemeColors();
  return (
    <View style={{ overflow: "hidden", borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.secondary }}>
      <View
        style={{ height: 176, alignItems: "center", justifyContent: "center", backgroundColor: recording.thumbBg }}
      >
        <View
          style={{
            height: 64,
            width: 64,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 9999,
            backgroundColor: "#fff",
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
          style={{ position: "absolute", bottom: 12, right: 12, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, backgroundColor: "rgba(0,0,0,0.7)" }}
        >
          <Text style={{ fontSize: 12, fontWeight: "600", color: "#fff" }}>
            {recording.duration}
          </Text>
        </View>
      </View>

      <View style={{ padding: 16 }}>
        <Text style={{ fontWeight: "700", fontSize: 16, color: colors.text }}>
          {recording.title}
        </Text>
        <Text style={{ marginTop: 4, fontSize: 14, color: colors.text, opacity: 0.6 }}>
          {recording.module}
        </Text>

        <View style={{ marginTop: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <Text style={{ fontSize: 14, color: colors.text, opacity: 0.6 }}>
            {recording.date}
          </Text>
          <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 8 }}>
            <View
              style={{ height: 6, flex: 1, overflow: "hidden", borderRadius: 9999, backgroundColor: "rgba(0,0,0,0.08)" }}
            >
              <View
                style={{
                  height: "100%",
                  borderRadius: 9999,
                  width: `${Math.round(recording.progress * 100)}%`,
                  backgroundColor: ACCENT,
                }}
              />
            </View>
            <Text style={{ fontSize: 12, color: colors.text, opacity: 0.6 }}>
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
  const colors = useThemeColors();
  const { data: rows = [], isLoading, isError, refetch } =
    useClassroomRecordings(courseEnrollmentId);
  const recordings = rows.map(mapRecording);

  const cardStyle = {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.secondary,
    padding: 20,
  } as const;

  return (
    <View style={{ gap: 16 }}>
      <Text style={{ fontWeight: "700", fontSize: 20, color: colors.text }}>Class Recordings</Text>

      {isLoading || isError ? (
        <Pressable onPress={() => refetch()} style={cardStyle}>
          <Text style={{ textAlign: "center", fontWeight: "600", color: colors.text }}>
            {isLoading ? "Loading recordings..." : "Unable to load recordings. Tap to retry."}
          </Text>
        </Pressable>
      ) : null}

      {!isLoading && !isError && recordings.length === 0 ? (
        <View style={cardStyle}>
          <Text style={{ textAlign: "center", fontWeight: "600", color: colors.text }}>No recordings yet.</Text>
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
