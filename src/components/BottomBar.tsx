import { View, Text, Pressable, Animated, Easing } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { Feather as FeatherIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import React, { useState } from 'react';
import { shadowPresets } from "@/utils/useShadow";

type FeatherIconName = keyof typeof FeatherIcons.glyphMap;

interface BottomBarProps {
    showBackButton?: boolean;
    title?: string;
    hasAvatar?: boolean;
}

export default function BottomBar({ showBackButton = false, title = '', hasAvatar = false }: BottomBarProps) {
    const [activeItem, setActiveItem] = useState<FeatherIconName>('camera');

    const handleItemPress = (iconName: FeatherIconName) => {
        setActiveItem(iconName);
    };

    return (
        <View className='p-4 flex-row items-center justify-center'>
            <View
                style={shadowPresets.card}
                className='rounded-full border border-white/20 '>
                <BlurView tint='dark' intensity={10} className='flex-row py-1.5 px-1 w-[300px] overflow-hidden rounded-full items-center justify-between bg-black/50'>
                    <BottomBarItem
                        icon='camera'
                        title='Photo'
                        isActive={activeItem === 'camera'}
                        onPress={() => handleItemPress('camera')}
                    />
                    <BottomBarItem
                        icon="video"
                        title='Video'
                        isActive={activeItem === 'video'}
                        onPress={() => handleItemPress('video')}
                    />
                    <BottomBarItem
                        icon='user'
                        title='Portrait'
                        isActive={activeItem === 'user'}
                        onPress={() => handleItemPress('user')}
                    />
                    <BottomBarItem
                        icon="moon"
                        title='Night'
                        isActive={activeItem === 'moon'}
                        onPress={() => handleItemPress('moon')}
                    />
                    <BottomBarItem
                        icon="clock"
                        title='Timer'
                        isActive={activeItem === 'clock'}
                        onPress={() => handleItemPress('clock')}
                    />
                </BlurView>
            </View>
        </View>
    );
}

interface BottomBarItemProps {
    icon: FeatherIconName;
    title: string;
    isActive: boolean;
    onPress: () => void;
}

const BottomBarItem = ({ icon, title, isActive, onPress }: BottomBarItemProps) => {
    const [widthAnim] = useState(() => new Animated.Value(isActive ? 100 : 40));
    const [textOpacityAnim] = useState(() => new Animated.Value(isActive ? 1 : 0));

    React.useEffect(() => {
        Animated.parallel([
            Animated.timing(widthAnim, {
                toValue: isActive ? 100 : 40,
                duration: 400,
                easing: isActive
                    ? Easing.bezier(0.1, 1, 0.94, 1) // expand
                    : Easing.bezier(0.1, 1, 0.94, 1),
                useNativeDriver: false,
            }),
            Animated.timing(textOpacityAnim, {
                toValue: isActive ? 1 : 0,
                duration: 200,
                // easing: isActive 
                //     ? Easing.bezier(0.0, 0.0, 0.2, 1)
                //     : Easing.bezier(0.4, 0.0, 1, 1),
                useNativeDriver: true,
            })
        ]).start();
    }, [isActive, widthAnim, textOpacityAnim]);

    return (
        <Pressable
            onPress={onPress}
            className={`flex-row items-center rounded-full transition-all duration-300 ${isActive ? 'bg-black/40' : 'bg-black/0'} mx-[2px] overflow-hidden`}
        >
            <Animated.View className="items-center flex-row" style={{ width: widthAnim }}>
                <View className="w-[40px] h-[40px] items-center justify-center">
                    <Feather name={icon} size={15} color="white" />
                </View>
                <Animated.View style={{
                    opacity: textOpacityAnim,
                    transform: [{
                        translateX: textOpacityAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [-10, 0]
                        })
                    }]
                }}>
                    <Text
                        className='text-center items-center justify-center whitespace-nowrap flex-shrink-0 text-white text-xs'
                        numberOfLines={1}
                    >
                        {title}
                    </Text>
                </Animated.View>
            </Animated.View>
        </Pressable>
    );
}
