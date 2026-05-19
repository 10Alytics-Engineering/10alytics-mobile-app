import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { apiClient } from "@/lib/api-client";
import { unregisterPushNotifications } from "@/lib/notifications";

const isWeb = Platform.OS === "web";

type UserState = {
  isLoggedIn: boolean;
  shouldCreateAccount: boolean;
  hasCompletedOnboarding: boolean;
  isVip: boolean;
  _hasHydrated: boolean;
  user: {
    id: string;
    first_name: string;
    other_names: string;
    email: string;
    avatar?: string;
  } | null;
  logIn: (user?: { id: string; first_name: string; other_names: string; email: string; avatar?: string }) => void;
  logOut: () => Promise<void>;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  logInAsVip: () => void;
  setHasHydrated: (value: boolean) => void;
  setUser: (user: { id: string; first_name: string; other_names: string; email: string; avatar?: string } | null) => void;
  checkAuth: () => Promise<void>;
};

export const useAuthStore = create(
  persist<UserState>(
    (set, get) => ({
      isLoggedIn: false,
      shouldCreateAccount: false,
      hasCompletedOnboarding: false,
      isVip: false,
      _hasHydrated: false,
      user: null,
      logIn: (user) => {
        set((state) => {
          return {
            ...state,
            isLoggedIn: true,
            user: user || state.user,
          };
        });
      },
      logInAsVip: () => {
        set((state) => {
          return {
            ...state,
            isVip: true,
            isLoggedIn: true,
          };
        });
      },
      logOut: async () => {
        try {
          await unregisterPushNotifications();
        } catch {
          // Ignore device token cleanup errors
        }
        try {
          await apiClient.logout();
        } catch {
          // Ignore logout errors
        }
        set((state) => {
          return {
            ...state,
            isVip: false,
            isLoggedIn: false,
            user: null,
          };
        });
      },
      setUser: (user) => {
        set((state) => ({
          ...state,
          user,
        }));
      },
      completeOnboarding: () => {
        set((state) => {
          return {
            ...state,
            hasCompletedOnboarding: true,
          };
        });
      },
      resetOnboarding: () => {
        set((state) => {
          return {
            ...state,
            hasCompletedOnboarding: false,
          };
        });
      },
      setHasHydrated: (value: boolean) => {
        set((state) => {
          return {
            ...state,
            _hasHydrated: value,
          };
        });
      },
      checkAuth: async () => {
        try {
          const { data: user, error } = await apiClient.getCurrentUser();
          if (user && !error) {
            set((state) => ({
              ...state,
              isLoggedIn: true,
              user,
            }));
          } else {
            set((state) => ({
              ...state,
              isLoggedIn: false,
              user: null,
            }));
          }
        } catch {
          set((state) => ({
            ...state,
            isLoggedIn: false,
            user: null,
          }));
        }
      },
    }),
    {
      name: "auth-store",
      storage: isWeb
        ? createJSONStorage(() => localStorage)
        : createJSONStorage(() => ({
          setItem: (key: string, value: string) =>
            SecureStore.setItemAsync(key, value),
          getItem: (key: string) => SecureStore.getItemAsync(key),
          removeItem: (key: string) => SecureStore.deleteItemAsync(key),
        })),
      onRehydrateStorage: () => {
        return (state) => {
          state?.setHasHydrated(true);
          // Check auth status after rehydration
          state?.checkAuth();
        };
      },
    },
  ),
);
