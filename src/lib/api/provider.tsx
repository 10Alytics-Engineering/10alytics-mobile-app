/* eslint-disable react-refresh/only-export-components */
import { useReactQueryDevTools } from '@dev-plugins/react-query';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { onlineManager, QueryClientProvider } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import * as React from 'react';

import { createQueryClient } from '@/lib/query-client';
import { bindReactQueryOnlineManager } from '@/lib/react-query-netinfo';
import { storage } from '@/lib/storage';

export const queryClient = createQueryClient();

// Bind TanStack Query's online state to NetInfo so queries/mutations pause
// while offline and resume when connectivity returns (native only).
bindReactQueryOnlineManager();

// MMKV-backed persister: keeps successful query results across app restarts so
// previously loaded screens render offline. Mutations are intentionally NOT
// persisted (resuming them across restarts needs per-key mutationFn defaults);
// in-session offline writes are queued by `onlineManager` and flushed on reconnect.
const mmkvPersister = createSyncStoragePersister({
  key: 'RQ_OFFLINE_CACHE',
  throttleTime: 1000,
  storage: {
    getItem: (key: string) => storage.getString(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
    removeItem: (key: string) => storage.remove(key),
  },
});

persistQueryClient({
  queryClient,
  persister: mmkvPersister,
  maxAge: 1000 * 60 * 60 * 24, // 24h
  dehydrateOptions: {
    shouldDehydrateMutation: () => false,
  },
});

export function APIProvider({ children }: { children: React.ReactNode }) {
  useReactQueryDevTools(queryClient);

  React.useEffect(() => {
    // Flush queued (paused) mutations when connectivity returns, and once on mount.
    const unsubscribe = onlineManager.subscribe((isOnline) => {
      if (isOnline)
        queryClient.resumePausedMutations();
    });
    queryClient.resumePausedMutations();
    return unsubscribe;
  }, []);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
