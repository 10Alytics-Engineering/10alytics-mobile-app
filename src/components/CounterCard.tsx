import { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import useThemeColors from '@/contexts/theme-colors';

const formatCurrency = (value: number) => {
    return `$${value.toLocaleString()}.00`;
};

export default function CounterCard() {
    const colors = useThemeColors();
    const [activeTab, setActiveTab] = useState('today');

    const todayValue = 1495;
    const yesterdayValue = 1375;

    const [displayValue, setDisplayValue] = useState(todayValue);

    const animationRef = useRef<number | null>(null);
    const startTimeRef = useRef<number>(0);
    const startValueRef = useRef<number>(todayValue);

    const duration = 500;

    const animateValue = (timestamp: number) => {
        if (!startTimeRef.current) {
            startTimeRef.current = timestamp;
        }

        const elapsed = timestamp - startTimeRef.current;
        const progress = Math.min(elapsed / duration, 1);

        const targetValue = activeTab === 'today' ? todayValue : yesterdayValue;
        const startValue = startValueRef.current;

        const currentValue = startValue + progress * (targetValue - startValue);
        setDisplayValue(Math.floor(currentValue));

        if (progress < 1) {
            animationRef.current = requestAnimationFrame(animateValue);
        } else {
            setDisplayValue(targetValue);
            animationRef.current = null;
            startTimeRef.current = 0;
        }
    };

    useEffect(() => {
        startValueRef.current = displayValue;

        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
        }

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