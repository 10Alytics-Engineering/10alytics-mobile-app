import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';
import { onlineManager } from '@tanstack/react-query';
import { Platform } from 'react-native';

/** Only treat as offline when we're sure (avoids false positives when reachability is unknown). */
export function isReachableOnline(state: NetInfoState): boolean {
    if (state.isConnected === false) return false;
    if (state.isInternetReachable === false) return false;
    return true;
}

/**
 * Wire TanStack Query's online state to NetInfo (native only).
 * Call once at app startup so retries pause while offline and resume when back online.
 */
export function bindReactQueryOnlineManager(): void {
    if (Platform.OS === 'web') return;

    onlineManager.setEventListener((setOnline) => {
        return NetInfo.addEventListener((state) => {
            setOnline(isReachableOnline(state));
        });
    });
}
