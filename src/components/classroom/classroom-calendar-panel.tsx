import { PressableScale, Text, View } from "@/tw";
import { Animated } from "@/tw/animated";
import { LinearGradient } from "expo-linear-gradient";
import { SymbolView } from "expo-symbols";
import React, { useMemo, useState } from "react";
import { StyleSheet } from "react-native";
import { FadeInDown, FadeInRight } from "react-native-reanimated";

export type ClassroomCalendarColors = {
  bg: string;
  text: string;
  secondary: string;
  invert: string;
  border: string;
};

type EventItem = {
  id: number;
  title: string;
  time: string;
  date: string;
  location: string;
  type: "workshop" | "study" | "live" | "review";
  attendees: number;
  color: string;
};

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
  },
  monthText: {
    fontSize: 16,
    fontWeight: "600",
  },
  weekRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  dayPill: {
    width: 44,
    height: 64,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  card: {
    borderRadius: 20,
    padding: 16,
  },
  eventRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  eventMeta: {
    fontSize: 13,
    opacity: 0.7,
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
});

const events: EventItem[] = [
  {
    id: 1,
    title: "React Native Workshop",
    time: "10:00 AM",
    date: "2026-01-25",
    location: "Online",
    type: "workshop",
    attendees: 45,
    color: "#DA6728",
  },
  {
    id: 2,
    title: "Group Study Session",
    time: "2:00 PM",
    date: "2026-01-25",
    location: "Study Room A",
    type: "study",
    attendees: 12,
    color: "#4A90E2",
  },
  {
    id: 3,
    title: "Live Q&A with Instructor",
    time: "4:00 PM",
    date: "2026-01-26",
    location: "Online",
    type: "live",
    attendees: 120,
    color: "#9B59B6",
  },
  {
    id: 4,
    title: "Project Review",
    time: "11:00 AM",
    date: "2026-01-27",
    location: "Online",
    type: "review",
    attendees: 8,
    color: "#E74C3C",
  },
];

const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const formatDateKey = (date: Date) => date.toISOString().split("T")[0];

const parseEventDateTime = (event: EventItem) => {
  const match = event.time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  const base = new Date(event.date);
  if (!match) return base;
  let hour = Number(match[1]);
  const minutes = Number(match[2]);
  const meridiem = match[3].toUpperCase();
  if (meridiem === "PM" && hour !== 12) hour += 12;
  if (meridiem === "AM" && hour === 12) hour = 0;
  base.setHours(hour, minutes, 0, 0);
  return base;
};

const getWeekDays = (date: Date) => {
  const start = new Date(date);
  start.setDate(date.getDate() - date.getDay());
  return Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
};

interface ClassroomCalendarPanelProps {
  colors: ClassroomCalendarColors;
}

