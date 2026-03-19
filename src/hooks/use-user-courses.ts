import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";

export const userCoursesQueryKey = ["user", "courses"] as const;

export function useUserCourses() {
  return useQuery({
    queryKey: userCoursesQueryKey,
    queryFn: async () => {
      const result = await apiClient.getUserCourses();
      if (result.error) {
        throw new Error(result.error.message);
      }
      return result.data;
    },
  });
}
