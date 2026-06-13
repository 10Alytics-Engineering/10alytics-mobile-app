import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HtmlContentView } from "@/components/html-content-view";
import useThemeColors from "@/contexts/ThemeColors";
import { useSubmitAssignment } from "@/hooks/use-assignment-submission";
import {
  formatClassroomDate,
  getAssignmentStatus,
  useClassroomAssignmentDetail,
} from "@/hooks/use-classroom";
import type { ClassroomAttachment } from "@/lib/api-client";
import { resolveMediaUrl } from "@/utils/resolve-media-url";

const ACCENT = "#DA6728";
const ACCENT_SOFT = "rgba(218, 103, 40, 0.12)";

function AttachmentRow({ attachment }: { attachment: ClassroomAttachment }) {
  const name = attachment.name ?? "Attachment";
  const url = attachment.url ? resolveMediaUrl(attachment.url) : null;

  return (
    <Pressable
      disabled={!url}
      onPress={() => {
        if (url) void WebBrowser.openBrowserAsync(url);
      }}
      className="mt-2 flex-row items-center rounded-xl bg-background px-3 py-3"
    >
      <View
        className="h-10 w-10 items-center justify-center rounded-lg"
        style={{ backgroundColor: ACCENT_SOFT }}
      >
        <Ionicons name="document-attach-outline" size={20} color={ACCENT} />
      </View>
      <View className="ml-3 flex-1">
        <Text className="font-outfit-bold text-sm text-text" numberOfLines={2}>
          {name}
        </Text>
        {attachment.mime_type ? (
          <Text className="mt-0.5 text-xs text-text opacity-60">
            {attachment.mime_type}
          </Text>
        ) : null}
      </View>
      {url ? <Ionicons name="open-outline" size={20} color={ACCENT} /> : null}
    </Pressable>
  );
}

