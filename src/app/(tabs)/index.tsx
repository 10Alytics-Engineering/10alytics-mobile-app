import { CardFlipFire, CardFlipRank } from "@/components/card-flip";
import CourseActionCard from "@/components/CourseActionCard";
import Header from "@/components/Header";
import useThemeColors from "@/contexts/ThemeColors";
import { useAuthStore } from "@/utils/auth-store";
import { Feather as FeatherIcons } from "@expo/vector-icons";
import Feather from "@expo/vector-icons/Feather";
import { Href, Link } from "expo-router";
import React, { useMemo } from "react";
import {
    Pressable,
    ScrollView,
    Text,
    useWindowDimensions,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import "../../../global.css";

type FeatherIconName = keyof typeof FeatherIcons.glyphMap;

export default function Home() {
    const insets = useSafeAreaInsets();
    const { user } = useAuthStore();
    const { width } = useWindowDimensions();
    const cardWidth = Math.round(width * 0.82);
    const colors = useThemeColors();

    const nextLiveClass = useMemo(() => {
        const now = new Date();
        const targetHour = 10;
        const targetMinute = 0;
        const targetDay = 6; // Saturday (0=Sun)

        const next = new Date(now);
        const dayDiff = (targetDay - now.getDay() + 7) % 7;
        next.setDate(now.getDate() + dayDiff);
        next.setHours(targetHour, targetMinute, 0, 0);

        if (next.getTime() <= now.getTime()) {
            next.setDate(next.getDate() + 7);
        }

        const diffMs = next.getTime() - now.getTime();
        const diffMinutes = Math.floor(diffMs / 60000);
        const joinEnabled = diffMinutes <= 60 && diffMinutes >= 0;

        return {
            date: next,
            joinEnabled,
        };
    }, []);

    return (
        <View className="flex-1 bg-background">
            <Header hasAvatar />
            <ScrollView
                style={{ paddingTop: insets.top - 30 }}
                className="px-6 mb-20 bg-background flex-1"
            >
                <View className="mb-14 mt-0 px-4">
                    <Text className="text-5xl font-bold text-text">
                        Hello {user?.first_name}!
                    </Text>
                    <Text className="text-text text-lg opacity-50">
                        Let's continue your learning journey
                    </Text>
                </View>
                <View className="mb-3">
                    <Text className="text-text text-lg font-semibold">
                        Streaks & Rank
                    </Text>
                </View>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="mb-6"
                    style={{ height: 280 }}
                    contentContainerStyle={{ gap: 16, paddingRight: 24 }}
                    snapToInterval={cardWidth + 16}
                    decelerationRate="fast"
                >
                    <View style={{ width: cardWidth }}>
                        <CardFlipFire days={10} title="Current Streak" price="10 days" />
                    </View>
                    <View style={{ width: cardWidth }}>
                        <CardFlipRank
                            title="Your Rank"
                            rank={7}
                            subtitle="Leaderboard rank"
                            total={120}
                        />
                    </View>
                </ScrollView>
                <View className="mb-3">
                    <Text className="text-text text-lg font-semibold">Your Course</Text>
                </View>
                <View className="mb-6">
                    <CourseActionCard
                        title="React Native Fundamentals"
                        subtitle="Pick up where you left off"
                        action="continue"
                        progress={68}
                        icon={require("@/assets/courses/data-analysis.webp")}
                    />
                </View>
                <View className="mb-3">
                    <Text className="text-text text-lg font-semibold">Live Class</Text>
                </View>
                <View
                    className="rounded-[24px] p-5 mb-10"
                    style={{ backgroundColor: colors.secondary }}
                >
                    <View className="flex-row items-center justify-between">
                        <View>
                            <Text className="text-text text-base font-semibold">
                                Your next live class
                            </Text>
                            <Text className="text-text text-sm opacity-60 mt-1">
                                {nextLiveClass.date.toLocaleDateString("en-US", {
                                    weekday: "long",
                                    month: "short",
                                    day: "numeric",
                                })}
                                {" • "}
                                {nextLiveClass.date.toLocaleTimeString("en-US", {
                                    hour: "numeric",
                                    minute: "2-digit",
                                })}
                            </Text>
                        </View>
                        <Feather name="video" size={22} color={colors.icon} />
                    </View>
                    <Pressable
                        disabled={!nextLiveClass.joinEnabled}
                        className="mt-4 rounded-xl px-4 py-3 items-center justify-center"
                        style={{
                            backgroundColor: nextLiveClass.joinEnabled
                                ? "#9CA3AF"
                                : "#E5E7EB",
                            opacity: nextLiveClass.joinEnabled ? 1 : 0.7,
                        }}
                    >
                        <Text
                            style={{
                                color: nextLiveClass.joinEnabled ? "#111827" : "#6B7280",
                            }}
                            className="font-semibold"
                        >
                            Join class
                        </Text>
                    </Pressable>
                </View>
            </ScrollView>
        </View>
    );
}

interface LinkItemProps {
    href: Href;
    icon: FeatherIconName;
    title: string;
    description: string;
    comingSoon?: boolean;
}

const LinkItem = ({
    href,
    icon,
    title,
    description,
    comingSoon = false,
}: LinkItemProps) => {
    const colors = useThemeColors();
    return (
        <Link href={href} asChild>
            <Pressable
                style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 6 },
                    shadowOpacity: 0.07,
                    shadowRadius: 3.84,
                    elevation: 5,
                }}
                className="flex-row items-center bg-secondary rounded-3xl px-4 py-4 mb-3"
            >
                <View className="w-12 h-12 bg-background flex items-center justify-center rounded-full">
                    <Feather name={icon} size={18} color={colors.icon} />
                </View>
                <View className="justify-center ml-4">
                    <View className="flex-row items-center">
                        <Text className="text-base font-bold text-text">{title}</Text>
                        {comingSoon && (
                            <View className="bg-sky-500 rounded-full px-2 py-[3px] ml-2">
                                <Text className="text-xs text-white">Soon</Text>
                            </View>
                        )}
                    </View>
                    <Text className="text-sm text-text opacity-50">{description}</Text>
                </View>
                <View className="ml-auto opacity-30">
                    <Feather name="chevron-right" size={20} color={colors.icon} />
                </View>
            </Pressable>
        </Link>
    );
};

const CameraButton = () => {
    return (
        <View className="w-20 h-20 p-2 mx-auto rounded-full border border-white items-center justify-center">
            <View
                style={{
                    elevation: 10,
                    shadowColor: "black",
                    shadowOffset: { width: 0, height: 10 },
                    shadowOpacity: 0.3,
                    shadowRadius: 10,
                }}
                className="w-full h-full rounded-full bg-white  items-center justify-center"
            />
        </View>
    );
};
