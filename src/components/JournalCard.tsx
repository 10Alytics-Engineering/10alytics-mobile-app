import { View, Text, Pressable, Image, ImageSourcePropType } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import useThemeColors from '@/contexts/ThemeColors';
import { shadowPresets } from "@/utils/useShadow";
import React from 'react';

interface JournalCardProps {
    title: string;
    imageUrl?: string;
    image?: ImageSourcePropType;
    /** Local SVG / custom thumbnail (e.g. from react-native-svg). Takes precedence over image/imageUrl. */
    cover?: React.ReactNode;
    description: string;
    date?: string;
    progress?: number;
    actionLabel?: string;
    onPress?: () => void;
}

export default function JournalCard({
    title,
    imageUrl,
    image,
    cover,
    description,
    date = 'Wednesday, Feb 5',
    progress,
    actionLabel = 'Continue',
    onPress,
}: JournalCardProps) {
    const colors = useThemeColors();
    const muted = colors.isDark ? 'rgba(255,255,255,0.65)' : 'rgba(17,17,17,0.6)';
    const resolvedImageSource = image ?? (imageUrl ? { uri: imageUrl } : undefined);
    const hasMedia = cover != null || resolvedImageSource != null;

    return (
        <Pressable
            onPress={onPress}
            style={shadowPresets.large}
            className='bg-secondary overflow-hidden mb-global rounded-2xl'
        >
            <View className="flex-row p-5 gap-4">
                {hasMedia && (
                    <View className="h-[96px] w-[96px] items-center justify-center overflow-hidden rounded-2xl">
                        {cover != null ? (
                            cover
                        ) : (
                            <Image
                                source={resolvedImageSource!}
                                className="h-full w-full"
                                resizeMode="cover"
                            />
                        )}
                    </View>
                )}
                <View className="flex-1">
                    <Text className="text-xs uppercase tracking-wider" style={{ color: muted }}>
                        {date}
                    </Text>
                    <Text className="text-lg font-bold text-text mt-1">
                        {title}
                    </Text>
                    <Text className="text-sm mt-1" style={{ color: muted }} numberOfLines={2}>
                        {description}
                    </Text>

                    {typeof progress === 'number' && (
                        <View className="mt-3">
                            <View
                                className="h-2 rounded-full overflow-hidden"
                                style={{ backgroundColor: colors.isDark ? '#2A2A2A' : '#E6E6E6' }}
                            >
                                <View
                                    style={{
                                        width: `${Math.max(0, Math.min(100, progress))}%`,
                                        backgroundColor: colors.highlight,
                                        height: '100%',
                                    }}
                                />
                            </View>
                            <Text className="text-xs mt-2" style={{ color: muted }}>
                                {progress}% complete
                            </Text>
                        </View>
                    )}

                    <View className="flex-row items-center justify-between mt-4">
                        <Pressable className="bg-text rounded-xl px-4 py-2">
                            <Text className="text-invert font-semibold text-sm">{actionLabel}</Text>
                        </Pressable>
                        <Feather name='chevron-right' size={18} color={colors.icon} />
                    </View>
                </View>
            </View>
        </Pressable>
    );
}
