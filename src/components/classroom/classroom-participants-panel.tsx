import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View } from "react-native";

import {
  getClassroomPersonName,
  useClassroomPeople,
} from "@/hooks/use-classroom";
import type { ClassroomPerson } from "@/lib/api-client";

const ACCENT = "#DA6728";
const ACCENT_SOFT = "rgba(218, 103, 40, 0.12)";

function PersonRow({ person }: { person: ClassroomPerson }) {
  const name = getClassroomPersonName(person);
  const initial = name.charAt(0).toUpperCase();
  const role = person.role?.trim();

  return (
    <View className="flex-row items-center rounded-xl bg-background px-3 py-3">
      <View
        className="h-11 w-11 items-center justify-center rounded-full"
        style={{ backgroundColor: ACCENT_SOFT }}
      >
        <Text className="font-outfit-bold text-base" style={{ color: ACCENT }}>
          {initial}
        </Text>
      </View>
      <View className="ml-3 flex-1">
        <Text className="font-outfit-bold text-sm text-text">{name}</Text>
        {person.email ? (
          <Text className="mt-0.5 text-xs text-text opacity-60" numberOfLines={1}>
            {person.email}
          </Text>
        ) : null}
      </View>
      {role ? (
        <View className="rounded-md px-2.5 py-1" style={{ backgroundColor: ACCENT_SOFT }}>
          <Text className="text-xs font-semibold capitalize" style={{ color: ACCENT }}>
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
  if (people.length === 0) return null;

  return (
    <View className="gap-2">
      <Text className="font-outfit-bold text-base text-text">{title}</Text>
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
  const { data, isLoading, isError, refetch } = useClassroomPeople(classroomId);
  const waitingForSession = sessionLoading || classroomId == null;
  const instructors = data?.instructors ?? [];
  const students = data?.students ?? [];
  const total = instructors.length + students.length;

  return (
    <View className="gap-4">
      <View className="flex-row items-center justify-between">
        <Text className="font-outfit-bold text-xl text-text">Participants</Text>
        {total > 0 ? (
          <View className="flex-row items-center gap-1.5">
            <Ionicons name="people-outline" size={16} color={ACCENT} />
            <Text className="text-sm font-semibold" style={{ color: ACCENT }}>
              {total}
            </Text>
          </View>
        ) : null}
      </View>

      {waitingForSession || isLoading || isError ? (
        <Pressable
          onPress={() => refetch()}
          disabled={waitingForSession}
          className="rounded-2xl border border-border bg-secondary/40 p-5"
        >
          <Text className="text-center font-semibold text-text">
            {waitingForSession || isLoading
              ? "Loading participants..."
              : "Unable to load participants. Tap to retry."}
          </Text>
        </Pressable>
      ) : null}

      {!waitingForSession && !isLoading && !isError && total === 0 ? (
        <View className="rounded-2xl border border-border bg-secondary/40 p-5">
          <Text className="text-center font-semibold text-text">
            No participants found for this classroom yet.
          </Text>
        </View>
      ) : null}

      {!waitingForSession && !isLoading && !isError && total > 0 ? (
        <View className="gap-5 rounded-2xl border border-border bg-secondary/40 p-4">
          <PeopleSection title="Instructors" people={instructors} />
          <PeopleSection title="Students" people={students} />
        </View>
      ) : null}
    </View>
  );
}
