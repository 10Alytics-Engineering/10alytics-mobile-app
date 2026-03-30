import { useLocalSearchParams } from "expo-router";

import { CourseDetailScreen } from "@/screens/course/course-detail-screen";

export default function CourseDetailRoute() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const courseId = Array.isArray(id) ? id[0] : id;
    if (!courseId) {
        return null;
    }
    return <CourseDetailScreen courseId={courseId} />;
}
