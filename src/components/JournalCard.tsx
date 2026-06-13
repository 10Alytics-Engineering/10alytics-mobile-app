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
            style={[shadowPresets.large, { backgroundColor: colors.secondary, overflow: 'hidden', marginBottom: 24, borderRadius: 16 }]}
        >
            <View style={{ flexDirection: 'row', padding: 20, gap: 16 }}>
                {hasMedia && (
                    <View style={{ height: 96, width: 96, backgroundColor: '#DA6728', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: 16 }}>
                        {cover != null ? (
                            cover
                        ) : (
                            <Image
                                source={resolvedImageSource!}
                                style={{ height: '100%', width: '100%' }}
                                resizeMode="cover"
                            />
                        )}
                    </View>
                )}
                <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5, color: muted }}>
                        {date}
                    </Text>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.text, marginTop: 4 }}>
                        {title}
                    </Text>
                    <Text style={{ fontSize: 14, marginTop: 4, color: muted }} numberOfLines={2}>
                        {description}
                    </Text>

                    {typeof progress === 'number' && (
                        <View style={{ marginTop: 12 }}>
                            <View
                                style={{ height: 8, borderRadius: 9999, overflow: 'hidden', backgroundColor: colors.isDark ? '#2A2A2A' : '#E6E6E6' }}
                            >
                                <View
                                    style={{
                                        width: `${Math.max(0, Math.min(100, progress))}%`,
                                        backgroundColor: colors.highlight,
                                        height: '100%',
                                    }}
                                />
                            </View>
                            <Text style={{ fontSize: 12, marginTop: 8, color: muted }}>
                                {progress}% complete
                            </Text>
                        </View>
                    )}

                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, width: '100%' }}>
                        <Pressable
                            onPress={onPress}
                            style={{ borderRadius: 12, paddingHorizontal: 16, paddingVertical: 8, width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary }}
                        >
                            <Text style={{ color: '#fff', fontWeight: '600', fontSize: 14, textAlign: 'center' }}>{actionLabel}</Text>
                            <Feather name='chevron-right' size={18} color="white" />
                        </Pressable>
                    </View>
                </View>
            </View>
        </Pressable>
    );
}
