import { useLocalSearchParams } from "expo-router";

import { CatalogCourseScreen } from "@/screens/course/catalog-course-screen";

export default function CatalogCourseRoute() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const courseId = Array.isArray(id) ? id[0] : id;
    if (!courseId) {
        return null;
    }
    return <CatalogCourseScreen courseId={courseId} />;
}
