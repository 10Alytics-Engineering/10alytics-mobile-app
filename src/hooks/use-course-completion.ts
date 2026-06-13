import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";

export const completedLessonsQueryKey = (enrollmentId?: number | null) =>
  ["course-completion", enrollmentId ?? null] as const;

/** Set of completed lesson ids for an enrollment. */
export function useCompletedLessons(enrollmentId?: number | null) {
  return useQuery({
    queryKey: completedLessonsQueryKey(enrollmentId),
    enabled: enrollmentId != null,
    staleTime: 30_000,
    queryFn: async () => {
      const result = await apiClient.getCompletedVideos(enrollmentId!);
      if (result.error) return new Set<number>();
      return new Set<number>((result.data ?? []).map((id) => Number(id)));
    },
  });
}

/**
 * Mark a lesson complete. Bumps XP/streak server-side, so we also refresh the
 * gamification + course-detail queries on success.
 */
export function useMarkLessonComplete(enrollmentId?: number | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (lessonId: number) => {
      if (enrollmentId == null) throw new Error("Missing enrollment");
      const result = await apiClient.markLessonComplete(enrollmentId, lessonId);
      if (result.error) throw new Error(result.error.message);
      return lessonId;
    },
    onSuccess: (lessonId) => {
      // Optimistically add to the completed set.
      queryClient.setQueryData<Set<number>>(
        completedLessonsQueryKey(enrollmentId),
        (prev) => {
          const next = new Set(prev ?? []);
          next.add(Number(lessonId));
          return next;
        },
      );
      queryClient.invalidateQueries({
        queryKey: completedLessonsQueryKey(enrollmentId),
      });
      queryClient.invalidateQueries({ queryKey: ["gamification"] });
      // Covers both ["user","courses"] and ["user","course",id] (progress %).
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
}
