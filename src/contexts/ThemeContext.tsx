import { StatusBar } from "expo-status-bar";
import React, { createContext, useContext, useState } from "react";
import { Appearance, View } from "react-native";

function initialThemeFromSystem(): "light" | "dark" {
  const s = Appearance.getColorScheme();
  return s === "light" || s === "dark" ? s : "dark";
}

const BACKGROUND = {
  light: "#F4F4F5",
  dark: "#0A0A0A",
} as const;

interface ThemeProviderProps {
  children: React.ReactNode;
}

type ThemeContextType = {
  theme: "light" | "dark";
  toggleTheme: () => void;
};

export const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [currentTheme, setCurrentTheme] = useState<"light" | "dark">(
    initialThemeFromSystem,
  );

  const toggleTheme = () => {
    setCurrentTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme: currentTheme, toggleTheme }}>
      <StatusBar style={currentTheme === "dark" ? "light" : "dark"} />
      <View style={{ flex: 1, backgroundColor: BACKGROUND[currentTheme] }}>
        {children}
      </View>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

// Default export for the ThemeProvider
export default ThemeProvider;
