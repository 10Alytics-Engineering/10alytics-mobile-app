import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, Text, Pressable, Image } from 'react-native';
import { useRouter } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
import ThemeToggle from './theme-toggle';
import useThemeColors from '@/contexts/theme-colors';
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
            <View className=' px-5 py-6 flex-row bg-background items-center justify-between ' style={{ paddingTop: insets.top + 10 }}>
                <View className="flex-row items-center">
                    {showBackButton && (
                        <Pressable
                            onPress={() => router.back()}
                            className="mr-3 p-1"
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <Feather name="arrow-left" color={colors.icon} size={24} />
                        </Pressable>
                    )}
                    {hasAvatar && (
                        <Pressable onPress={() => setShowSlideUp(true)}>
                            <Image source={avatarSource} className='w-8 h-8 rounded-full' />
                        </Pressable>
                    )}
                    {title && (
                        <Text className="text-text text-2xl font-bold">{title}</Text>
                    )}
                </View>
                <ThemeToggle />
            </View>
            <SlideUp visible={showSlideUp} onClose={() => setShowSlideUp(false)} avatarSource={avatarSource} name={name} />
        </>
    );
}
