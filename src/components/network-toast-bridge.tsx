import NetInfo from '@react-native-community/netinfo';
import { toast } from 'burnt';
import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';

import { isReachableOnline } from '@/lib/react-query-netinfo';

/**
 * Subscribes to connectivity and shows native toasts when the user goes offline or comes back.
 * No-op on web (Burnt is native-focused).
 */
export function NetworkToastBridge() {
    const previousOnline = useRef<boolean | null>(null);

    useEffect(() => {
        if (Platform.OS === 'web') return;

        const unsubscribe = NetInfo.addEventListener((state) => {
            const online = isReachableOnline(state);
            const prev = previousOnline.current;

            if (prev === null) {
                previousOnline.current = online;
                if (!online) {
                    toast({
                        title: "You're offline",
                        message: 'Check your connection and try again.',
                        preset: 'error',
                        haptic: 'error',
                        duration: 3.5,
                        from: 'bottom',
                    });
                }
                return;
            }

            if (prev && !online) {
                toast({
                    title: "You're offline",
                    message: 'Check your connection and try again.',
                    preset: 'error',
                    haptic: 'error',
                    duration: 3.5,
                    from: 'bottom',
                });
            } else if (!prev && online) {
                toast({
                    title: "You're back online",
                    preset: 'done',
                    haptic: 'success',
                    duration: 2,
                    from: 'bottom',
                });
            }

            previousOnline.current = online;
        });

        return unsubscribe;
    }, []);

    return null;
}
