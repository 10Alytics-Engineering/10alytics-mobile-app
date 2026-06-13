import useThemeColors from '@/contexts/ThemeColors';
import { shadowPresets } from "@/utils/useShadow";
import AntDesign from '@expo/vector-icons/AntDesign';
import Feather from '@expo/vector-icons/Feather';
import { LinearGradient } from "expo-linear-gradient";
import LottieView from "lottie-react-native";
import { useEffect } from "react";
import { Pressable, Text, useWindowDimensions, View } from "react-native";
import Animated, {
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSpring,
    withTiming,
} from "react-native-reanimated";

export const CardFlipFire = ({
    title,
    price,
    days = 7,
}: {
    title: string;
    price: string;
    days?: number;
}) => {
    const rotation = useSharedValue(0);
    const colors = useThemeColors();
    const { width: windowWidth } = useWindowDimensions();
    const cardWidth = windowWidth - 48; // Account for padding (24px on each side)
    const textColor = colors.isDark ? "white" : "#111111";
    const mutedTextColor = colors.isDark ? "rgba(255,255,255,0.75)" : "rgba(17,17,17,0.7)";
    const surfaceColor = colors.isDark ? "#141414" : "#F7F7F8";
    const accent = "#0F5A6E";
    const daysRow = [
        { label: "Sun", state: "done" },
        { label: "Mon", state: "done" },
        { label: "Tue", state: "done" },
        { label: "Wed", state: "fire" },
        { label: "Thu", state: "empty" },
        { label: "Fri", state: "empty" },
        { label: "Sat", state: "empty" },
    ] as const;

    const flipCard = () => {
        rotation.value = withSpring(rotation.value === 0 ? 180 : 0, {
            damping: 100,
            stiffness: 600,
        });
    };

    const frontAnimatedStyle = useAnimatedStyle(() => {
        const opacity = interpolate(rotation.value, [0, 90, 180], [1, 0, 0]);
        return {
            transform: [{ perspective: 1000 }, { rotateY: `${rotation.value}deg` }],
            opacity
        };
    });

    const backAnimatedStyle = useAnimatedStyle(() => {
        const opacity = interpolate(rotation.value, [0, 90, 180], [0, 0, 1]);
        return {
            transform: [{ perspective: 1000 }, { rotateY: `${rotation.value - 180}deg` }],
            opacity,
        };
    });

    return (
        <View style={{ height: 280, marginBottom: 24 }}>
            {/** Front side */}
            <Animated.View style={[{ position: 'absolute', width: '100%', height: '100%' }, frontAnimatedStyle]}>
                <View style={[{ backgroundColor: colors.secondary, borderRadius: 30, height: '100%', overflow: 'hidden' }, shadowPresets.large]}>
                    <View style={{ width: cardWidth, height: "100%" }}>
                        <LottieView
                            source={require('@/assets/Fire.json')}
                            autoPlay
                            loop
                            style={{ width: "100%", height: "100%" }}
                        />
                    </View>
                    <LinearGradient
                        colors={['transparent', 'rgba(0, 0, 0, 0.2)']}
                        style={{ position: 'absolute', width: '100%', height: '100%' }}
                        pointerEvents="none"
                    >
                        <View style={{ width: '100%', height: '100%', justifyContent: 'flex-end', alignItems: 'flex-start', padding: 32 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', justifyContent: 'space-between', gap: 8, marginBottom: 'auto' }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
                                    <AntDesign name="fire" size={16} color={textColor} />
                                    <Text style={{ color: textColor, fontWeight: '600', fontSize: 18 }}>
                                        {days}
                                    </Text>
                                </View>
                            </View>

                            <Text style={{ color: textColor, fontSize: 30, fontWeight: '700' }}>
                                {title}
                            </Text>
                            <Text style={{ color: mutedTextColor, fontSize: 16 }}>
                                {price}
                            </Text>
                            <Feather
                                name="plus-circle"
                                size={24}
                                style={{ position: 'absolute', bottom: 32, right: 32 }}
                                color={textColor}
                            />
                        </View>
                    </LinearGradient>

                    <Pressable
                        onPress={flipCard}
                        style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: 150,
                        }}
                    />
                </View>
            </Animated.View>

            {/** Back side */}
            <Animated.View style={[{ position: 'absolute', width: '100%', height: '100%' }, backAnimatedStyle]}>
                <Pressable
                    onPress={flipCard}
                    style={[{ borderRadius: 30, height: '100%', padding: 24 }, { backgroundColor: surfaceColor }, shadowPresets.large]}
                >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={{ color: textColor, fontSize: 20, fontWeight: '700' }}>
                            Streak
                        </Text>
                        <Text style={{ color: mutedTextColor, fontSize: 14 }}>
                            21 Dec – 27 Dec
                        </Text>
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
                        {daysRow.map((day) => (
                            <View key={day.label} style={{ alignItems: 'center' }}>
                                <View
                                    style={{
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: 28,
                                        height: 28,
                                        borderRadius: 14,
                                        backgroundColor:
                                            day.state === "done" ? accent : "transparent",
                                        borderWidth: day.state === "empty" ? 1.5 : 0,
                                        borderColor: day.state === "empty" ? "#7AA1AE" : "transparent",
                                    }}
                                >
                                    {day.state === "done" && (
                                        <Feather name="check" size={16} color="white" />
                                    )}
                                    {day.state === "fire" && (
                                        <Text style={{ fontSize: 16 }}>🔥</Text>
                                    )}
                                </View>
                                <Text style={{ color: mutedTextColor, fontSize: 12, marginTop: 8 }}>
                                    {day.label}
                                </Text>
                            </View>
                        ))}
                    </View>

                    <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                        <Text style={{ fontSize: 64 }}>🔥</Text>
                        <Text style={{ color: textColor, fontSize: 24, fontWeight: '700', marginTop: 8 }}>
                            {days} days
                        </Text>
                    </View>

                    <View style={{ marginTop: 'auto' }}>
                        <Text style={{ color: mutedTextColor, fontSize: 14 }}>
                            Complete a task today to keep your streak going.
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
                            <Text style={{ color: accent, fontSize: 16, fontWeight: '600' }}>
                                Submit assignment
                            </Text>
                            <Feather name="chevron-right" size={18} color={accent} style={{ marginLeft: 6 }} />
                        </View>
                    </View>
                </Pressable>
            </Animated.View>
        </View >
    );
};

