import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

import {
  formatClassroomDate,
  formatClassroomTime,
  getCalendarEventTime,
  useClassroomCalendar,
} from "@/hooks/use-classroom";
import type { ClassroomCalendarEvent } from "@/lib/api-client";

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
  at: number;
  title: string;
  meta: string;
  cta?: string;
};

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

export function ClassroomTimetablePanel({
  courseEnrollmentId,
}: {
  courseEnrollmentId?: number | string;
}) {
  const today = useMemo(() => new Date(), []);
  const [selected, setSelected] = useState<Date>(today);
  const weekDays = useMemo(() => getWeekDays(selected), [selected]);
  const { data: rows = [], isLoading, isError, refetch } =
    useClassroomCalendar(courseEnrollmentId);

  const eventsForSelectedDay = useMemo(() => {
    const mapped = Array.isArray(rows) ? rows.map(mapCalendarEvent) : [];
    return mapped
      .filter((event) => sameDay(new Date(event.at), selected))
      .sort((a, b) => a.at - b.at);
  }, [rows, selected]);

  const upcomingEvents = useMemo(() => {
    const now = today.getTime();
    const mapped = Array.isArray(rows) ? rows.map(mapCalendarEvent) : [];
    return mapped
      .filter((event) => event.at >= now)
      .sort((a, b) => a.at - b.at);
  }, [rows, today]);

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
            {sameDay(selected, today) ? "Upcoming Events" : "Events"}
          </Text>
          {!sameDay(selected, today) ? (
            <Text className="text-sm text-text opacity-60">
              {selected.toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </Text>
          ) : null}
        </View>

        <View className="mt-3 gap-3">
          {isLoading || isError ? (
            <Pressable
              onPress={() => refetch()}
              className="rounded-2xl border border-border px-4 py-4"
            >
              <Text className="text-center font-semibold text-text">
                {isLoading ? "Loading events..." : "Unable to load events. Tap to retry."}
              </Text>
            </Pressable>
          ) : null}

          {!isLoading && !isError ? (
            (sameDay(selected, today) ? upcomingEvents : eventsForSelectedDay).length ===
            0 ? (
              <View className="rounded-2xl border border-border px-4 py-4">
                <Text className="text-center font-semibold text-text">
                  {sameDay(selected, today)
                    ? "No upcoming events."
                    : "No events on this day."}
                </Text>
              </View>
            ) : null
          ) : null}

          {(sameDay(selected, today) ? upcomingEvents : eventsForSelectedDay).map((event) => {
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

function mapCalendarEvent(row: ClassroomCalendarEvent): Event {
  const dateValue = getCalendarEventTime(row);
  const date = dateValue ? new Date(dateValue) : new Date();
  const safeDate = Number.isNaN(date.getTime()) ? new Date() : date;
  const isLive = row.type === "live_session";
  return {
    id: String(row.id),
    kind: isLive ? "live" : "assignment",
    monthLabel: safeDate.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
    day: safeDate.getDate(),
    at: safeDate.getTime(),
    title: row.title ?? (isLive ? "Live Class" : "Assignment Deadline"),
    meta: isLive
      ? formatClassroomTime(row.starts_at)
      : `Due date: ${formatClassroomDate(dateValue)}`,
    cta: row.google_meet_link ? "Join Now" : undefined,
  };
}
