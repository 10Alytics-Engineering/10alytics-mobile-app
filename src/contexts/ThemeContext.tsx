import { StatusBar } from "expo-status-bar";
import React, { createContext, useContext, useEffect, useState } from "react";
import { Appearance, View } from "react-native";
import { Uniwind } from "uniwind";

type ThemeContextType = {
  theme: "light" | "dark";
  toggleTheme: () => void;
  setTheme: (theme: "light" | "dark") => void;
};

function initialThemeFromSystem(): "light" | "dark" {
  const scheme = Appearance.getColorScheme();
  return scheme === "light" || scheme === "dark" ? scheme : "light";
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentTheme, setCurrentTheme] = useState<"light" | "dark">(
    initialThemeFromSystem,
  );

  useEffect(() => {
    Uniwind.setTheme(currentTheme);
  }, [currentTheme]);

  const toggleTheme = () => {
    setCurrentTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const setTheme = (theme: "light" | "dark") => {
    setCurrentTheme(theme);
  };

  return (
    <ThemeContext.Provider value={{ theme: currentTheme, toggleTheme, setTheme }}>
      <StatusBar style={currentTheme === "dark" ? "light" : "dark"} />
      <View className="flex-1 bg-background">{children}</View>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export default ThemeProvider;
