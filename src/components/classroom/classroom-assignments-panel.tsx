import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

import {
  formatClassroomDate,
  getAssignmentStatus,
  useClassroomAssignments,
} from "@/hooks/use-classroom";
import type { ClassroomAssignment } from "@/lib/api-client";
import { openClassroomAssignmentDetail } from "@/lib/classroom-navigation";
import { normalizeHtmlToPlainText } from "@/utils/html-content";

const ACCENT = "#DA6728";
const ACCENT_SOFT = "rgba(218, 103, 40, 0.12)";
const RED = "#D7263D";
const RED_SOFT = "rgba(215, 38, 61, 0.10)";
const GREEN = "#1BA372";
const GREEN_SOFT = "rgba(27, 163, 114, 0.12)";

type AssignmentStatus = "not_done" | "graded" | "submitted" | "turned_in";

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
        {status === "submitted" || status === "turned_in" ? "SUBMITTED" : "NOT DONE"}
      </Text>
    </View>
  );
}

function AssignmentCard({
  assignment,
  courseEnrollmentId,
}: {
  assignment: Assignment;
  courseEnrollmentId?: number | string;
}) {
  return (
    <Pressable
      disabled={!courseEnrollmentId}
      onPress={() => {
        if (!courseEnrollmentId) return;
        openClassroomAssignmentDetail({
          courseEnrollmentId,
          assignmentId: assignment.id,
          kind: assignment.kind,
        });
      }}
      className="rounded-2xl border border-border bg-secondary/40 p-4"
    >
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
    </Pressable>
  );
}

export function ClassroomAssignmentsPanel({
  courseEnrollmentId,
  kind = "assignment",
}: {
  courseEnrollmentId?: number | string;
  kind?: "assignment" | "capstone";
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const status = filter === "all" ? null : filter;
  const { data: rows = [], isLoading, isError, refetch } = useClassroomAssignments(
    courseEnrollmentId,
    kind,
    status,
  );

  const visible = useMemo(() => {
    const assignments = rows.map((row) => mapAssignment(row, kind));
    if (filter === "all") return assignments;
    if (filter === "submitted") {
      return assignments.filter(
        (a) => a.status === "graded" || a.status === "submitted",
      );
    }
    return assignments.filter((a) => a.status === "not_done");
  }, [filter, kind, rows]);

  return (
    <View className="gap-4">
      <View className="flex-row items-center justify-between">
        <Text className="font-outfit-bold text-xl text-text">
          {kind === "capstone" ? "Capstone" : "Your Classwork"}
        </Text>
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

      {isLoading || isError ? (
        <Pressable
          onPress={() => refetch()}
          className="rounded-2xl border border-border bg-secondary/40 p-5"
        >
          <Text className="text-center font-semibold text-text">
            {isLoading ? "Loading..." : "Unable to load classwork. Tap to retry."}
          </Text>
        </Pressable>
      ) : null}

      {!isLoading && !isError && visible.length === 0 ? (
        <View className="rounded-2xl border border-border bg-secondary/40 p-5">
          <Text className="text-center font-semibold text-text">
            No {kind === "capstone" ? "capstones" : "assignments"} yet.
          </Text>
        </View>
      ) : null}

      {visible.map((assignment) => (
        <AssignmentCard
          key={assignment.id}
          assignment={assignment}
          courseEnrollmentId={courseEnrollmentId}
        />
      ))}
    </View>
  );
}

function mapAssignment(row: ClassroomAssignment, kind: "assignment" | "capstone"): Assignment {
  const status = getAssignmentStatus(row) as AssignmentStatus;
  const submittedAt = row.submission?.submitted_at ?? row.submitted_at;
  const score = row.submission?.score_earned ?? row.score_earned ?? undefined;
  return {
    id: String(row.classroom_post_id ?? row.id),
    title: row.title,
    description: normalizeHtmlToPlainText(row.description ?? row.body ?? ""),
    kind,
    status,
    postedLabel: row.published_at || row.created_at
      ? `Posted ${formatClassroomDate(row.published_at ?? row.created_at)}`
      : "",
    dueLabel: row.due_at ? `Due Date: ${formatClassroomDate(row.due_at)}` : undefined,
    submittedLabel: submittedAt ? `Submitted: ${formatClassroomDate(submittedAt)}` : undefined,
    points: row.points_possible ?? 0,
    score,
    resourceCount: row.attachments?.length ?? 0,
  };
}
