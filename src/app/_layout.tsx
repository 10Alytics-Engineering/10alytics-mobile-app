import '../../global.css';
import { QueryClientProvider } from '@tanstack/react-query';
import { SplashScreen, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { NetworkToastBridge } from '@/components/network-toast-bridge';
import { ThemeProvider } from '@/contexts/ThemeContext';
import useThemedNavigation from '@/hooks/useThemedNavigation';
import { createQueryClient } from '@/lib/query-client';
import { bindReactQueryOnlineManager } from '@/lib/react-query-netinfo';
import { useAuthStore } from '@/utils/auth-store';

export const unstable_settings = {
    initialRouteName: 'index',
    anchor: '(tabs)',
};

const isWeb = Platform.OS === 'web';

if (!isWeb) {
    SplashScreen.preventAutoHideAsync();
}

export default function RootLayout() {
    const [queryClient] = useState(() => createQueryClient());
    const { screenOptions, isDark } = useThemedNavigation();
    const { isLoggedIn, shouldCreateAccount, hasCompletedOnboarding, _hasHydrated, checkAuth } =
        useAuthStore();

    useEffect(() => {
        bindReactQueryOnlineManager();
    }, []);

    useEffect(() => {
        if (_hasHydrated) {
            // Check authentication status when app loads
            checkAuth();
            SplashScreen.hideAsync();
        }
    }, [_hasHydrated, checkAuth]);

    if (!_hasHydrated && !isWeb) {
        return null;
    }
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <QueryClientProvider client={queryClient}>
                <ThemeProvider>
                    <>
                        <NetworkToastBridge />
                        <StatusBar style={isDark ? 'light' : 'dark'} />
                        <Stack screenOptions={screenOptions}>
                            <Stack.Protected guard={!hasCompletedOnboarding}>
                                <Stack.Screen name="onboarding" options={{ headerShown: false }} />
                            </Stack.Protected>
                            <Stack.Protected guard={!isLoggedIn && hasCompletedOnboarding}>
                                <Stack.Screen name="index" />
                                <Stack.Screen
                                    name="sign-in"
                                    options={{
                                        title: 'Sign In',
                                        presentation: Platform.OS === 'ios' ? 'formSheet' : 'modal',
                                        sheetGrabberVisible: true,
                                        sheetAllowedDetents: [0.4],
                                        sheetCornerRadius: 24,
                                        headerShown: false,
                                        contentStyle: { backgroundColor: 'transparent' },
                                    }}
                                />
                                <Stack.Protected guard={shouldCreateAccount}>
                                    <Stack.Screen
                                        name="create-account"
                                        options={{
                                            title: 'Create Account',
                                            presentation: Platform.OS === 'ios' ? 'formSheet' : 'modal',
                                            sheetGrabberVisible: true,
                                            sheetAllowedDetents: [0.4],
                                            sheetCornerRadius: 24,
                                            headerShown: false,
                                            contentStyle: { backgroundColor: 'transparent' },
                                        }}
                                    />
                                </Stack.Protected>
                            </Stack.Protected>
                            <Stack.Protected guard={isLoggedIn}>
                                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                                <Stack.Screen
                                    name="chat-room"
                                    options={{
                                        headerShown: false,
                                        presentation: 'card',
                                        animation: 'default',
                                    }}
                                />
                                <Stack.Screen
                                    name="(screens)"
                                    options={{
                                        headerShown: false,
                                        presentation: Platform.OS === 'ios' ? 'fullScreenModal' : 'modal',
                                        animation: 'slide_from_bottom',
                                        gestureEnabled: true,
                                        fullScreenGestureEnabled: Platform.OS === 'ios',
                                        animationMatchesGesture: Platform.OS === 'ios',
                                    }}
                                />
                                <Stack.Screen
                                    name="settings"
                                    options={{
                                        headerShown: false,
                                        presentation: 'card',
                                        animation: 'default',
                                    }}
                                />
                            </Stack.Protected>
                        </Stack>
                    </>
                </ThemeProvider>
            </QueryClientProvider>
        </GestureHandlerRootView>
    );
}
