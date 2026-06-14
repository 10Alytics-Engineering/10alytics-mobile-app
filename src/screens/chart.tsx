import { View, ScrollView, Pressable, Animated, Text } from 'react-native';
import Header from '@/components/Header';
import React, { useEffect, useRef, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import Feather from '@expo/vector-icons/Feather';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useThemeColors from '@/contexts/ThemeColors';

export default function JournalCardsScreen() {
    const insets = useSafeAreaInsets();
    const [currentDataIndex, setCurrentDataIndex] = useState(0);

    return (
        <>
            <Header showBackButton />

            <ScrollView className='flex-1 bg-background p-2' style={{ paddingTop: insets.top + 0 }}>
                <Counter currentDataIndex={currentDataIndex} setCurrentDataIndex={setCurrentDataIndex} />
                <Chart currentDataIndex={currentDataIndex} />
            </ScrollView>
        </>
    );
}


const Chart = ({ currentDataIndex }: { currentDataIndex: number }) => {
    const dataSets = [
        [45, 67, 23, 89, 34, 78, 56, 90, 12, 65, 43, 87, 29, 71, 54],
        [32, 78, 45, 67, 89, 23, 76, 54, 91, 38, 82, 19, 63, 47, 85],
        [67, 34, 89, 12, 56, 94, 27, 73, 48, 86, 31, 69, 52, 88, 41]
    ];

    const currentData = dataSets[currentDataIndex % dataSets.length];
    const maxValue = Math.max(...currentData);
    const maxBarHeight = 150;

    const yAxisLabels = [0, 25, 50, 75, 100];

    return (
        <View className='mx-global mb-8 bg-background'>
            <View className="flex-row">
                <View className="mr-3" style={{ height: maxBarHeight + 20 }}>
                    {[...yAxisLabels].reverse().map((label) => (
                        <View
                            key={label}
                            className="flex-1 justify-center"
                            style={{ height: (maxBarHeight + 20) / yAxisLabels.length }}
                        >
                            <Text className="text-xs text-neutral-400 text-right">
                                {label}
                            </Text>
                        </View>
                    ))}
                </View>

                <View className="flex-1">
                    <View className='flex-row items-end justify-between' style={{ height: maxBarHeight }}>
                        {currentData.map((value, index) => (
                            <ChartBar
                                key={index}
                                height={(value / maxValue) * maxBarHeight}
                                dataIndex={currentDataIndex}
                            />
                        ))}
                    </View>
                </View>
            </View>
        </View>
    );
};

const ChartBar = ({ height, dataIndex }: { height: number; dataIndex: number }) => {
    const [animatedHeight] = useState(() => new Animated.Value(0));

    useEffect(() => {
        Animated.timing(animatedHeight, {
            toValue: height,
            duration: 500,
            //easing: Easing.bezier(0.1, 1, 0.94, 1),
            useNativeDriver: false,
        }).start();
    }, [height, dataIndex, animatedHeight]);

    return (
        <View className="flex-1 items-center mx-0.5 bg-red-500">
            <Animated.View
                style={{ height: animatedHeight, minHeight: 2 }}
                className='w-full bg-rose-500 rounded-t-sm'
            >
                <LinearGradient
                    colors={['#FF2056', '#FF637E']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={{ flex: 1 }}
                />

            </Animated.View>
        </View>
    );
};


const Counter = ({ currentDataIndex, setCurrentDataIndex }: { currentDataIndex: number; setCurrentDataIndex: (index: number) => void }) => {
    const colors = useThemeColors();
    const [currentMonthIndex, setCurrentMonthIndex] = useState(0);
    const [fadeAnim] = useState(() => new Animated.Value(1));
    const [countAnim] = useState(() => new Animated.Value(0));

    const monthsData = [
        { month: 'this month', amount: 10201 },
        { month: 'in April', amount: 8750 },
        { month: 'in March', amount: 12340 },
        { month: 'in February', amount: 9680 },
        { month: 'in January', amount: 11520 },
        { month: 'in December', amount: 15200 },
    ];

    const currentData = monthsData[currentMonthIndex];
    const [displayAmount, setDisplayAmount] = useState(currentData.amount);
    const previousAmountRef = useRef(currentData.amount);

    useEffect(() => {
        // Animate number counting
        const startValue = previousAmountRef.current;
        const endValue = currentData.amount;
        previousAmountRef.current = endValue;

        countAnim.setValue(0);

        const listener = countAnim.addListener(({ value }) => {
            const currentAmount = Math.round(startValue + (endValue - startValue) * value);
            setDisplayAmount(currentAmount);
        });

        Animated.timing(countAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: false,
        }).start();

        return () => {
            countAnim.removeListener(listener);
        };
    }, [countAnim, currentData.amount]);

    const animateTransition = (callback: () => void) => {
        Animated.sequence([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start();

        setTimeout(callback, 200);
    };

    const goToPrevious = () => {
        if (currentMonthIndex < monthsData.length - 1) {
            animateTransition(() => {
                setCurrentMonthIndex(currentMonthIndex + 1);
                setCurrentDataIndex(currentDataIndex + 1);
            });
        }
    };

    const goToNext = () => {
        if (currentMonthIndex > 0) {
            animateTransition(() => {
                setCurrentMonthIndex(currentMonthIndex - 1);
                setCurrentDataIndex(currentDataIndex - 1);
            });
        }
    };

    return (
        <View className='mt-6 mb-20 px-global'>
            <Text className='text-5xl font-semibold text-text'>You&apos;ve made</Text>
            <Text className='text-5xl text-rose-500 font-semibold'>
                ${displayAmount.toLocaleString()}
            </Text>
            <View className='flex-row items-center justify-between'>
                <Animated.View style={{ opacity: fadeAnim }}>
                    <Text className='text-5xl font-semibold text-text'>{currentData.month}</Text>
                </Animated.View>
                <View className='flex-row items-center justify-center'>
                    <Pressable
                        onPress={goToPrevious}
                        className={`w-10 h-10 items-center justify-center mr-2 rounded-full border border-neutral-300 ${currentMonthIndex >= monthsData.length - 1 ? 'opacity-30' : 'opacity-100'
                            }`}
                        disabled={currentMonthIndex >= monthsData.length - 1}
                    >
                        <Feather name='chevron-left' size={20} color={colors.icon} />
                    </Pressable>
                    <Pressable
                        onPress={goToNext}
                        className={`w-10 h-10 items-center justify-center rounded-full border border-neutral-300 ${currentMonthIndex <= 0 ? 'opacity-30' : 'opacity-100'
                            }`}
                        disabled={currentMonthIndex <= 0}
                    >
                        <Feather name='chevron-right' size={20} color={colors.icon} />
                    </Pressable>
                </View>
            </View>
            <Text className='text-lg text-text'>Upcoming <Text className='text-lg font-semibold text-text'>$3,201</Text></Text>
        </View>
    );
};

