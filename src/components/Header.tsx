import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, Text, Pressable, Image } from 'react-native';
import { useRouter } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
import ThemeToggle from './ThemeToggle';
import useThemeColors from '@/contexts/ThemeColors';
import SlideUp from './SlideUp';
import { useState } from 'react';
import React from 'react';
import { useAuthStore } from '@/utils/auth-store';

interface HeaderProps {
    showBackButton?: boolean;
    title?: string;
    hasAvatar?: boolean;
}

export default function Header({ showBackButton = false, title = '', hasAvatar = false, }: HeaderProps) {
    const colors = useThemeColors();
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const [showSlideUp, setShowSlideUp] = useState(false);
    const { user } = useAuthStore();
    const avatarSource = user?.avatar ? { uri: user.avatar } : require('@/assets/img/thomino.jpg');
    const name = user?.first_name ? `${user.first_name} ${user.other_names}` : 'User';
    return (
        <>
            <View
                style={{
                    paddingHorizontal: 20,
                    paddingVertical: 24,
                    flexDirection: "row",
                    backgroundColor: colors.bg,
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingTop: insets.top + 10,
                }}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                    {showBackButton && (
                        <Pressable
                            onPress={() => router.back()}
                            style={{ marginRight: 12, padding: 4 }}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <Feather name="arrow-left" color={colors.icon} size={24} />
                        </Pressable>
                    )}
                    {hasAvatar && (
                        <Pressable onPress={() => setShowSlideUp(true)}>
                            <Image source={avatarSource} style={{ width: 32, height: 32, borderRadius: 9999 }} />
                        </Pressable>
                    )}
                    {title && (
                        <Text style={{ color: colors.text, fontSize: 24, fontWeight: "700" }}>{title}</Text>
                    )}
                </View>
                <ThemeToggle />
            </View>
            <SlideUp visible={showSlideUp} onClose={() => setShowSlideUp(false)} avatarSource={avatarSource} name={name} />
        </>
    );
}
