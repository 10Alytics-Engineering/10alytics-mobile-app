import { StatusBar } from "expo-status-bar";
import { colorScheme } from "nativewind";
import React, { createContext, useContext, useEffect, useState } from "react";
import { Appearance, View } from "react-native";

import { themes } from "@/utils/color-theme";

function initialThemeFromSystem(): "light" | "dark" {
    const s = Appearance.getColorScheme();
    return s === "light" || s === "dark" ? s : "dark";
}

interface ThemeProviderProps {
    children: React.ReactNode;
}

type ThemeContextType = {
    theme: "light" | "dark";
    toggleTheme: () => void;
};

export const ThemeContext = createContext<ThemeContextType>({
    theme: "dark",
    toggleTheme: () => { },
});

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
    const [currentTheme, setCurrentTheme] = useState<"light" | "dark">(initialThemeFromSystem);

    useEffect(() => {
        colorScheme.set(currentTheme);
    }, [currentTheme]);

    const toggleTheme = () => {
        setCurrentTheme((prev) => (prev === "light" ? "dark" : "light"));
    };

    return (
        <ThemeContext.Provider value={{ theme: currentTheme, toggleTheme }}>
            <StatusBar backgroundColor="transparent" translucent style={currentTheme === "dark" ? "light" : "dark"} />
            <View style={themes[currentTheme]} className="flex-1 bg-background">
                {children}
            </View>
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

// Default export for the ThemeProvider
export default ThemeProvider; 