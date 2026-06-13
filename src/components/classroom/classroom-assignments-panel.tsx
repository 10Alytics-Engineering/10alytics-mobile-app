import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

import useThemeColors from "@/contexts/ThemeColors";
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
        style={{ height: 40, width: 40, alignItems: "center", justifyContent: "center", borderRadius: 9999, backgroundColor: ACCENT_SOFT }}
      >
        <Ionicons name="trophy-outline" size={20} color={ACCENT} />
      </View>
    );
  }
  const tint = status === "graded" ? GREEN : ACCENT;
  const bg = status === "graded" ? GREEN_SOFT : ACCENT_SOFT;
  return (
    <View
      style={{ height: 40, width: 40, alignItems: "center", justifyContent: "center", borderRadius: 9999, backgroundColor: bg }}
    >
      <Ionicons name="document-text-outline" size={20} color={tint} />
    </View>
  );
}

function StatusPill({ status }: { status: AssignmentStatus }) {
  if (status === "graded") {
    return (
      <View style={{ borderRadius: 6, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: GREEN_SOFT }}>
        <Text style={{ fontSize: 12, fontWeight: "700", color: GREEN, letterSpacing: 0.5 }}>
          GRADED
        </Text>
      </View>
    );
  }
  return (
    <View style={{ borderRadius: 6, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: RED_SOFT }}>
      <Text style={{ fontSize: 12, fontWeight: "700", color: RED, letterSpacing: 0.5 }}>
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
  const colors = useThemeColors();
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
      style={{ borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.secondary, padding: 16 }}
    >
      <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
        <AssignmentIcon kind={assignment.kind} status={assignment.status} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: "700", fontSize: 16, lineHeight: 24, color: colors.text }}>
            {assignment.title}
          </Text>
        </View>
      </View>

      <Text style={{ marginTop: 12, fontSize: 14, lineHeight: 20, color: colors.text, opacity: 0.7 }}>
        {assignment.description}
      </Text>

      <View style={{ marginTop: 12, flexDirection: "row", alignItems: "center", gap: 8 }}>
        {assignment.dueLabel ? (
          <View style={{ borderRadius: 6, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: RED_SOFT }}>
            <Text style={{ fontSize: 12, fontWeight: "600", color: RED }}>
              {assignment.dueLabel}
            </Text>
          </View>
        ) : null}
        {assignment.submittedLabel ? (
          <View style={{ borderRadius: 6, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: ACCENT_SOFT }}>
            <Text style={{ fontSize: 12, fontWeight: "600", color: ACCENT }}>
              {assignment.submittedLabel}
            </Text>
          </View>
        ) : null}
        <Text style={{ fontSize: 12, color: colors.text, opacity: 0.5 }}>
          {assignment.postedLabel}
        </Text>
      </View>

      <View style={{ marginTop: 16, flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
        {assignment.resourceCount > 0 ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Ionicons name="layers-outline" size={14} color="#9A9A9A" />
            <Text style={{ fontSize: 12, color: colors.text, opacity: 0.6 }}>
              {assignment.resourceCount} Resource
            </Text>
          </View>
        ) : null}

        {assignment.status === "graded" && assignment.score != null ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: GREEN_SOFT }}>
            <Ionicons name="checkmark-circle-outline" size={14} color={GREEN} />
            <Text style={{ fontSize: 12, fontWeight: "600", color: GREEN }}>
              {assignment.score}/{assignment.points}
            </Text>
          </View>
        ) : (
          <View style={{ borderRadius: 6, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bg, paddingHorizontal: 10, paddingVertical: 6 }}>
            <Text style={{ fontSize: 12, fontWeight: "600", color: colors.text }}>
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
  const colors = useThemeColors();
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
    <View style={{ gap: 16 }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Text style={{ fontWeight: "700", fontSize: 20, color: colors.text }}>
          {kind === "capstone" ? "Capstone" : "Your Classwork"}
        </Text>
        <Pressable style={{ borderRadius: 8, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 8, borderColor: ACCENT }}>
          <Text style={{ fontSize: 14, fontWeight: "600", color: ACCENT }}>
            View Grades
          </Text>
        </Pressable>
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
        {FILTERS.map((f) => {
          const active = filter === f.id;
          return (
            <Pressable
              key={f.id}
              onPress={() => setFilter(f.id)}
              style={{ borderRadius: 6, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: active ? ACCENT_SOFT : "transparent" }}
            >
              <Text
                style={{ fontSize: 14, fontWeight: "600", color: active ? ACCENT : colors.text, opacity: active ? 1 : 0.55 }}
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
          style={{ borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.secondary, padding: 20 }}
        >
          <Text style={{ textAlign: "center", fontWeight: "600", color: colors.text }}>
            {isLoading ? "Loading..." : "Unable to load classwork. Tap to retry."}
          </Text>
        </Pressable>
      ) : null}

      {!isLoading && !isError && visible.length === 0 ? (
        <View style={{ borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.secondary, padding: 20 }}>
          <Text style={{ textAlign: "center", fontWeight: "600", color: colors.text }}>
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
