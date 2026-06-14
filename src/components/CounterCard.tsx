import { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import useThemeColors from '@/contexts/ThemeColors';

const TODAY_VALUE = 1495;
const YESTERDAY_VALUE = 1375;
const ANIMATION_DURATION_MS = 500;

const formatCurrency = (value: number) => {
    return `$${value.toLocaleString()}.00`;
};

export default function CounterCard() {
    const colors = useThemeColors();
    const [activeTab, setActiveTab] = useState('today');

    const [displayValue, setDisplayValue] = useState(TODAY_VALUE);

    const animationRef = useRef<number | null>(null);
    const startTimeRef = useRef<number>(0);
    const displayValueRef = useRef<number>(TODAY_VALUE);

    useEffect(() => {
        const startValue = displayValueRef.current;
        const targetValue = activeTab === 'today' ? TODAY_VALUE : YESTERDAY_VALUE;

        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
        }

        const animateValue = (timestamp: number) => {
            if (!startTimeRef.current) {
                startTimeRef.current = timestamp;
            }

            const elapsed = timestamp - startTimeRef.current;
            const progress = Math.min(elapsed / ANIMATION_DURATION_MS, 1);
            const currentValue = startValue + progress * (targetValue - startValue);
            const nextValue = Math.floor(currentValue);
            displayValueRef.current = nextValue;
            setDisplayValue(nextValue);

            if (progress < 1) {
                animationRef.current = requestAnimationFrame(animateValue);
            } else {
                displayValueRef.current = targetValue;
                setDisplayValue(targetValue);
                animationRef.current = null;
                startTimeRef.current = 0;
            }
        };

        animationRef.current = requestAnimationFrame(animateValue);

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [activeTab]);

    const percentageChange = activeTab === 'today' ? '+14.5%' : '+12.3%';

    const formattedValue = formatCurrency(displayValue);

    return (
        <View
            className='rounded-2xl bg-secondary overflow-hidden '>
            <View className='w-full p-5'>
                <View className='flex-row justify-between gap-2 mb-20'>
                    <View className='flex-row border border-border items-center bg-background p-1 rounded-lg'>
                        <Chip
                            title='Today'
                            isActive={activeTab === 'today'}
                            onPress={() => setActiveTab('today')}
                        />
                        <Chip
                            title='Yesterday'
                            isActive={activeTab === 'yesterday'}
                            onPress={() => setActiveTab('yesterday')}
                        />
                    </View>
                    <Feather name='more-vertical' size={20} color={colors.icon} />
                </View>
                <View className='flex-row justify-between'>
                    <View>
                        <Text className='text-text text-sm opacity-50'>Total sales</Text>
                        <View className='flex-row items-center w-full justify-between'>
                            <Text className='text-text text-3xl font-bold w-[150px]'>
                                {formattedValue}
                            </Text>
                            <View className='px-2 py-1 bg-sky-500/20 border border-sky-500/20 rounded-md ml-2'>
                                <Text className='text-sky-500 text-sm font-semibold'>{percentageChange}</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </View>
            <View className='flex-row justify-between px-5 py-3 border-t border-border bg-black/10'>
                <Text className='text-text text-sm opacity-50 flex-1'>This is just a fun card.</Text>
                <View className='flex-row items-center gap-4 opacity-50'>
                    <Feather name='chevron-right' size={20} color={colors.icon} />
                </View>
            </View>
        </View>
    );
}

const Chip = ({ title, isActive, onPress }: { title: string; isActive: boolean; onPress: () => void }) => {
    return (
        <Pressable
            className={`rounded-md px-3 py-1 ${isActive ? 'bg-secondary' : ''}`}
            onPress={onPress}
        >
            <Text className={`text-text text-xs ${isActive ? 'text-text' : ''}`}>{title}</Text>
        </Pressable>
    );
}
