import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

const ACCENT = "#DA6728";
const BLUE = "#2F6FED";
const GREEN = "#1BA372";
const RED = "#D7263D";

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

type EventKind = "live" | "assignment" | "quiz";

type Event = {
  id: string;
  kind: EventKind;
  monthLabel: string;
  day: number;
  title: string;
  meta: string;
  cta?: string;
};

const EVENTS: Event[] = [
  {
    id: "live-15",
    kind: "live",
    monthLabel: "JAN",
    day: 15,
    title: "Live Class",
    meta: "6:00 PM WAT",
    cta: "Join Now",
  },
  {
    id: "assignment-16",
    kind: "assignment",
    monthLabel: "JAN",
    day: 16,
    title: "Assignment",
    meta: "Due date: Jan 16th",
  },
  {
    id: "quiz-16",
    kind: "quiz",
    monthLabel: "JAN",
    day: 16,
    title: "Quiz",
    meta: "Due date: Jan 16th",
  },
];

const KIND_STYLES: Record<
  EventKind,
  { bg: string; monthColor: string }
> = {
  live: { bg: "rgba(47, 111, 237, 0.06)", monthColor: BLUE },
  assignment: { bg: "rgba(27, 163, 114, 0.08)", monthColor: GREEN },
  quiz: { bg: "rgba(215, 38, 61, 0.07)", monthColor: RED },
};

function getWeekDays(reference: Date) {
  const start = new Date(reference);
  start.setDate(reference.getDate() - reference.getDay());
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function ClassroomTimetablePanel() {
  const today = useMemo(() => new Date(), []);
  const [selected, setSelected] = useState<Date>(today);
  const weekDays = useMemo(() => getWeekDays(selected), [selected]);

  return (
    <View className="gap-5">
      <Text className="font-outfit-bold text-xl text-text">Class Timetable</Text>

      <View className="rounded-2xl border border-border bg-secondary/60 p-5">
        <View className="flex-row items-start justify-between">
          <View className="flex-row items-end gap-3">
            <Text
              className="font-outfit-bold text-text"
              style={{ fontSize: 56, lineHeight: 60 }}
            >
              {selected.getDate()}
            </Text>
            <View className="pb-2">
              <Text
                className="text-text opacity-60"
                style={{ fontSize: 14 }}
              >
                {selected.toLocaleDateString("en-US", { weekday: "short" })}
              </Text>
              <Text
                className="text-text opacity-60"
                style={{ fontSize: 14 }}
              >
                {selected.toLocaleDateString("en-US", {
                  month: "short",
                  year: "numeric",
                })}
              </Text>
            </View>
          </View>
          <Pressable
            onPress={() => setSelected(new Date())}
            className="rounded-xl px-4 py-2"
            style={{ backgroundColor: "rgba(27, 163, 114, 0.12)" }}
          >
            <Text className="font-semibold" style={{ color: GREEN }}>
              Today
            </Text>
          </Pressable>
        </View>

        <View className="mt-5 flex-row justify-between">
          {weekDays.map((d) => {
            const isSelected = sameDay(d, selected);
            return (
              <Pressable
                key={d.toISOString()}
                onPress={() => setSelected(d)}
                className="items-center"
                style={{
                  width: 38,
                  paddingVertical: 8,
                  borderRadius: 12,
                  backgroundColor: isSelected ? ACCENT : "transparent",
                }}
              >
                <Text
                  className="text-xs font-semibold"
                  style={{
                    color: isSelected ? "#fff" : undefined,
                    opacity: isSelected ? 1 : 0.55,
                  }}
                >
                  {DAY_LABELS[d.getDay()]}
                </Text>
                <Text
                  className="mt-1 font-outfit-bold"
                  style={{
                    fontSize: 16,
                    color: isSelected ? "#fff" : undefined,
                  }}
                >
                  {d.getDate()}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View>
        <View className="flex-row items-center gap-2">
          <Ionicons name="calendar-outline" size={18} color={ACCENT} />
          <Text className="font-outfit-bold text-base text-text">
            Upcoming Events
          </Text>
        </View>

        <View className="mt-3 gap-3">
          {EVENTS.map((event) => {
            const style = KIND_STYLES[event.kind];
            return (
              <View
                key={event.id}
                className="flex-row items-center rounded-2xl border border-border px-4 py-4"
                style={{ backgroundColor: style.bg }}
              >
                <View className="w-12 items-center">
                  <Text
                    className="font-outfit-bold text-xs"
                    style={{ color: style.monthColor, letterSpacing: 1 }}
                  >
                    {event.monthLabel}
                  </Text>
                  <Text
                    className="font-outfit-bold"
                    style={{ color: style.monthColor, fontSize: 18 }}
                  >
                    {event.day}
                  </Text>
                </View>
                <View className="ml-3 flex-1">
                  <Text className="font-outfit-bold text-base text-text">
                    {event.title}
                  </Text>
                  <Text
                    className="mt-0.5 text-sm text-text opacity-70"
                    style={{ textDecorationLine: "underline" }}
                  >
                    {event.meta}
                  </Text>
                </View>
                {event.cta ? (
                  <Pressable
                    className="rounded-lg border border-border bg-background px-3 py-2"
                  >
                    <Text className="text-sm font-semibold" style={{ color: ACCENT }}>
                      {event.cta}
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}
