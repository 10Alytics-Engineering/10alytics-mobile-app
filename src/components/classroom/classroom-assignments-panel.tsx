import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

const ACCENT = "#DA6728";
const ACCENT_SOFT = "rgba(218, 103, 40, 0.12)";
const RED = "#D7263D";
const RED_SOFT = "rgba(215, 38, 61, 0.10)";
const GREEN = "#1BA372";
const GREEN_SOFT = "rgba(27, 163, 114, 0.12)";

type AssignmentStatus = "not_done" | "graded" | "submitted";

type Assignment = {
  id: string;
  title: string;
  description: string;
  kind: "assignment" | "capstone";
  status: AssignmentStatus;
  postedLabel: string;
  dueLabel?: string;
  submittedLabel?: string;
  points: number;
  score?: number;
  resourceCount: number;
};

const ASSIGNMENTS: Assignment[] = [
  {
    id: "w2-not-done",
    title: "Week 2: Exploratory Data Analysis with Pandas",
    description:
      "Analyze the provided dataset using Pandas and create visualizations to identify key patterns and..",
    kind: "assignment",
    status: "not_done",
    postedLabel: "Posted Jan 1",
    dueLabel: "Due Date: Feb 28, 2026",
    points: 100,
    resourceCount: 1,
  },
  {
    id: "w2-graded",
    title: "Week 2: Exploratory Data Analysis with Pandas",
    description:
      "Analyze the provided dataset using Pandas and create visualizations to iden...",
    kind: "assignment",
    status: "graded",
    postedLabel: "Posted Jan 1",
    submittedLabel: "Submitted: 3 Feb, 2026",
    points: 100,
    score: 89,
    resourceCount: 0,
  },
  {
    id: "capstone",
    title: "Capstone Project: Exploratory Data Analysis with Pandas",
    description:
      "Analyze the provided dataset using Pandas and create visualizations to iden...",
    kind: "capstone",
    status: "not_done",
    postedLabel: "Posted Jan 1",
    dueLabel: "Due Date: Aug 28, 2026",
    points: 100,
    resourceCount: 4,
  },
];

type Filter = "all" | "not_done" | "submitted";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All Assignments" },
  { id: "not_done", label: "Not Done" },
  { id: "submitted", label: "Submitted" },
];

function AssignmentIcon({
  kind,
  status,
}: {
  kind: Assignment["kind"];
  status: AssignmentStatus;
}) {
  if (kind === "capstone") {
    return (
      <View
        className="h-10 w-10 items-center justify-center rounded-full"
        style={{ backgroundColor: ACCENT_SOFT }}
      >
        <Ionicons name="trophy-outline" size={20} color={ACCENT} />
      </View>
    );
  }
  const tint = status === "graded" ? GREEN : ACCENT;
  const bg = status === "graded" ? GREEN_SOFT : ACCENT_SOFT;
  return (
    <View
      className="h-10 w-10 items-center justify-center rounded-full"
      style={{ backgroundColor: bg }}
    >
      <Ionicons name="document-text-outline" size={20} color={tint} />
    </View>
  );
}

function StatusPill({ status }: { status: AssignmentStatus }) {
  if (status === "graded") {
    return (
      <View
        className="rounded-md px-3 py-1.5"
        style={{ backgroundColor: GREEN_SOFT }}
      >
        <Text className="text-xs font-outfit-bold" style={{ color: GREEN, letterSpacing: 0.5 }}>
          GRADED
        </Text>
      </View>
    );
  }
  return (
    <View
      className="rounded-md px-3 py-1.5"
      style={{ backgroundColor: RED_SOFT }}
    >
      <Text className="text-xs font-outfit-bold" style={{ color: RED, letterSpacing: 0.5 }}>
        NOT DONE
      </Text>
    </View>
  );
}

