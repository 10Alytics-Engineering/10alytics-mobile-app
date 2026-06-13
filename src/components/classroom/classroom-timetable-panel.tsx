import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

import useThemeColors from "@/contexts/ThemeColors";
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
  const colors = useThemeColors();
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
    const now = Date.now();
    const mapped = Array.isArray(rows) ? rows.map(mapCalendarEvent) : [];
    return mapped
      .filter((event) => event.at >= now)
      .sort((a, b) => a.at - b.at);
  }, [rows]);

  return (
    <View style={{ gap: 20 }}>
      <Text style={{ fontWeight: "700", fontSize: 20, color: colors.text }}>Class Timetable</Text>

      <View style={{ borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.secondary, padding: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" }}>
          <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 12 }}>
            <Text style={{ fontWeight: "700", color: colors.text, fontSize: 56, lineHeight: 60 }}>
              {selected.getDate()}
            </Text>
            <View style={{ paddingBottom: 8 }}>
              <Text style={{ color: colors.text, opacity: 0.6, fontSize: 14 }}>
                {selected.toLocaleDateString("en-US", { weekday: "short" })}
              </Text>
              <Text style={{ color: colors.text, opacity: 0.6, fontSize: 14 }}>
                {selected.toLocaleDateString("en-US", {
                  month: "short",
                  year: "numeric",
                })}
              </Text>
            </View>
          </View>
          <Pressable
            onPress={() => setSelected(new Date())}
            style={{ borderRadius: 12, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: "rgba(27, 163, 114, 0.12)" }}
          >
            <Text style={{ fontWeight: "600", color: GREEN }}>
              Today
            </Text>
          </Pressable>
        </View>

        <View style={{ marginTop: 20, flexDirection: "row", justifyContent: "space-between" }}>
          {weekDays.map((d) => {
            const isSelected = sameDay(d, selected);
            return (
              <Pressable
                key={d.toISOString()}
                onPress={() => setSelected(d)}
                style={{
                  alignItems: "center",
                  width: 38,
                  paddingVertical: 8,
                  borderRadius: 12,
                  backgroundColor: isSelected ? ACCENT : "transparent",
                }}
              >
                <Text
                  style={{ fontSize: 12, fontWeight: "600", color: isSelected ? "#fff" : colors.text, opacity: isSelected ? 1 : 0.55 }}
                >
                  {DAY_LABELS[d.getDay()]}
                </Text>
                <Text
                  style={{ marginTop: 4, fontWeight: "700", fontSize: 16, color: isSelected ? "#fff" : colors.text }}
                >
                  {d.getDate()}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Ionicons name="calendar-outline" size={18} color={ACCENT} />
          <Text style={{ fontWeight: "700", fontSize: 16, color: colors.text }}>
            {sameDay(selected, today) ? "Upcoming Events" : "Events"}
          </Text>
          {!sameDay(selected, today) ? (
            <Text style={{ fontSize: 14, color: colors.text, opacity: 0.6 }}>
              {selected.toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </Text>
          ) : null}
        </View>

        <View style={{ marginTop: 12, gap: 12 }}>
          {isLoading || isError ? (
            <Pressable
              onPress={() => refetch()}
              style={{ borderRadius: 16, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 16, paddingVertical: 16 }}
            >
              <Text style={{ textAlign: "center", fontWeight: "600", color: colors.text }}>
                {isLoading ? "Loading events..." : "Unable to load events. Tap to retry."}
              </Text>
            </Pressable>
          ) : null}

          {!isLoading && !isError ? (
            (sameDay(selected, today) ? upcomingEvents : eventsForSelectedDay).length ===
            0 ? (
              <View style={{ borderRadius: 16, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 16, paddingVertical: 16 }}>
                <Text style={{ textAlign: "center", fontWeight: "600", color: colors.text }}>
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
                style={{ flexDirection: "row", alignItems: "center", borderRadius: 16, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 16, paddingVertical: 16, backgroundColor: style.bg }}
              >
                <View style={{ width: 48, alignItems: "center" }}>
                  <Text style={{ fontWeight: "700", fontSize: 12, color: style.monthColor, letterSpacing: 1 }}>
                    {event.monthLabel}
                  </Text>
                  <Text style={{ fontWeight: "700", color: style.monthColor, fontSize: 18 }}>
                    {event.day}
                  </Text>
                </View>
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={{ fontWeight: "700", fontSize: 16, color: colors.text }}>
                    {event.title}
                  </Text>
                  <Text style={{ marginTop: 2, fontSize: 14, color: colors.text, opacity: 0.7, textDecorationLine: "underline" }}>
                    {event.meta}
                  </Text>
                </View>
                {event.cta ? (
                  <Pressable
                    style={{ borderRadius: 8, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bg, paddingHorizontal: 12, paddingVertical: 8 }}
                  >
                    <Text style={{ fontSize: 14, fontWeight: "600", color: ACCENT }}>
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
