import { useQuery } from "@tanstack/react-query";

import {
  apiClient,
  type ClassroomAssignment,
  type ClassroomAssignmentDetail,
  type ClassroomCalendarEvent,
  type ClassroomClasswork,
  type ClassroomPaginated,
  type ClassroomPeople,
  type ClassroomPerson,
  type ClassroomPost,
  type ClassroomSession,
} from "@/lib/api-client";

export const classroomKeys = {
  session: ["classroom", "session"] as const,
  latest: (courseEnrollmentId: number | string) =>
    ["classroom", "latest", String(courseEnrollmentId)] as const,
  classwork: (courseEnrollmentId: number | string) =>
    ["classroom", "classwork", String(courseEnrollmentId)] as const,
  assignments: (
    courseEnrollmentId: number | string,
    kind: "assignment" | "capstone",
    status?: string | null,
  ) =>
    [
      "classroom",
      kind === "capstone" ? "capstones" : "assignments",
      String(courseEnrollmentId),
      status ?? "all",
    ] as const,
  resources: (courseEnrollmentId: number | string) =>
    ["classroom", "resources", String(courseEnrollmentId)] as const,
  recordings: (courseEnrollmentId: number | string) =>
    ["classroom", "recordings", String(courseEnrollmentId)] as const,
  calendar: (courseEnrollmentId: number | string) =>
    ["classroom", "calendar", String(courseEnrollmentId)] as const,
  grades: (courseEnrollmentId: number | string) =>
    ["classroom", "grades", String(courseEnrollmentId)] as const,
  people: (classroomId: number | string) =>
    ["classroom", "people", String(classroomId)] as const,
  assignmentDetail: (
    courseEnrollmentId: number | string,
    assignmentId: number | string,
    kind: "assignment" | "capstone",
  ) =>
    [
      "classroom",
      "assignment-detail",
      String(courseEnrollmentId),
      String(assignmentId),
      kind,
    ] as const,
};

export function useClassroomSession() {
  return useQuery({
    queryKey: classroomKeys.session,
    queryFn: async (): Promise<ClassroomSession | null> => {
      const enrollmentsResult = await apiClient.getClassroomEnrollments();
      if (enrollmentsResult.error) {
        throw new Error(enrollmentsResult.error.message);
      }

      const enrollments = enrollmentsResult.data?.data ?? [];
      const enrollment =
        enrollments.find((item) => item.is_banned === false || item.is_banned === 0) ??
        enrollments[0];

      if (!enrollment) return null;

      const classroomResult = await apiClient.getClassroomPublic(enrollment.id);
      if (classroomResult.error) {
        throw new Error(classroomResult.error.message);
      }

      const classroom = classroomResult.data?.data;
      if (!classroom?.id) return null;

      return {
        classroomId: classroom.id,
        courseEnrollmentId: enrollment.id,
        courseId: classroom.course_id ?? enrollment.course_id,
        cohortId: classroom.cohort_id ?? enrollment.cohort_id,
        title: classroom.title ?? classroom.name ?? "Classroom",
        shift: classroom.shift ?? "",
      };
    },
  });
}

export function useClassroomLatest(courseEnrollmentId?: number | string | null) {
  return useQuery({
    queryKey: courseEnrollmentId
      ? classroomKeys.latest(courseEnrollmentId)
      : ["classroom", "latest", "missing"],
    enabled: courseEnrollmentId != null,
    queryFn: async () => {
      const result = await apiClient.getClassroomLatest(courseEnrollmentId!);
      if (result.error) throw new Error(result.error.message);
      return result.data?.data;
    },
  });
}

export function useClassroomClasswork(courseEnrollmentId?: number | string | null) {
  return useQuery({
    queryKey: courseEnrollmentId
      ? classroomKeys.classwork(courseEnrollmentId)
      : ["classroom", "classwork", "missing"],
    enabled: courseEnrollmentId != null,
    queryFn: async () => {
      const result = await apiClient.getClassroomClasswork(courseEnrollmentId!, {
        perGroup: 25,
      });
      if (result.error) throw new Error(result.error.message);
      return result.data?.data;
    },
  });
}

export function useClassroomAssignments(
  courseEnrollmentId?: number | string | null,
  kind: "assignment" | "capstone" = "assignment",
  status?: string | null,
) {
  return useQuery({
    queryKey: courseEnrollmentId
      ? classroomKeys.assignments(courseEnrollmentId, kind, status)
      : ["classroom", kind, "missing"],
    enabled: courseEnrollmentId != null,
    queryFn: async () => {
      const result =
        kind === "capstone"
          ? await apiClient.getClassroomCapstones(courseEnrollmentId!, { status })
          : await apiClient.getClassroomAssignments(courseEnrollmentId!, { status });

      if (result.error) throw new Error(result.error.message);
      return unwrapList(result.data?.data);
    },
  });
}

