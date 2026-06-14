import { View, ImageBackground } from 'react-native';
import Header from '@/components/Header';
import React from 'react';
import BottomBar from '@/components/BottomBar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function VideoCardScreen() {
    const insets = useSafeAreaInsets();
    return (
        <>
            <Header showBackButton />
            <ImageBackground 
            style={{ paddingBottom: insets.bottom, flex: 1, alignContent: 'flex-end', justifyContent: 'flex-end' }} 
            source={{ uri: 'https://images.unsplash.com/photo-1511860810434-a92f84c6f01e?q=80&w=2592&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }} className='flex-1'>
                    <CameraButton />
                    <BottomBar />

            </ImageBackground>
        </>
    );
}

const CameraButton = () => {
    return (
        <View className='w-20 h-20 p-2 mx-auto rounded-full border border-white items-center justify-center'>
            <View 
            style={{
                elevation: 10,
                shadowColor: 'black',
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.3,
                shadowRadius: 10,
            }}
            className='w-full h-full rounded-full bg-white  items-center justify-center' />
        </View>
    );
}



