import { useMutation, useQueryClient } from "@tanstack/react-query";

import { classroomKeys } from "@/hooks/use-classroom";
import { apiClient, type SubmitAssignmentPayload } from "@/lib/api-client";

/**
 * Save and/or turn in a classroom assignment submission, then refresh the
 * assignment detail so the UI reflects the new submission state.
 */
export function useSubmitAssignment(
  courseEnrollmentId: number | string,
  assignmentId: number | string,
  kind: "assignment" | "capstone" = "assignment",
) {
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: classroomKeys.assignmentDetail(
        courseEnrollmentId,
        assignmentId,
        kind,
      ),
    });

  const save = useMutation({
    mutationFn: async (payload: Omit<SubmitAssignmentPayload, "courseEnrollmentId" | "assignmentId">) => {
      const result = await apiClient.submitAssignment({
        courseEnrollmentId,
        assignmentId,
        ...payload,
      });
      if (result.error) throw new Error(result.error.message);
      return result.data?.data ?? null;
    },
    onSuccess: invalidate,
  });

  const turnIn = useMutation({
    mutationFn: async (submissionId: number | string) => {
      const result = await apiClient.turnInSubmission(
        courseEnrollmentId,
        submissionId,
      );
      if (result.error) throw new Error(result.error.message);
      return result.data?.data ?? null;
    },
    onSuccess: invalidate,
  });

  return { save, turnIn };
}