export function useClassroomResources(courseEnrollmentId?: number | string | null) {
  return useQuery({
    queryKey: courseEnrollmentId
      ? classroomKeys.resources(courseEnrollmentId)
      : ["classroom", "resources", "missing"],
    enabled: courseEnrollmentId != null,
    queryFn: async () => {
      const result = await apiClient.getClassroomResources(courseEnrollmentId!);
      if (result.error) throw new Error(result.error.message);
      return unwrapList(result.data?.data);
    },
  });
}

export function useClassroomRecordings(courseEnrollmentId?: number | string | null) {
  return useQuery({
    queryKey: courseEnrollmentId
      ? classroomKeys.recordings(courseEnrollmentId)
      : ["classroom", "recordings", "missing"],
    enabled: courseEnrollmentId != null,
    queryFn: async () => {
      const result = await apiClient.getClassroomRecordings(courseEnrollmentId!);
      if (result.error) throw new Error(result.error.message);
      return unwrapList(result.data?.data);
    },
  });
}

export function useClassroomCalendar(courseEnrollmentId?: number | string | null) {
  return useQuery({
    queryKey: courseEnrollmentId
      ? classroomKeys.calendar(courseEnrollmentId)
      : ["classroom", "calendar", "missing"],
    enabled: courseEnrollmentId != null,
    queryFn: async () => {
      const now = new Date();
      const from = new Date(now);
      from.setDate(now.getDate() - 14);
      const to = new Date(now);
      to.setDate(now.getDate() + 45);

      const result = await apiClient.getClassroomCalendar(courseEnrollmentId!, {
        from: from.toISOString(),
        to: to.toISOString(),
      });
      if (result.error) throw new Error(result.error.message);
      return unwrapCalendarEvents(result.data?.data);
    },
  });
}

export function formatClassroomDate(value?: string | null) {
  if (!value) return "";
  return new Date(value).toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatClassroomTime(value?: string | null) {
  if (!value) return "";
  return new Date(value).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function getAssignmentStatus(item: ClassroomAssignment) {
  const status = item.submission?.status ?? item.status ?? "not_done";
  if (item.submission?.score_earned != null || item.score_earned != null) return "graded";
  if (["submitted", "turned_in", "graded"].includes(status)) return status;
  return "not_done";
}

export function getCalendarEventTime(event: ClassroomCalendarEvent) {
  return event.starts_at ?? event.due_at ?? null;
}

export function flattenClassworkPosts(classwork?: ClassroomClasswork | null) {
  if (!classwork?.grouped) return [];

  return Object.values(classwork.grouped)
    .flatMap((group) => (Array.isArray(group) ? group : []))
    .sort(compareClassroomPostsByDate);
}

export function getClassroomPostTime(post: ClassroomPost) {
  return post.published_at ?? post.starts_at ?? post.due_at ?? post.created_at ?? null;
}

function compareClassroomPostsByDate(a: ClassroomPost, b: ClassroomPost) {
  const aTime = new Date(getClassroomPostTime(a) ?? 0).getTime();
  const bTime = new Date(getClassroomPostTime(b) ?? 0).getTime();
  return bTime - aTime;
}

function unwrapList<T>(payload?: ClassroomPaginated<T> | T[]) {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  return payload.data ?? [];
}

function unwrapCalendarEvents(payload: unknown): ClassroomCalendarEvent[] {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload as ClassroomCalendarEvent[];

  if (typeof payload !== "object") return [];

  const objectPayload = payload as {
    data?: unknown;
    events?: unknown;
    calendar?: unknown;
    upcoming_sessions?: unknown;
    upcoming_deadlines?: unknown;
  };

  if (Array.isArray(objectPayload.data)) {
    return objectPayload.data as ClassroomCalendarEvent[];
  }

  if (Array.isArray(objectPayload.events)) {
    return objectPayload.events as ClassroomCalendarEvent[];
  }

  if (Array.isArray(objectPayload.calendar)) {
    return objectPayload.calendar as ClassroomCalendarEvent[];
  }

  return [
    ...(Array.isArray(objectPayload.upcoming_sessions)
      ? (objectPayload.upcoming_sessions as ClassroomCalendarEvent[])
      : []),
    ...(Array.isArray(objectPayload.upcoming_deadlines)
      ? (objectPayload.upcoming_deadlines as ClassroomCalendarEvent[])
      : []),
  ];
}

export function getClassroomPersonName(person: ClassroomPerson) {
  if (person.name?.trim()) return person.name.trim();
  const parts = [person.first_name, person.other_names].filter(Boolean);
  if (parts.length > 0) return parts.join(" ");
  return person.email ?? "Participant";
}

function parsePersonRow(raw: unknown): ClassroomPerson | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  const id = row.id ?? row.user_id;
  if (id === undefined || id === null) return null;
  const user = row.user;
  if (user && typeof user === "object") {
    const u = user as Record<string, unknown>;
    return {
      id: (u.id ?? id) as number | string,
      first_name: (u.first_name as string | null) ?? null,
      other_names: (u.other_names as string | null) ?? null,
      name: (u.name as string | null) ?? null,
      email: (u.email as string | null) ?? null,
      role: (row.role as string | null) ?? (u.role as string | null) ?? null,
      avatar_url:
        (u.avatar_url as string | null) ??
        (u.image_url as string | null) ??
        (u.image as string | null) ??
        null,
      image: (u.image as string | null) ?? null,
    };
  }
  return {
    id: id as number | string,
    first_name: (row.first_name as string | null) ?? null,
    other_names: (row.other_names as string | null) ?? null,
    name: (row.name as string | null) ?? null,
    email: (row.email as string | null) ?? null,
    role: (row.role as string | null) ?? null,
    avatar_url:
      (row.avatar_url as string | null) ??
      (row.image_url as string | null) ??
      (row.image as string | null) ??
      null,
    image: (row.image as string | null) ?? null,
  };
}

function parsePeopleList(value: unknown): ClassroomPerson[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => parsePersonRow(item))
    .filter((item): item is ClassroomPerson => item !== null);
}

