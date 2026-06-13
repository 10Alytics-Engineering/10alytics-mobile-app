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
  const colors = useThemeColors();
  const name = attachment.name ?? "Attachment";
  const url = attachment.url ? resolveMediaUrl(attachment.url) : null;

  return (
    <Pressable
      disabled={!url}
      onPress={() => {
        if (url) void WebBrowser.openBrowserAsync(url);
      }}
      style={{ marginTop: 8, flexDirection: "row", alignItems: "center", borderRadius: 12, backgroundColor: colors.bg, paddingHorizontal: 12, paddingVertical: 12 }}
    >
      <View
        style={{ height: 40, width: 40, alignItems: "center", justifyContent: "center", borderRadius: 8, backgroundColor: ACCENT_SOFT }}
      >
        <Ionicons name="document-attach-outline" size={20} color={ACCENT} />
      </View>
      <View style={{ marginLeft: 12, flex: 1 }}>
        <Text style={{ fontWeight: "700", fontSize: 14, color: colors.text }} numberOfLines={2}>
          {name}
        </Text>
        {attachment.mime_type ? (
          <Text style={{ marginTop: 2, fontSize: 12, color: colors.text, opacity: 0.6 }}>
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

  const inputStyle = {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bg,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.text,
  } as const;

  const labelStyle = {
    marginBottom: 8,
    fontSize: 12,
    fontWeight: "600",
    color: colors.text,
    opacity: 0.6,
  } as const;

  if (locked) {
    return (
      <View style={{ marginTop: 24, flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.secondary, padding: 16 }}>
        <Ionicons
          name={isGraded ? "checkmark-circle" : "time-outline"}
          size={20}
          color={ACCENT}
        />
        <Text style={{ flex: 1, fontSize: 14, color: colors.text, opacity: 0.8 }}>
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
    <View style={{ marginTop: 24, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.secondary, padding: 16 }}>
      <Text style={{ fontWeight: "700", fontSize: 16, color: colors.text }}>
        {submissionId ? "Edit your submission" : "Submit your work"}
      </Text>

      <Text style={[labelStyle, { marginTop: 12 }]}>Answer</Text>
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="Type your answer…"
        placeholderTextColor={colors.placeholder}
        multiline
        style={[inputStyle, { minHeight: 96, textAlignVertical: "top" }]}
      />

      <Text style={[labelStyle, { marginTop: 16 }]}>Link (optional)</Text>
      <TextInput
        value={link}
        onChangeText={setLink}
        placeholder="https://…"
        placeholderTextColor={colors.placeholder}
        autoCapitalize="none"
        keyboardType="url"
        style={inputStyle}
      />

      <View style={{ marginTop: 16, flexDirection: "row", gap: 12 }}>
        <Pressable
          onPress={() => handleSave(false)}
          disabled={busy}
          style={{ flex: 1, alignItems: "center", borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bg, paddingVertical: 12, opacity: busy ? 0.6 : 1 }}
        >
          <Text style={{ fontSize: 14, fontWeight: "600", color: colors.text }}>
            {save.isPending ? "Saving…" : "Save draft"}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => handleSave(true)}
          disabled={busy}
          style={{ flex: 1, alignItems: "center", borderRadius: 12, paddingVertical: 12, backgroundColor: ACCENT, opacity: busy ? 0.6 : 1 }}
        >
          <Text style={{ fontSize: 14, fontWeight: "700", color: "#fff" }}>
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
  const colors = useThemeColors();
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
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View
        style={{ flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderBottomColor: colors.border, paddingHorizontal: 16, paddingBottom: 12, paddingTop: insets.top + 8 }}
      >
        <Pressable
          onPress={() => router.back()}
          style={{ marginRight: 8, height: 40, width: 40, alignItems: "center", justifyContent: "center", borderRadius: 9999, backgroundColor: colors.secondary }}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={24} color={ACCENT} />
        </Pressable>
        <Text style={{ flex: 1, fontWeight: "700", fontSize: 18, color: colors.text }} numberOfLines={1}>
          {title}
        </Text>
      </View>

      {isLoading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={ACCENT} />
        </View>
      ) : isError || !data ? (
        <Pressable
          onPress={() => refetch()}
          style={{ margin: 20, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.secondary, padding: 24 }}
        >
          <Text style={{ textAlign: "center", fontWeight: "600", color: colors.text }}>
            Unable to load details. Tap to retry.
          </Text>
        </Pressable>
      ) : (
        <ScrollView
          style={{ flex: 1, paddingHorizontal: 20, paddingTop: 16 }}
          contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
          showsVerticalScrollIndicator={false}
        >
          <Text style={{ fontWeight: "700", fontSize: 24, lineHeight: 32, color: colors.text }}>
            {data.title}
          </Text>

          {status ? (
            <View
              style={{ marginTop: 12, alignSelf: "flex-start", borderRadius: 6, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: ACCENT_SOFT }}
            >
              <Text style={{ fontSize: 12, fontWeight: "700", textTransform: "uppercase", color: ACCENT }}>
                {status.replace(/_/g, " ")}
              </Text>
            </View>
          ) : null}

          {data.due_at ? (
            <Text style={{ marginTop: 12, fontSize: 14, color: colors.text, opacity: 0.7 }}>
              Due {formatClassroomDate(data.due_at)}
            </Text>
          ) : null}

          {data.points_possible != null ? (
            <Text style={{ marginTop: 4, fontSize: 14, fontWeight: "600", color: colors.text }}>
              {data.points_possible} points
            </Text>
          ) : null}

          {description ? (
            <HtmlContentView
              html={description}
              style={{ marginTop: 16 }}
              textStyle={{ marginTop: 16, fontSize: 16, lineHeight: 24, color: colors.text, opacity: 0.8 }}
            />
          ) : null}

          {attachments.length > 0 ? (
            <View style={{ marginTop: 24 }}>
              <Text style={{ fontWeight: "700", fontSize: 16, color: colors.text }}>
                Resources
              </Text>
              {attachments.map((item) => (
                <AttachmentRow key={String(item.id)} attachment={item} />
              ))}
            </View>
          ) : null}

          {data.submission_text || data.submission_link ? (
            <View style={{ marginTop: 24, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.secondary, padding: 16 }}>
              <Text style={{ fontWeight: "700", fontSize: 16, color: colors.text }}>
                Your submission
              </Text>
              {data.submission_text ? (
                <HtmlContentView
                  html={data.submission_text}
                  style={{ marginTop: 8 }}
                  textStyle={{ marginTop: 8, fontSize: 14, lineHeight: 20, color: colors.text, opacity: 0.8 }}
                />
              ) : null}
              {data.submission_link ? (
                <Pressable
                  onPress={() => void Linking.openURL(data.submission_link!)}
                  style={{ marginTop: 12, flexDirection: "row", alignItems: "center", gap: 8 }}
                >
                  <Ionicons name="link-outline" size={18} color={ACCENT} />
                  <Text style={{ fontSize: 14, fontWeight: "600", color: ACCENT }}>
                    Open submission link
                  </Text>
                </Pressable>
              ) : null}
            </View>
          ) : null}

          {data.feedback ? (
            <View style={{ marginTop: 24, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.secondary, padding: 16 }}>
              <Text style={{ fontWeight: "700", fontSize: 16, color: colors.text }}>Feedback</Text>
              <HtmlContentView
                html={data.feedback}
                style={{ marginTop: 8 }}
                textStyle={{ marginTop: 8, fontSize: 14, lineHeight: 20, color: colors.text, opacity: 0.8 }}
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
