import { useQuery } from "@tanstack/react-query";

import { apiClient, type GamificationScope } from "@/lib/api-client";

function scopeKey(scope?: GamificationScope) {
  return [scope?.course_id ?? null, scope?.cohort_id ?? null] as const;
}

export const leaderboardQueryKey = (scope?: GamificationScope) =>
  ["gamification", "leaderboard", ...scopeKey(scope)] as const;

export const weeklyStatsQueryKey = (scope?: GamificationScope) =>
  ["gamification", "weekly-stats", ...scopeKey(scope)] as const;

export const courseXpQueryKey = (scope?: GamificationScope) =>
  ["gamification", "xp", ...scopeKey(scope)] as const;

/**
 * Course leaderboard + the current user's rank/xp.
 * Returns `null` when the user has no enrollment (endpoint 404s) instead of throwing.
 */
export function useCourseLeaderboard(scope?: GamificationScope) {
  return useQuery({
    queryKey: leaderboardQueryKey(scope),
    staleTime: 60_000,
    queryFn: async () => {
      const result = await apiClient.getCourseLeaderboard(scope);
      if (result.error) return null;
      return result.data?.data ?? null;
    },
  });
}

/** Weekly streak + lesson-completion stats. Returns `null` when there is no enrollment. */
export function useWeeklyStreakStats(scope?: GamificationScope) {
  return useQuery({
    queryKey: weeklyStatsQueryKey(scope),
    staleTime: 60_000,
    queryFn: async () => {
      const result = await apiClient.getWeeklyStreakStats(scope);
      if (result.error) return null;
      return result.data?.data ?? null;
    },
  });
}

/** Current user's XP. Returns `null` when there is no enrollment. */
export function useCourseXp(scope?: GamificationScope) {
  return useQuery({
    queryKey: courseXpQueryKey(scope),
    staleTime: 60_000,
    queryFn: async () => {
      const result = await apiClient.getCourseXp(scope);
      if (result.error) return null;
      return result.data?.data ?? null;
    },
  });
}