function AssignmentCard({ assignment }: { assignment: Assignment }) {
  return (
    <View className="rounded-2xl border border-border bg-secondary/40 p-4">
      <View className="flex-row items-start gap-3">
        <AssignmentIcon kind={assignment.kind} status={assignment.status} />
        <View className="flex-1">
          <Text className="font-outfit-bold text-base leading-6 text-text">
            {assignment.title}
          </Text>
        </View>
      </View>

      <Text className="mt-3 text-sm leading-5 text-text opacity-70">
        {assignment.description}
      </Text>

      <View className="mt-3 flex-row items-center gap-2">
        {assignment.dueLabel ? (
          <View
            className="rounded-md px-2.5 py-1.5"
            style={{ backgroundColor: RED_SOFT }}
          >
            <Text className="text-xs font-semibold" style={{ color: RED }}>
              {assignment.dueLabel}
            </Text>
          </View>
        ) : null}
        {assignment.submittedLabel ? (
          <View
            className="rounded-md px-2.5 py-1.5"
            style={{ backgroundColor: ACCENT_SOFT }}
          >
            <Text className="text-xs font-semibold" style={{ color: ACCENT }}>
              {assignment.submittedLabel}
            </Text>
          </View>
        ) : null}
        <Text className="text-xs text-text opacity-50">
          {assignment.postedLabel}
        </Text>
      </View>

      <View className="mt-4 flex-row flex-wrap items-center gap-2">
        {assignment.resourceCount > 0 ? (
          <View className="flex-row items-center gap-1.5">
            <Ionicons name="layers-outline" size={14} color="#9A9A9A" />
            <Text className="text-xs text-text opacity-60">
              {assignment.resourceCount} Resource
            </Text>
          </View>
        ) : null}

        {assignment.status === "graded" && assignment.score != null ? (
          <View
            className="flex-row items-center gap-1 rounded-md px-2.5 py-1.5"
            style={{ backgroundColor: GREEN_SOFT }}
          >
            <Ionicons name="checkmark-circle-outline" size={14} color={GREEN} />
            <Text className="text-xs font-semibold" style={{ color: GREEN }}>
              {assignment.score}/{assignment.points}
            </Text>
          </View>
        ) : (
          <View className="rounded-md border border-border bg-background px-2.5 py-1.5">
            <Text className="text-xs font-semibold text-text">
              {assignment.points} Points
            </Text>
          </View>
        )}

        <StatusPill status={assignment.status} />
      </View>
    </View>
  );
}

export function ClassroomAssignmentsPanel() {
  const [filter, setFilter] = useState<Filter>("all");

  const visible = useMemo(() => {
    if (filter === "all") return ASSIGNMENTS;
    if (filter === "submitted") {
      return ASSIGNMENTS.filter(
        (a) => a.status === "graded" || a.status === "submitted",
      );
    }
    return ASSIGNMENTS.filter((a) => a.status === "not_done");
  }, [filter]);

  return (
    <View className="gap-4">
      <View className="flex-row items-center justify-between">
        <Text className="font-outfit-bold text-xl text-text">Your Classwork</Text>
        <Pressable
          className="rounded-lg border px-4 py-2"
          style={{ borderColor: ACCENT }}
        >
          <Text className="text-sm font-semibold" style={{ color: ACCENT }}>
            View Grades
          </Text>
        </Pressable>
      </View>

      <View className="flex-row items-center gap-4">
        {FILTERS.map((f) => {
          const active = filter === f.id;
          return (
            <Pressable
              key={f.id}
              onPress={() => setFilter(f.id)}
              className="rounded-md px-3 py-2"
              style={{ backgroundColor: active ? ACCENT_SOFT : "transparent" }}
            >
              <Text
                className="text-sm font-semibold"
                style={{
                  color: active ? ACCENT : undefined,
                  opacity: active ? 1 : 0.55,
                }}
              >
                {f.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {visible.map((assignment) => (
        <AssignmentCard key={assignment.id} assignment={assignment} />
      ))}
    </View>
  );
}