export function parseClassroomPeople(raw: unknown): ClassroomPeople {
  const payload = unwrapApiData(raw);

  if (!payload || typeof payload !== "object") {
    return { students: [], instructors: [] };
  }

  const obj = payload as Record<string, unknown>;

  const instructorSources = [
    obj.instructors,
    obj.teachers,
    obj.lecturers,
    obj.faculty,
    obj.staff,
  ];
  const studentSources = [obj.students, obj.learners, obj.members];

  const instructors = instructorSources.flatMap((value) => parsePeopleList(value));
  const studentsFromArrays = studentSources.flatMap((value) =>
    parsePeopleList(value),
  );

  if (instructors.length > 0 || studentsFromArrays.length > 0) {
    const instructorIds = new Set(instructors.map((p) => String(p.id)));
    const students = studentsFromArrays.filter(
      (p) => !instructorIds.has(String(p.id)),
    );
    return { students, instructors };
  }

  if (Array.isArray(obj.people)) {
    const people = parsePeopleList(obj.people);
    const instructors = people.filter((p) => {
      const role = (p.role ?? "").toLowerCase();
      return (
        role.includes("instructor") ||
        role.includes("teacher") ||
        role.includes("lecturer") ||
        role.includes("faculty") ||
        role.includes("admin") ||
        role.includes("ta")
      );
    });
    const students = people.filter((p) => !instructors.includes(p));
    return { students, instructors };
  }

  if (obj.data && typeof obj.data === "object") {
    return parseClassroomPeople(obj.data);
  }

  return { students: [], instructors: [] };
}

export function useClassroomPeople(
  classroomId?: number | string | null,
  enabled = true,
) {
  return useQuery({
    queryKey: classroomId
      ? classroomKeys.people(classroomId)
      : ["classroom", "people", "missing"],
    enabled: enabled && classroomId != null,
    queryFn: async () => {
      const result = await apiClient.getClassroomPeople(classroomId!);
      if (result.error) throw new Error(result.error.message);
      return parseClassroomPeople(result.data);
    },
    staleTime: 60_000,
  });
}

function parseAssignmentDetail(raw: unknown): ClassroomAssignmentDetail | null {
  const payload = unwrapApiData(raw);
  if (!payload || typeof payload !== "object") return null;
  return payload as ClassroomAssignmentDetail;
}

export function useClassroomAssignmentDetail(
  courseEnrollmentId?: number | string | null,
  assignmentId?: number | string | null,
  kind: "assignment" | "capstone" = "assignment",
) {
  return useQuery({
    queryKey:
      courseEnrollmentId && assignmentId
        ? classroomKeys.assignmentDetail(courseEnrollmentId, assignmentId, kind)
        : ["classroom", "assignment-detail", "missing"],
    enabled: courseEnrollmentId != null && assignmentId != null,
    queryFn: async () => {
      const result =
        kind === "capstone"
          ? await apiClient.getClassroomCapstoneDetail(
              courseEnrollmentId!,
              assignmentId!,
            )
          : await apiClient.getClassroomAssignmentDetail(
              courseEnrollmentId!,
              assignmentId!,
            );
      if (result.error) throw new Error(result.error.message);
      const detail = parseAssignmentDetail(result.data);
      if (!detail) throw new Error("Unable to load details");
      return detail;
    },
    staleTime: 30_000,
  });
}

function unwrapApiData(raw: unknown): unknown {
  if (!raw || typeof raw !== "object") return raw;
  const envelope = raw as { data?: unknown };
  if ("data" in envelope && envelope.data !== undefined) {
    return unwrapApiData(envelope.data);
  }
  return raw;
}