export function ClassroomCalendarPanel({ colors }: ClassroomCalendarPanelProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const weekDays = useMemo(() => getWeekDays(currentDate), [currentDate]);
  const todayKey = formatDateKey(currentDate);

  const todaysEvents = events.filter((e) => e.date === todayKey);
  const upcomingEvents = events
    .map((event) => ({ event, date: parseEventDateTime(event) }))
    .filter(({ date }) => date.getTime() >= new Date().getTime())
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  const nextEvent = upcomingEvents[0]?.event;

  return (
    <View className="gap-[18px]">
      <Animated.View entering={FadeInDown.delay(50).springify()}>
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.title, { color: colors.text }]}>Schedule</Text>
            <Text style={[styles.monthText, { color: colors.text, opacity: 0.6 }]}>
              {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </Text>
          </View>
          <PressableScale
            onPress={() => setCurrentDate(new Date())}
            className="rounded-full px-4 py-2"
            style={{ backgroundColor: colors.secondary }}
          >
            <Text style={{ color: colors.text }} className="text-sm font-semibold">
              Today
            </Text>
          </PressableScale>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInRight.delay(100).springify()}>
        <View style={styles.weekRow}>
          {weekDays.map((day) => {
            const isSelected = formatDateKey(day) === todayKey;
            return (
              <PressableScale
                key={day.toISOString()}
                onPress={() => setCurrentDate(day)}
                style={[
                  styles.dayPill,
                  {
                    backgroundColor: isSelected ? colors.text : colors.secondary,
                    borderWidth: isSelected ? 0 : 1,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text
                  style={{
                    color: isSelected ? colors.invert : colors.text,
                    opacity: isSelected ? 1 : 0.6,
                    fontSize: 12,
                  }}
                >
                  {dayLabels[day.getDay()]}
                </Text>
                <Text
                  style={{
                    color: isSelected ? colors.invert : colors.text,
                    fontSize: 16,
                    fontWeight: "700",
                  }}
                >
                  {day.getDate()}
                </Text>
              </PressableScale>
            );
          })}
        </View>
      </Animated.View>

      <View>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Next up</Text>
        {nextEvent ? (
          <View style={[styles.card, { backgroundColor: colors.secondary, marginTop: 10 }]}>
            <View style={styles.eventRow}>
              <LinearGradient
                colors={[`${nextEvent.color}35`, `${nextEvent.color}10`]}
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 14,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <SymbolView name="video.fill" size={20} tintColor={nextEvent.color} />
              </LinearGradient>
              <View style={{ flex: 1 }}>
                <Text style={[styles.eventTitle, { color: colors.text }]}>{nextEvent.title}</Text>
                <Text style={[styles.eventMeta, { color: colors.text }]}>
                  {nextEvent.time} • {nextEvent.location}
                </Text>
                <View style={[styles.badge, { backgroundColor: `${nextEvent.color}15` }]}>
                  <Text style={{ color: nextEvent.color, fontSize: 12, fontWeight: "600" }}>
                    {nextEvent.attendees} attending
                  </Text>
                </View>
              </View>
            </View>
          </View>
        ) : (
          <View style={[styles.card, { backgroundColor: colors.secondary, marginTop: 10 }]}>
            <Text style={[styles.eventTitle, { color: colors.text }]}>No upcoming classes</Text>
            <Text style={[styles.eventMeta, { color: colors.text }]}>
              Check back later for new sessions.
            </Text>
          </View>
        )}
      </View>

      <View>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Today</Text>
        {todaysEvents.length > 0 ? (
          todaysEvents.map((event, index) => (
            <Animated.View
              key={event.id}
              entering={FadeInDown.delay(150 + index * 80).springify()}
              style={{ marginTop: 10 }}
            >
              <View style={[styles.card, { backgroundColor: colors.secondary }]}>
                <View style={styles.eventRow}>
                  <LinearGradient
                    colors={[`${event.color}35`, `${event.color}10`]}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <SymbolView name="clock.fill" size={18} tintColor={event.color} />
                  </LinearGradient>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.eventTitle, { color: colors.text }]}>{event.title}</Text>
                    <Text style={[styles.eventMeta, { color: colors.text }]}>
                      {event.time} • {event.location}
                    </Text>
                  </View>
                </View>
              </View>
            </Animated.View>
          ))
        ) : (
          <View style={[styles.card, { backgroundColor: colors.secondary, marginTop: 10 }]}>
            <Text style={[styles.eventTitle, { color: colors.text }]}>No events today</Text>
            <Text style={[styles.eventMeta, { color: colors.text }]}>You are clear for the day.</Text>
          </View>
        )}
      </View>

      <View>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Upcoming</Text>
        {events
          .filter((event) => new Date(event.date) > currentDate)
          .map((event, index) => (
            <Animated.View
              key={event.id}
              entering={FadeInRight.delay(200 + index * 90).springify()}
              style={{ marginTop: 10 }}
            >
              <View style={[styles.card, { backgroundColor: colors.secondary }]}>
                <View style={styles.eventRow}>
                  <LinearGradient
                    colors={[`${event.color}25`, `${event.color}10`]}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <SymbolView name="calendar" size={18} tintColor={event.color} />
                  </LinearGradient>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.eventTitle, { color: colors.text }]}>{event.title}</Text>
                    <Text style={[styles.eventMeta, { color: colors.text }]}>
                      {new Date(event.date).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}{" "}
                      • {event.time}
                    </Text>
                  </View>
                </View>
              </View>
            </Animated.View>
          ))}
      </View>
    </View>
  );
}
