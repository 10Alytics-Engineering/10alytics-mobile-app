import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View } from "react-native";

import useThemeColors from "@/contexts/ThemeColors";
import {
  getClassroomPersonName,
  useClassroomPeople,
} from "@/hooks/use-classroom";
import type { ClassroomPerson } from "@/lib/api-client";

const ACCENT = "#DA6728";
const ACCENT_SOFT = "rgba(218, 103, 40, 0.12)";

function PersonRow({ person }: { person: ClassroomPerson }) {
  const colors = useThemeColors();
  const name = getClassroomPersonName(person);
  const initial = name.charAt(0).toUpperCase();
  const role = person.role?.trim();

  return (
    <View style={{ flexDirection: "row", alignItems: "center", borderRadius: 12, backgroundColor: colors.bg, paddingHorizontal: 12, paddingVertical: 12 }}>
      <View
        style={{ height: 44, width: 44, alignItems: "center", justifyContent: "center", borderRadius: 9999, backgroundColor: ACCENT_SOFT }}
      >
        <Text style={{ fontWeight: "700", fontSize: 16, color: ACCENT }}>
          {initial}
        </Text>
      </View>
      <View style={{ marginLeft: 12, flex: 1 }}>
        <Text style={{ fontWeight: "700", fontSize: 14, color: colors.text }}>{name}</Text>
        {person.email ? (
          <Text style={{ marginTop: 2, fontSize: 12, color: colors.text, opacity: 0.6 }} numberOfLines={1}>
            {person.email}
          </Text>
        ) : null}
      </View>
      {role ? (
        <View style={{ borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4, backgroundColor: ACCENT_SOFT }}>
          <Text style={{ fontSize: 12, fontWeight: "600", textTransform: "capitalize", color: ACCENT }}>
            {role.replace(/_/g, " ")}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function PeopleSection({
  title,
  people,
}: {
  title: string;
  people: ClassroomPerson[];
}) {
  const colors = useThemeColors();
  if (people.length === 0) return null;

  return (
    <View style={{ gap: 8 }}>
      <Text style={{ fontWeight: "700", fontSize: 16, color: colors.text }}>{title}</Text>
      {people.map((person) => (
        <PersonRow key={String(person.id)} person={person} />
      ))}
    </View>
  );
}

export function ClassroomParticipantsPanel({
  classroomId,
  sessionLoading = false,
}: {
  classroomId?: number | string;
  sessionLoading?: boolean;
}) {
  const colors = useThemeColors();
  const { data, isLoading, isError, refetch } = useClassroomPeople(classroomId);
  const waitingForSession = sessionLoading || classroomId == null;
  const instructors = data?.instructors ?? [];
  const students = data?.students ?? [];
  const total = instructors.length + students.length;

  const cardStyle = {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.secondary,
    padding: 20,
  } as const;

  return (
    <View style={{ gap: 16 }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Text style={{ fontWeight: "700", fontSize: 20, color: colors.text }}>Participants</Text>
        {total > 0 ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Ionicons name="people-outline" size={16} color={ACCENT} />
            <Text style={{ fontSize: 14, fontWeight: "600", color: ACCENT }}>
              {total}
            </Text>
          </View>
        ) : null}
      </View>

      {waitingForSession || isLoading || isError ? (
        <Pressable
          onPress={() => refetch()}
          disabled={waitingForSession}
          style={cardStyle}
        >
          <Text style={{ textAlign: "center", fontWeight: "600", color: colors.text }}>
            {waitingForSession || isLoading
              ? "Loading participants..."
              : "Unable to load participants. Tap to retry."}
          </Text>
        </Pressable>
      ) : null}

      {!waitingForSession && !isLoading && !isError && total === 0 ? (
        <View style={cardStyle}>
          <Text style={{ textAlign: "center", fontWeight: "600", color: colors.text }}>
            No participants found for this classroom yet.
          </Text>
        </View>
      ) : null}

      {!waitingForSession && !isLoading && !isError && total > 0 ? (
        <View style={{ gap: 20, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.secondary, padding: 16 }}>
          <PeopleSection title="Instructors" people={instructors} />
          <PeopleSection title="Students" people={students} />
        </View>
      ) : null}
    </View>
  );
}
