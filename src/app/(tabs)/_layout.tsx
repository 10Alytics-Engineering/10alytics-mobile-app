import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Icon, Label, Tabs } from "expo-router";
import { NativeTabs } from "expo-router/build/native-tabs";
import React from "react";
import { Platform, StyleSheet } from "react-native";

import { HapticTab } from "@/components/haptic-tab";
import useThemeColors from "@/contexts/ThemeColors";
import { useTheme } from "@/contexts/ThemeContext";
import useThemedNavigation from "@/hooks/useThemedNavigation";

function IOSTabLayout() {
    const { screenOptions } = useThemedNavigation();
    const { theme } = useTheme();
    const tc = useThemeColors();

    return (
        <NativeTabs
            key={theme}
            backgroundColor={screenOptions.backgroundColor}
            labelStyle={{
                color: tc.tabLabel,
            }}
            tintColor={tc.tabTint}
        >
            <NativeTabs.Trigger name="index">
                <Icon
                    sf={{ default: "square.grid.2x2", selected: "square.grid.2x2.fill" }}
                    drawable=""
                />
                <Label>Dashboard</Label>
            </NativeTabs.Trigger>
            <NativeTabs.Trigger name="courses">
                <Icon
                    sf={{ default: "book.closed", selected: "book.closed.fill" }}
                    drawable=""
                />
                <Label>Courses</Label>
            </NativeTabs.Trigger>
            <NativeTabs.Trigger name="classroom">
                <Icon
                    sf={{ default: "graduationcap", selected: "graduationcap.fill" }}
                    drawable=""
                />
                <Label>Classroom</Label>
            </NativeTabs.Trigger>
            <NativeTabs.Trigger name="chat">
                <Icon sf={{ default: "message", selected: "message.fill" }} drawable="" />
                <Label>Chat</Label>
            </NativeTabs.Trigger>
            <NativeTabs.Trigger name="profile">
                <Icon
                    sf={{ default: "person.circle", selected: "person.circle.fill" }}
                    drawable=""
                />
                <Label>Profile</Label>
            </NativeTabs.Trigger>
        </NativeTabs>
    );
}

function AndroidTabLayout() {
    const { theme } = useTheme();
    const tc = useThemeColors();

    return (
        <Tabs
            key={theme}
            screenOptions={{
                tabBarActiveTintColor: tc.primary,
                tabBarInactiveTintColor: tc.textMuted,
                tabBarHideOnKeyboard: true,
                tabBarButton: (props) => <HapticTab {...props} />,
                tabBarBackground: () => (
                    <BlurView
                        intensity={tc.tabBlurIntensity}
                        tint={tc.isDark ? "dark" : "light"}
                        style={StyleSheet.absoluteFill}
                    />
                ),
                tabBarStyle: {
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 72,
                    paddingBottom: 10,
                    paddingTop: 8,
                    borderTopWidth: StyleSheet.hairlineWidth,
                    borderTopColor: tc.tabBarBorder,
                    borderTopLeftRadius: 22,
                    borderTopRightRadius: 22,
                    overflow: "hidden",
                    backgroundColor: tc.tabBarSurface,
                    elevation: 0,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: -6 },
                    shadowOpacity: tc.tabShadowOpacity,
                    shadowRadius: 14,
                },
                tabBarLabelStyle: {
                    fontSize: 10,
                    fontWeight: "700",
                    letterSpacing: 0.2,
                    marginTop: 2,
                },
                tabBarItemStyle: {
                    paddingVertical: 2,
                },
                headerStyle: {
                    backgroundColor: tc.headerSurface,
                    elevation: 0,
                    shadowOpacity: 0,
                },
                headerTintColor: tc.text,
                headerTitleStyle: {
                    fontWeight: "700",
                    fontSize: 18,
                },
                headerShown: false,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "Dashboard",
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name={focused ? "grid" : "grid-outline"}
                            size={focused ? 26 : 24}
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="courses"
                options={{
                    title: "Courses",
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name={focused ? "book" : "book-outline"}
                            size={focused ? 26 : 24}
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="classroom"
                options={{
                    title: "Classroom",
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name={focused ? "school" : "school-outline"}
                            size={focused ? 27 : 24}
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="chat"
                options={{
                    title: "Chat",
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name={focused ? "chatbubble" : "chatbubble-outline"}
                            size={focused ? 26 : 24}
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: "Profile",
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name={focused ? "person-circle" : "person-circle-outline"}
                            size={focused ? 26 : 24}
                            color={color}
                        />
                    ),
                }}
            />
        </Tabs>
    );
}

export default function TabLayout() {
    if (Platform.OS === "ios") {
        return <IOSTabLayout />;
    }
    return <AndroidTabLayout />;
}
