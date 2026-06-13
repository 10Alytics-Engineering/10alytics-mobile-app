import { Stack } from "expo-router";

export default function ScreensLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="course/[id]" />
            <Stack.Screen name="catalog/[id]" />
            <Stack.Screen name="classroom/assignment/[assignmentId]" />
            <Stack.Screen name="classroom/capstone/[assignmentId]" />
            <Stack.Screen name="classroom/resource/[resourceId]" />
            <Stack.Screen name="billing" />
            <Stack.Screen name="notification-preferences" />
            <Stack.Screen name="edit-profile" />
        </Stack>
    );
}
