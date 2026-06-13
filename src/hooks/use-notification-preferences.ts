import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  apiClient,
  type NotificationPreferences,
} from "@/lib/api-client";

export const notificationPreferencesQueryKey = [
  "notification-preferences",
] as const;

/** Current user's notification preferences (merged over server defaults). */
export function useNotificationPreferences() {
  return useQuery({
    queryKey: notificationPreferencesQueryKey,
    queryFn: async () => {
      const result = await apiClient.getNotificationPreferences();
      if (result.error) {
        throw new Error(result.error.message);
      }
      return result.data?.data ?? null;
    },
  });
}

/** Toggle one or more preferences with an optimistic update. */
export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Partial<NotificationPreferences>) => {
      const result = await apiClient.updateNotificationPreferences(payload);
      if (result.error) {
        throw new Error(result.error.message);
      }
      return result.data?.data ?? null;
    },
    onMutate: async (payload) => {
      await queryClient.cancelQueries({
        queryKey: notificationPreferencesQueryKey,
      });
      const previous = queryClient.getQueryData<NotificationPreferences | null>(
        notificationPreferencesQueryKey,
      );
      if (previous) {
        queryClient.setQueryData<NotificationPreferences>(
          notificationPreferencesQueryKey,
          { ...previous, ...payload },
        );
      }
      return { previous };
    },
    onError: (_error, _payload, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          notificationPreferencesQueryKey,
          context.previous,
        );
      }
    },
    onSuccess: (data) => {
      if (data) {
        queryClient.setQueryData(notificationPreferencesQueryKey, data);
      }
    },
  });
}