export const CardFlipRank = ({
    title,
    rank,
    subtitle = "Leaderboard rank",
    total,
}: {
    title: string;
    rank: number;
    subtitle?: string;
    total?: number;
}) => {
    const colors = useThemeColors();
    const { width: windowWidth } = useWindowDimensions();
    const cardWidth = windowWidth - 48; // Account for padding (24px on each side)
    const pulse = useSharedValue(1);

    useEffect(() => {
        pulse.value = withRepeat(
            withTiming(1.05, { duration: 1200 }),
            -1,
            true
        );
    }, [pulse]);

    const pulseStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pulse.value }],
        opacity: interpolate(pulse.value, [1, 1.05], [1, 0.85]),
    }));

    return (
        <View style={{ height: 280, marginBottom: 24 }}>
            <View
                style={[{ backgroundColor: colors.secondary, borderRadius: 30, height: '100%', overflow: 'hidden' }, shadowPresets.large]}
            >
                <LinearGradient
                    colors={["#141414", "#2B2B2B"]}
                    style={{ width: cardWidth, height: "100%" }}
                >
                    <View style={{ width: '100%', height: '100%', padding: 32, justifyContent: 'space-between' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Text style={{ color: '#fff', fontSize: 18, fontWeight: '600' }}>{title}</Text>
                            <View style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 9999, paddingHorizontal: 12, paddingVertical: 4 }}>
                                <Text style={{ color: '#fff', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                    Leaderboard
                                </Text>
                            </View>
                        </View>

                        <View>
                            <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, textTransform: 'uppercase' }}>
                                {subtitle}
                            </Text>
                            <Animated.View style={[pulseStyle, { alignSelf: "flex-start" }]}>
                                <Text style={{ color: '#fff', fontSize: 60, fontWeight: '700' }}>
                                    #{rank}
                                </Text>
                            </Animated.View>
                            {total !== undefined && (
                                <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>
                                    of {total}
                                </Text>
                            )}
                        </View>

                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <AntDesign name="trophy" size={18} color={colors.highlight} />
                                <Text style={{ color: '#fff', fontSize: 14 }}>Climbing this week</Text>
                            </View>
                            <Feather name="chevron-right" size={22} color="white" />
                        </View>
                    </View>
                </LinearGradient>
            </View>
        </View>
    );
};