function SubmissionComposer({
  courseEnrollmentId,
  assignmentId,
  kind,
  submissionId,
  initialText,
  initialLink,
  status,
}: {
  courseEnrollmentId: string;
  assignmentId: string;
  kind: "assignment" | "capstone";
  submissionId?: number | string | null;
  initialText?: string | null;
  initialLink?: string | null;
  status: string | null;
}) {
  const colors = useThemeColors();
  const { save, turnIn } = useSubmitAssignment(
    courseEnrollmentId,
    assignmentId,
    kind,
  );

  const isGraded = status === "graded";
  const isTurnedIn = status === "submitted" || status === "turned_in";
  const locked = isGraded || isTurnedIn;

  const [text, setText] = useState(initialText ?? "");
  const [link, setLink] = useState(initialLink ?? "");

  useEffect(() => {
    setText(initialText ?? "");
    setLink(initialLink ?? "");
  }, [initialText, initialLink]);

  if (locked) {
    return (
      <View className="mt-6 flex-row items-center gap-2 rounded-2xl border border-border bg-secondary/40 p-4">
        <Ionicons
          name={isGraded ? "checkmark-circle" : "time-outline"}
          size={20}
          color={ACCENT}
        />
        <Text className="flex-1 text-sm text-text opacity-80">
          {isGraded
            ? "This assignment has been graded."
            : "Your work has been turned in and is awaiting grading."}
        </Text>
      </View>
    );
  }

  const handleSave = async (thenTurnIn: boolean) => {
    if (!text.trim() && !link.trim()) {
      Alert.alert("Nothing to submit", "Add some text or a link first.");
      return;
    }
    try {
      const saved = await save.mutateAsync({
        submission_text: text.trim() || null,
        submission_link: link.trim() || null,
      });
      if (thenTurnIn) {
        const id = saved?.id ?? submissionId;
        if (id == null) {
          Alert.alert(
            "Saved",
            "Your work was saved. Reopen to turn it in for grading.",
          );
          return;
        }
        await turnIn.mutateAsync(id);
        Alert.alert("Turned in", "Your work has been submitted for grading.");
      } else {
        Alert.alert("Saved", "Your draft has been saved.");
      }
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Couldn't submit your work",
      );
    }
  };

  const busy = save.isPending || turnIn.isPending;

  return (
    <View className="mt-6 rounded-2xl border border-border bg-secondary/40 p-4">
      <Text className="font-outfit-bold text-base text-text">
        {submissionId ? "Edit your submission" : "Submit your work"}
      </Text>

      <Text className="mb-2 mt-3 text-xs font-semibold text-text opacity-60">
        Answer
      </Text>
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="Type your answer…"
        placeholderTextColor={colors.placeholder}
        multiline
        className="min-h-24 rounded-xl border border-border bg-background px-3 py-3 text-sm text-text"
        style={{ textAlignVertical: "top" }}
      />

      <Text className="mb-2 mt-4 text-xs font-semibold text-text opacity-60">
        Link (optional)
      </Text>
      <TextInput
        value={link}
        onChangeText={setLink}
        placeholder="https://…"
        placeholderTextColor={colors.placeholder}
        autoCapitalize="none"
        keyboardType="url"
        className="rounded-xl border border-border bg-background px-3 py-3 text-sm text-text"
      />

      <View className="mt-4 flex-row gap-3">
        <Pressable
          onPress={() => handleSave(false)}
          disabled={busy}
          className={`flex-1 items-center rounded-xl border border-border bg-background py-3 ${busy ? "opacity-60" : "active:opacity-80"}`}
        >
          <Text className="text-sm font-semibold text-text">
            {save.isPending ? "Saving…" : "Save draft"}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => handleSave(true)}
          disabled={busy}
          className={`flex-1 items-center rounded-xl py-3 ${busy ? "opacity-60" : "active:opacity-90"}`}
          style={{ backgroundColor: ACCENT }}
        >
          <Text className="text-sm font-bold text-white">
            {turnIn.isPending ? "Turning in…" : "Turn in"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

export function ClassroomAssessmentDetailScreen({
  forcedKind,
}: {
  forcedKind?: "assignment" | "capstone";
} = {}) {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    assignmentId?: string | string[];
    courseEnrollmentId?: string | string[];
    kind?: string | string[];
  }>();

  const assignmentId = Array.isArray(params.assignmentId)
    ? params.assignmentId[0]
    : params.assignmentId;
  const courseEnrollmentId = Array.isArray(params.courseEnrollmentId)
    ? params.courseEnrollmentId[0]
    : params.courseEnrollmentId;
  const kindParam = Array.isArray(params.kind) ? params.kind[0] : params.kind;
  const kind: "assignment" | "capstone" =
    forcedKind ?? (kindParam === "capstone" ? "capstone" : "assignment");

  const { data, isLoading, isError, refetch } = useClassroomAssignmentDetail(
    courseEnrollmentId,
    assignmentId,
    kind,
  );

  const title =
    kind === "capstone" ? "Capstone Project" : "Assignment";
  const status = data ? getAssignmentStatus(data) : null;
  const description = data?.description ?? data?.body ?? "";
  const attachments = [
    ...(data?.attachments ?? []),
    ...(data?.submission?.attachments ?? []),
  ];

  return (
    <View className="flex-1 bg-background">
      <View
        className="flex-row items-center border-b border-border/40 px-4 pb-3"
        style={{ paddingTop: insets.top + 8 }}
      >
        <Pressable
          onPress={() => router.back()}
          className="mr-2 h-10 w-10 items-center justify-center rounded-full bg-secondary/80"
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={24} color={ACCENT} />
        </Pressable>
        <Text className="flex-1 font-outfit-bold text-lg text-text" numberOfLines={1}>
          {title}
        </Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={ACCENT} />
        </View>
      ) : isError || !data ? (
        <Pressable
          onPress={() => refetch()}
          className="m-5 rounded-2xl border border-border bg-secondary/40 p-6"
        >
          <Text className="text-center font-semibold text-text">
            Unable to load details. Tap to retry.
          </Text>
        </Pressable>
      ) : (
        <ScrollView
          className="flex-1 px-5 pt-4"
          contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
          showsVerticalScrollIndicator={false}
        >
          <Text className="font-outfit-bold text-2xl leading-8 text-text">
            {data.title}
          </Text>

          {status ? (
            <View
              className="mt-3 self-start rounded-md px-3 py-1.5"
              style={{ backgroundColor: ACCENT_SOFT }}
            >
              <Text
                className="text-xs font-outfit-bold uppercase"
                style={{ color: ACCENT }}
              >
                {status.replace(/_/g, " ")}
              </Text>
            </View>
          ) : null}

          {data.due_at ? (
            <Text className="mt-3 text-sm text-text opacity-70">
              Due {formatClassroomDate(data.due_at)}
            </Text>
          ) : null}

          {data.points_possible != null ? (
            <Text className="mt-1 text-sm font-semibold text-text">
              {data.points_possible} points
            </Text>
          ) : null}

          {description ? (
            <HtmlContentView
              html={description}
              className="mt-4"
              textClassName="mt-4 text-base leading-6 text-text opacity-80"
            />
          ) : null}

          {attachments.length > 0 ? (
            <View className="mt-6">
              <Text className="font-outfit-bold text-base text-text">
                Resources
              </Text>
              {attachments.map((item) => (
                <AttachmentRow key={String(item.id)} attachment={item} />
              ))}
            </View>
          ) : null}

          {data.submission_text || data.submission_link ? (
            <View className="mt-6 rounded-2xl border border-border bg-secondary/40 p-4">
              <Text className="font-outfit-bold text-base text-text">
                Your submission
              </Text>
              {data.submission_text ? (
                <HtmlContentView
                  html={data.submission_text}
                  className="mt-2"
                  textClassName="mt-2 text-sm leading-5 text-text opacity-80"
                />
              ) : null}
              {data.submission_link ? (
                <Pressable
                  onPress={() => void Linking.openURL(data.submission_link!)}
                  className="mt-3 flex-row items-center gap-2"
                >
                  <Ionicons name="link-outline" size={18} color={ACCENT} />
                  <Text className="text-sm font-semibold" style={{ color: ACCENT }}>
                    Open submission link
                  </Text>
                </Pressable>
              ) : null}
            </View>
          ) : null}

          {data.feedback ? (
            <View className="mt-6 rounded-2xl border border-border bg-secondary/40 p-4">
              <Text className="font-outfit-bold text-base text-text">Feedback</Text>
              <HtmlContentView
                html={data.feedback}
                className="mt-2"
                textClassName="mt-2 text-sm leading-5 text-text opacity-80"
              />
            </View>
          ) : null}

          {courseEnrollmentId && assignmentId ? (
            <SubmissionComposer
              courseEnrollmentId={courseEnrollmentId}
              assignmentId={assignmentId}
              kind={kind}
              submissionId={data.submission?.id ?? null}
              initialText={data.submission_text}
              initialLink={data.submission_link}
              status={status}
            />
          ) : null}
        </ScrollView>
      )}
    </View>
  );
}
