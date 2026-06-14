/**
 * App color tokens and design system constants.
 */

import { Platform } from "react-native";

const tintColorLight = "#DA6728";
const tintColorDark = "#fff";

export const Colors = {
  light: {
    primary: "#DA6728",
    primaryLight: "#F08A4B",
    primaryDark: "#B8541E",
    text: "#11181C",
    textSecondary: "#687076",
    background: "#fff",
    backgroundSecondary: "#F8F9FA",
    backgroundElement: "#F0F0F3",
    backgroundSelected: "#E0E1E6",
    tint: tintColorLight,
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: tintColorLight,
    glass: {
      background: "rgba(255, 255, 255, 0.7)",
      backgroundLight: "rgba(255, 255, 255, 0.85)",
      backgroundDark: "rgba(255, 255, 255, 0.5)",
      border: "rgba(255, 255, 255, 0.5)",
      borderLight: "rgba(255, 255, 255, 0.8)",
      shadow: "rgba(218, 103, 40, 0.15)",
    },
  },
  dark: {
    primary: "#DA6728",
    primaryLight: "#F08A4B",
    primaryDark: "#B8541E",
    text: "#ECEDEE",
    textSecondary: "#9BA1A6",
    background: "#0A0A0A",
    backgroundSecondary: "#1E2021",
    backgroundElement: "#212225",
    backgroundSelected: "#2E3135",
    tint: tintColorDark,
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: tintColorDark,
    glass: {
      background: "rgba(30, 32, 33, 0.7)",
      backgroundLight: "rgba(40, 42, 44, 0.85)",
      backgroundDark: "rgba(20, 22, 23, 0.5)",
      border: "rgba(255, 255, 255, 0.15)",
      borderLight: "rgba(255, 255, 255, 0.25)",
      shadow: "rgba(218, 103, 40, 0.2)",
    },
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const GlassStyles = {
  blur: {
    light: 20,
    medium: 40,
    heavy: 60,
  },
  borderRadius: {
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24,
    full: 9999,
  },
  shadow: {
    light: {
      shadowColor: "#DA6728",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 4,
    },
    medium: {
      shadowColor: "#DA6728",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 20,
      elevation: 8,
    },
    heavy: {
      shadowColor: "#DA6728",
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.2,
      shadowRadius: 32,
      elevation: 12,
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
};

export const Gradients = {
  primary: ["#DA6728", "#F08A4B", "#FF9F5A"],
  warmSunset: ["#DA6728", "#E85D04", "#DC2F02"],
  softOrange: ["#FFB088", "#DA6728", "#B8541E"],
  glass: ["rgba(255,255,255,0.3)", "rgba(255,255,255,0.1)"],
  glassDark: ["rgba(0,0,0,0.3)", "rgba(0,0,0,0.1)"],
  accent: {
    blue: ["#4A90E2", "#357ABD"],
    purple: ["#9B59B6", "#8E44AD"],
    green: ["#27AE60", "#219A52"],
    red: ["#E74C3C", "#C0392B"],
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "var(--font-display)",
    serif: "var(--font-serif)",
    rounded: "var(--font-rounded)",
    mono: "var(--font-mono)",
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
