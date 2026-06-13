import useThemeColors from '@/contexts/theme-colors';
import { shadowPresets } from "@/utils/useShadow";
import AntDesign from '@expo/vector-icons/AntDesign';
import Feather from '@expo/vector-icons/Feather';
import { LinearGradient } from "expo-linear-gradient";
import LottieView from "lottie-react-native";
import { useEffect, useRef, useState } from "react";
import { FlatList, Image, ImageSourcePropType, Pressable, Text, useWindowDimensions, View } from "react-native";
import Animated, {
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSpring,
    withTiming,
} from "react-native-reanimated";


export const CardFlip = ({
    title,
    price,
    images,
    days = 7,
}: {
    title: string;
    price: string;
    images: any[];
    days?: number;
}) => {
    const rotation = useSharedValue(0);
    const colors = useThemeColors();
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);
    const { width: windowWidth } = useWindowDimensions();
    const cardWidth = windowWidth - 48; // Account for padding (24px on each side)

    const flipCard = () => {
        rotation.value = withSpring(rotation.value === 0 ? 180 : 0, {
            damping: 100,
            stiffness: 600,
        });
    };

    const handleScroll = (event: any) => {
        const scrollPosition = event.nativeEvent.contentOffset.x;
        const index = Math.round(scrollPosition / cardWidth);
        setActiveImageIndex(index);
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
        <View className="h-[280px] mb-6">
            {/** Front side */}
            <Animated.View style={[{ position: 'absolute', width: '100%', height: '100%' }, frontAnimatedStyle]}>
                <View className="bg-secondary rounded-[30px] h-full overflow-hidden" style={shadowPresets.large}>
                    <FlatList
                        ref={flatListRef}
                        data={images}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onScroll={handleScroll}
                        scrollEventThrottle={16}
                        renderItem={({ item }) => (
                            <View style={{ width: cardWidth }}>
                                <Image
                                    source={item as ImageSourcePropType}
                                    style={{ width: '100%', height: '100%' }}
                                    resizeMode="cover"
                                />
                            </View>
                        )}
                        keyExtractor={(_, index) => index.toString()}
                    />
                    <LinearGradient
                        colors={['transparent', 'rgba(0, 0, 0, 0.2)']}
                        style={{ position: 'absolute', width: '100%', height: '100%' }}
                        pointerEvents="none"
                    >
                        <View className="w-full h-full justify-end items-start p-8">


                            <View className="flex-row items-center w-full justify-between gap-2 mb-auto ">
                                {/* Dot indicators */}
                                <View className="flex-row gap-1.5">
                                    {images.map((_, index) => (
                                        <View
                                            key={index}
                                            className="rounded-full"
                                            style={{
                                                width: 6,
                                                height: 6,
                                                backgroundColor: activeImageIndex === index ? 'white' : 'rgba(255, 255, 255, 0.4)',
                                            }}
                                        />
                                    ))}
                                </View>
                                <View className="flex-row items-center gap-2 ml-auto">
                                    <AntDesign name="fire" size={16} color="white" />
                                    <Text className="text-white font-semibold text-lg">{days}</Text>
                                </View>
                            </View>

                            <Text className="text-white text-3xl font-bold">{title}</Text>
                            <Text className="text-white text-base">{price}</Text>
                            <Feather name="plus-circle" size={24} className="absolute bottom-8 right-8" color="white" />
                        </View>
                    </LinearGradient>

                    {/* Flip button - positioned absolutely in bottom area */}
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
                    className="bg-secondary rounded-[30px] h-full p-6"
                    style={shadowPresets.large}
                >
                    <View className="flex-row justify-between items-center mb-2">
                        <Text className="text-text text-3xl font-bold">{title}</Text>
                        <View className="flex-row items-center gap-4">
                            <Feather name="heart" size={22} color={colors.text} />
                            <Feather name="x" size={24} color={colors.text} />
                        </View>
                    </View>
                    <View className="flex-1 justify-center">
                        <View className="mb-8">
                            <Text className="text-text text-xl font-bold">{price}</Text>
                        </View>
                        <View className="mb-8">
                            <Text className="text-text text-sm uppercase opacity-50">Description</Text>
                            <Text className="text-text text-base">Premium quality sneakers with exceptional comfort and style.</Text>
                        </View>
                        <View className="mb-8">
                            <Text className="text-text text-sm uppercase opacity-50 mb-2">Sizes</Text>
                            <View className="flex-row gap-2">
                                {['7', '8', '9', '10', '11'].map((size) => (
                                    <View key={size} className="bg-background rounded-lg px-3 py-2">
                                        <Text className="text-text font-semibold">{size}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                        <View className="mb-8">
                            <Text className="text-text text-sm uppercase opacity-50 mb-2">Colors</Text>
                            <View className="flex-row gap-2">
                                <View className="bg-neutral-900 rounded-full w-6 h-6" />
                                <View className="bg-neutral-300 rounded-full w-6 h-6" />
                                <View className="bg-red-300 rounded-full w-6 h-6" />
                            </View>
                        </View>
                        <Pressable className="bg-text rounded-xl px-3 py-3 items-center justify-center mt-auto">
                            <Text className="text-invert text-base font-bold">Add to Cart</Text>
                        </Pressable>

                    </View>
                </Pressable>
            </Animated.View>
        </View>
    );
}

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
        <View className="h-[280px] mb-6">
            {/** Front side */}
            <Animated.View style={[{ position: 'absolute', width: '100%', height: '100%' }, frontAnimatedStyle]}>
                <View className="bg-secondary rounded-[30px] h-full overflow-hidden" style={shadowPresets.large}>
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
                        <View className="w-full h-full justify-end items-start p-8">
                            <View className="flex-row items-center w-full justify-between gap-2 mb-auto ">
                                <View className="flex-row items-center gap-2 ml-auto">
                                    <AntDesign name="fire" size={16} color={textColor} />
                                    <Text style={{ color: textColor }} className="font-semibold text-lg">
                                        {days}
                                    </Text>
                                </View>
                            </View>

                            <Text style={{ color: textColor }} className="text-3xl font-bold">
                                {title}
                            </Text>
                            <Text style={{ color: mutedTextColor }} className="text-base">
                                {price}
                            </Text>
                            <Feather
                                name="plus-circle"
                                size={24}
                                className="absolute bottom-8 right-8"
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
                    className="rounded-[30px] h-full p-6"
                    style={{ backgroundColor: surfaceColor, ...shadowPresets.large }}
                >
                    <View className="flex-row justify-between items-center">
                        <Text style={{ color: textColor }} className="text-xl font-bold">
                            Streak
                        </Text>
                        <Text style={{ color: mutedTextColor }} className="text-sm">
                            21 Dec – 27 Dec
                        </Text>
                    </View>

                    <View className="flex-row justify-between mt-4">
                        {daysRow.map((day) => (
                            <View key={day.label} className="items-center">
                                <View
                                    className="items-center justify-center"
                                    style={{
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
                                <Text style={{ color: mutedTextColor }} className="text-xs mt-2">
                                    {day.label}
                                </Text>
                            </View>
                        ))}
                    </View>

                    <View className="items-center justify-center flex-1">
                        <Text style={{ fontSize: 64 }}>🔥</Text>
                        <Text style={{ color: textColor }} className="text-2xl font-bold mt-2">
                            {days} days
                        </Text>
                    </View>

                    <View className="mt-auto">
                        <Text style={{ color: mutedTextColor }} className="text-sm">
                            Complete a task today to keep your streak going.
                        </Text>
                        <View className="flex-row items-center mt-3">
                            <Text style={{ color: accent }} className="text-base font-semibold">
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
        <View className="h-[280px] mb-6">
            <View
                className="bg-secondary rounded-[30px] h-full overflow-hidden"
                style={shadowPresets.large}
            >
                <LinearGradient
                    colors={["#141414", "#2B2B2B"]}
                    style={{ width: cardWidth, height: "100%" }}
                >
                    <View className="w-full h-full p-8 justify-between">
                        <View className="flex-row items-center justify-between">
                            <Text className="text-white text-lg font-semibold">{title}</Text>
                            <View className="bg-white/10 rounded-full px-3 py-1">
                                <Text className="text-white text-xs uppercase tracking-wider">
                                    Leaderboard
                                </Text>
                            </View>
                        </View>

                        <View>
                            <Text className="text-white/60 text-sm uppercase">
                                {subtitle}
                            </Text>
                            <Animated.View style={[pulseStyle, { alignSelf: "flex-start" }]}>
                                <Text className="text-white text-6xl font-bold">
                                    #{rank}
                                </Text>
                            </Animated.View>
                            {total !== undefined && (
                                <Text className="text-white/60 text-sm">
                                    of {total}
                                </Text>
                            )}
                        </View>

                        <View className="flex-row items-center justify-between">
                            <View className="flex-row items-center gap-2">
                                <AntDesign name="trophy" size={18} color={colors.highlight} />
                                <Text className="text-white text-sm">Climbing this week</Text>
                            </View>
                            <Feather name="chevron-right" size={22} color="white" />
                        </View>
                    </View>
                </LinearGradient>
            </View>
        </View>
    );
};
