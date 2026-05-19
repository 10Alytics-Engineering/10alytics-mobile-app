import { router } from "expo-router";

export function openClassroomAssignmentDetail(params: {
  courseEnrollmentId: number | string;
  assignmentId: number | string;
  kind: "assignment" | "capstone";
}) {
  const pathname =
    params.kind === "capstone"
      ? "/classroom/capstone/[assignmentId]"
      : "/classroom/assignment/[assignmentId]";

  router.push({
    pathname,
    params: {
      assignmentId: String(params.assignmentId),
      courseEnrollmentId: String(params.courseEnrollmentId),
    },
  });
}

export function openClassroomResourceDetail(params: {
  courseEnrollmentId: number | string;
  resourceId: number | string;
}) {
  router.push({
    pathname: "/classroom/resource/[resourceId]",
    params: {
      resourceId: String(params.resourceId),
      courseEnrollmentId: String(params.courseEnrollmentId),
    },
  });
}
