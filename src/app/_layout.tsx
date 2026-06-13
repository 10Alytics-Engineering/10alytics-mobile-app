import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { Stack, ThemeProvider as RouterThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as React from 'react';
import { Platform, StyleSheet } from 'react-native';
import FlashMessage from 'react-native-flash-message';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';

import { NetworkToastBridge } from '@/components/network-toast-bridge';
import { useThemeConfig } from '@/components/ui/use-theme-config';
import { ThemeProvider as UniwindThemeProvider } from '@/contexts/theme-context';
import useThemedNavigation from '@/hooks/use-themed-navigation';
import { APIProvider } from '@/lib/api';
import { loadSelectedTheme } from '@/lib/hooks/use-selected-theme';
import { initializeNotifications } from '@/lib/notifications';
import { useAuthStore } from '@/utils/auth-store';
// Import global CSS file
import '../global.css';

export { ErrorBoundary } from 'expo-router';

// eslint-disable-next-line react-refresh/only-export-components
export const unstable_settings = {
  initialRouteName: 'index',
  anchor: '(tabs)',
};

const isWeb = Platform.OS === 'web';

loadSelectedTheme();
if (!isWeb) {
  SplashScreen.preventAutoHideAsync();
}

export default function RootLayout() {
  return (
    <Providers>
      <RootNavigator />
    </Providers>
  );
}

function RootNavigator() {
  const { screenOptions } = useThemedNavigation();
  const {
    isLoggedIn,
    shouldCreateAccount,
    hasCompletedOnboarding,
    _hasHydrated,
    checkAuth,
  } = useAuthStore();

  React.useEffect(() => {
    if (_hasHydrated) {
      checkAuth();
      if (!isWeb)
        SplashScreen.hideAsync();
    }
  }, [_hasHydrated, checkAuth]);

  React.useEffect(() => {
    if (_hasHydrated)
      initializeNotifications(isLoggedIn);
  }, [_hasHydrated, isLoggedIn]);

  if (!_hasHydrated && !isWeb)
    return null;

  return (
    <>
      <NetworkToastBridge />
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
          <Stack.Screen
            name="forgot-password"
            options={{ headerShown: false, presentation: 'card' }}
          />
          <Stack.Screen
            name="reset-password"
            options={{ headerShown: false, presentation: 'card' }}
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
        </Stack.Protected>
      </Stack>
    </>
  );
}

function Providers({ children }: { children: React.ReactNode }) {
  const theme = useThemeConfig();
  return (
    <GestureHandlerRootView
      style={styles.container}
      // eslint-disable-next-line better-tailwindcss/no-unknown-classes
      className={theme.dark ? `dark` : undefined}
    >
      <KeyboardProvider>
        <APIProvider>
          <UniwindThemeProvider>
            <RouterThemeProvider value={theme}>
              <BottomSheetModalProvider>
                {children}
                <FlashMessage position="top" />
              </BottomSheetModalProvider>
            </RouterThemeProvider>
          </UniwindThemeProvider>
        </APIProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
