import { Text, View } from "@/tw";
import { useLocalSearchParams } from "expo-router";

export default function CourseDetailScreen() {
    const { id } = useLocalSearchParams();
    return (
        <View>
            <Text className="text-text">Course Detail Screen</Text>
        </View>
    );
}   