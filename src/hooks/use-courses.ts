import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";

export const coursesQueryKey = ["courses", "catalog"] as const;

/** Public course catalog (all available courses). */
export function useCourses() {
  return useQuery({
    queryKey: coursesQueryKey,
    queryFn: async () => {
      const result = await apiClient.getCourses();
      if (result.error) {
        throw new Error(result.error.message);
      }
      return result.data ?? [];
    },
  });
}
