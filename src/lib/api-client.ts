import * as AppleAuthentication from "expo-apple-authentication";
import * as Linking from "expo-linking";
import * as SecureStore from "expo-secure-store";
import * as WebBrowser from "expo-web-browser";
import { Platform } from "react-native";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000/api";

const TIMEZONE_HEADER = "X-Timezone";

// Complete the OAuth flow
WebBrowser.maybeCompleteAuthSession();

interface LoginResponse {
  user: {
    id: string;
    first_name: string;
    other_names: string;
    email: string;
    image?: string;
  };
  token: string;
  token_type?: string;
  expires_in?: number;
}

interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

interface ChatDevicePayload {
  token: string;
  platform: "ios" | "android";
  device_name?: string | null;
  app_version?: string | null;
}

export type ChatConversationType = "classroom" | "pod" | "instructor_dm";
export type ChatMessageType = "text" | "image" | "file";
export type ChatMessageStatus = "sending" | "delivered" | "failed";

export interface ChatParticipantUser {
  id: number | string;
  first_name: string;
  other_names?: string | null;
  profile_photo_url?: string | null;
}

export interface ChatMessage {
  id: string;
  conversation_id?: number | string;
  sender?: ChatParticipantUser;
  /** Full message text (message list / send response). */
  body?: string | null;
  /** Preview snippet on conversation list items. */
  body_preview?: string | null;
  sender_id?: number | string | null;
  type: ChatMessageType | string;
  attachment_url?: string | null;
  attachment_meta?: Record<string, unknown> | null;
  reply_to_id?: string | null;
  client_message_id?: string | null;
  edited_at?: string | null;
  deleted_at?: string | null;
  created_at: string;
  status?: ChatMessageStatus;
}

export interface ChatConversation {
  id: number | string;
  type: ChatConversationType;
  title?: string | null;
  name?: string | null;
  classroom_id?: number | string | null;
  pod_id?: number | string | null;
  last_message_at?: string | null;
  unread_count?: number;
  last_message?: ChatMessage | null;
  participants?: {
    id: number | string;
    user?: ChatParticipantUser;
    notifications_enabled?: boolean;
    muted_until?: string | null;
    is_banned?: boolean;
  }[];
}

export interface PaginatedChatResponse<T> {
  data: T[];
  next_cursor?: string | null;
}

export interface ChatApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface SendChatMessagePayload {
  type: ChatMessageType;
  body?: string | null;
  attachment_url?: string | null;
  attachment_meta?: Record<string, unknown> | null;
  reply_to_id?: string | null;
  client_message_id: string;
}

export interface ChatAttachmentSignPayload {
  conversation_id: number | string;
  filename: string;
  mime: string;
  size: number;
  kind: "image" | "file";
}

export interface ChatAttachmentSignResponse {
  put_url: string;
  file_url: string;
  headers?: Record<string, string>;
  content_type?: string;
}

export interface ClassroomEnrollment {
  id: number;
  course_id?: number;
  cohort_id?: number;
  is_banned?: boolean | number;
  status?: string | null;
}

export interface ClassroomPublic {
  id: number;
  course_id?: number;
  cohort_id?: number;
  title?: string | null;
  name?: string | null;
  shift?: string | null;
}

export interface ClassroomSession {
  classroomId: number;
  courseEnrollmentId: number;
  courseId?: number;
  cohortId?: number;
  title: string;
  shift: string;
}

export interface ClassroomAttachment {
  id: number | string;
  type?: string | null;
  name?: string | null;
  url?: string | null;
  mime_type?: string | null;
  size?: number | null;
}

export interface ClassroomAssignment {
  id: number | string;
  classroom_post_id?: number | string;
  title: string;
  description?: string | null;
  body?: string | null;
  status?: string | null;
  due_at?: string | null;
  published_at?: string | null;
  created_at?: string | null;
  submitted_at?: string | null;
  points_possible?: number | null;
  score_earned?: number | null;
  attachments?: ClassroomAttachment[];
  submission?: {
    id: number | string;
    status?: string | null;
    submitted_at?: string | null;
    score_earned?: number | null;
    attachments?: ClassroomAttachment[];
  } | null;
}

export interface ClassroomLatest {
  announcements?: unknown[];
  recent_assignments?: ClassroomAssignment[];
  recent_materials?: unknown[];
  upcoming_sessions?: ClassroomCalendarEvent[];
  upcoming_deadlines?: ClassroomCalendarEvent[];
  recent_grades?: unknown[];
}

export type ClassroomPostType =
  | "assignment"
  | "capstone_project"
  | "material"
  | "live_session"
  | "announcement"
  | string;

export interface ClassroomPost {
  id: number | string;
  type: ClassroomPostType;
  title?: string | null;
  body?: string | null;
  description?: string | null;
  published_at?: string | null;
  created_at?: string | null;
  due_at?: string | null;
  starts_at?: string | null;
  ends_at?: string | null;
  attachments?: ClassroomAttachment[];
  creator?: {
    id: number | string;
    first_name?: string | null;
    other_names?: string | null;
  } | null;
}

export interface ClassroomClasswork {
  grouped: Record<string, ClassroomPost[]>;
  counts: Record<string, number>;
}

export interface ClassroomResourcePost {
  id: number | string;
  title: string;
  body?: string | null;
  description?: string | null;
  published_at?: string | null;
  created_at?: string | null;
  attachments?: ClassroomAttachment[];
}

export interface ClassroomRecording {
  id: number | string;
  title: string;
  description?: string | null;
  scheduled_at?: string | null;
  duration_minutes?: number | null;
  recording_url?: string | null;
  recording_status?: string | null;
  status?: string | null;
  viewer_attended?: boolean;
}

export interface ClassroomCalendarEvent {
  id: number | string;
  type?: "live_session" | "assignment_deadline" | string;
  title?: string | null;
  starts_at?: string | null;
  ends_at?: string | null;
  due_at?: string | null;
  google_meet_link?: string | null;
  assignment_id?: number | string | null;
  status?: string | null;
}

export interface ClassroomPaginated<T> {
  current_page: number;
  data: T[];
  last_page: number;
  total: number;
  per_page?: number;
}

export interface ClassroomGrade {
  type: string;
  post_id: number;
  assignment_id: number;
  submission_id: number;
  title: string;
  status: string;
  score_earned: number;
  points_possible: number;
  submitted_at?: string | null;
  graded_at?: string | null;
}

export interface ClassroomPerson {
  id: number | string;
  first_name?: string | null;
  other_names?: string | null;
  name?: string | null;
  email?: string | null;
  role?: string | null;
  avatar_url?: string | null;
  image?: string | null;
}

export interface ClassroomPeople {
  students: ClassroomPerson[];
  instructors: ClassroomPerson[];
}

export type ClassroomAssignmentDetail = ClassroomAssignment & {
  classroom_post_id?: number | string;
  submission_text?: string | null;
  submission_link?: string | null;
  feedback?: string | null;
  grader?: {
    id?: number | string;
    first_name?: string | null;
    other_names?: string | null;
    name?: string | null;
  } | null;
};

export interface UserCourse {
  cohort_name: string;
  course_id: number;
  title: string;
  slug: string;
  /** Enrollment / user-course row id */
  id: number;
  progress_percentage: number;
}

export interface UserCoursesApiResponse {
  data: UserCourse[];
  message: string;
  status: string;
}

export interface UserCourseLesson {
  id: number;
  course_module_id: number;
  title: string;
  description: string | null;
  video_url: string | null;
  video_preview: string | null;
}

export interface UserCourseModule {
  id: number;
  course_week_id: number;
  title: string;
  course_lessons: UserCourseLesson[];
}

export interface UserCourseWeek {
  id: number;
  course_id: number;
  title: string;
  week: number;
  isLocked: number;
  isDeleted: number;
  course_module: UserCourseModule[];
  assessments: unknown[];
}

export interface UserCourseInstructor {
  id: number;
  name: string;
  career: string;
  image_url: string | null;
  link: string | null;
  email?: string;
}

export interface UserCourseDetailCourse {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  tagline: string | null;
  duration: string | null;
  image: string | null;
  video: string | null;
  language: string | null;
  level: string | null;
  link_to_brochure: string | null;
  career_starter_kit_link: string | null;
  whatsapp_community_link: string | null;
  enrolled_students_count?: number;
  course_weeks: UserCourseWeek[];
  instructors: UserCourseInstructor[];
}

export interface UserCourseDetailInnerData {
  course: UserCourseDetailCourse;
  progress_percentage: number;
  /** Enrollment “continue here” pointer; matches `UserCourseLesson.id`. API may send `current_week_video` or `current_week_video_id`. */
  current_week_video_id?: number | null;
}

export interface UserCourseDetailApiResponse {
  data: UserCourseDetailInnerData;
  message: string;
  status: string;
}

/** Row from `GET /api/courses/{enrollmentId}/lockedWeeks` */
export interface CourseLockedWeekRow {
  week: number;
  is_locked: number | boolean;
  is_completed?: boolean;
}

export function parseLockedWeeksResponse(raw: unknown): CourseLockedWeekRow[] {
  if (Array.isArray(raw)) return raw as CourseLockedWeekRow[];
  if (
    raw &&
    typeof raw === "object" &&
    "data" in raw &&
    Array.isArray((raw as { data: unknown }).data)
  ) {
    return (raw as { data: CourseLockedWeekRow[] }).data;
  }
  return [];
}

/** API may send `0` / `1`, booleans, or strings. */
export function normalizeWeekLockedFlag(
  isLocked: number | boolean | string | undefined,
): boolean {
  if (isLocked === true || isLocked === 1 || isLocked === "1") return true;
  if (isLocked === false || isLocked === 0 || isLocked === "0") return false;
  return Boolean(isLocked);
}

class ApiClient {
  private baseURL: string;
  private tokenKey = "auth_token";

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async getToken(): Promise<string | null> {
    if (Platform.OS === "web") {
      return localStorage.getItem(this.tokenKey);
    }
    return await SecureStore.getItemAsync(this.tokenKey);
  }

  async getAuthToken(): Promise<string | null> {
    return this.getToken();
  }

  getApiBaseURL(): string {
    return this.baseURL;
  }

  getClientTimezone(): string | null {
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      return typeof timezone === "string" && timezone.trim() !== ""
        ? timezone
        : null;
    } catch {
      return null;
    }
  }

  getTimezoneHeaders(): Record<string, string> {
    const timezone = this.getClientTimezone();
    return timezone ? { [TIMEZONE_HEADER]: timezone } : {};
  }

  private async setToken(token: string): Promise<void> {
    if (Platform.OS === "web") {
      localStorage.setItem(this.tokenKey, token);
    } else {
      await SecureStore.setItemAsync(this.tokenKey, token);
    }
  }

  private async removeToken(): Promise<void> {
    if (Platform.OS === "web") {
      localStorage.removeItem(this.tokenKey);
    } else {
      await SecureStore.deleteItemAsync(this.tokenKey);
    }
  }

  private async getHeaders(includeAuth = true): Promise<HeadersInit> {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...this.getTimezoneHeaders(),
    };

    if (includeAuth) {
      const token = await this.getToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<{ data?: T; error?: ApiError }> {
    try {
      // Don't include auth for login/register endpoints
      const shouldIncludeAuth =
        !endpoint.includes("/login") &&
        !endpoint.includes("/register") &&
        !endpoint.includes("/auth/google") &&
        !endpoint.includes("/auth/apple");

      const headers = await this.getHeaders(shouldIncludeAuth);

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      const responseData = await response.json();

      if (!response.ok) {
        return {
          error: {
            message: responseData.message || "An error occurred",
            errors: responseData.errors,
          },
        };
      }

      // Handle token storage for login/register
      if (
        (endpoint.includes("/login") || endpoint.includes("/register")) &&
        responseData.token
      ) {
        await this.setToken(responseData.token);
      }

      return { data: responseData };
    } catch (error) {
      return {
        error: {
          message:
            error instanceof Error
              ? error.message
              : "Network error. Please check your connection.",
        },
      };
    }
  }

  async login(
    email: string,
    password: string,
  ): Promise<{
    data?: LoginResponse;
    error?: ApiError;
  }> {
    return this.request<LoginResponse>("/api/v2/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  async register(
    first_name: string,
    other_names: string,
    email: string,
    password: string,
  ): Promise<{
    data?: LoginResponse;
    error?: ApiError;
  }> {
    return this.request<LoginResponse>("/api/v2/register", {
      method: "POST",
      body: JSON.stringify({ first_name, other_names, email, password }),
    });
  }

  async logout(): Promise<{ data?: { message: string }; error?: ApiError }> {
    await this.request("/api/v2/logout", {
      method: "POST",
    });
    await this.removeToken();
    return { data: { message: "Logged out successfully" } };
  }

  async registerChatDevice(payload: ChatDevicePayload): Promise<{
    data?: { message?: string };
    error?: ApiError;
  }> {
    return this.request<{ message?: string }>("/api/v2/chat/devices", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async deleteChatDevice(token: string): Promise<{
    data?: { message?: string };
    error?: ApiError;
  }> {
    return this.request<{ message?: string }>(
      `/api/v2/chat/devices/${encodeURIComponent(token)}`,
      { method: "DELETE" },
    );
  }

  async getCurrentUser(): Promise<{
    data?: LoginResponse["user"];
    error?: ApiError;
  }> {
    return this.request<LoginResponse["user"]>("/api/v2/user", {
      method: "GET",
    });
  }

  async getUserCourses(): Promise<{
    data?: UserCoursesApiResponse;
    error?: ApiError;
  }> {
    return this.request<UserCoursesApiResponse>("/api/v2/user/courses", {
      method: "GET",
    });
  }

  /** `enrollmentId` is the user-course / enrollment row id from `UserCourse.id`, not catalog `course_id`. */
  async getUserCourseDetail(enrollmentId: number): Promise<{
    data?: UserCourseDetailApiResponse;
    error?: ApiError;
  }> {
    return this.request<UserCourseDetailApiResponse>(
      `/api/v2/user/course/${enrollmentId}`,
      { method: "GET" },
    );
  }

  /** Lock state per week index; `enrollmentId` is `UserCourse.id`. */
  async getCourseLockedWeeks(enrollmentId: number): Promise<{
    data?: CourseLockedWeekRow[];
    error?: ApiError;
  }> {
    const result = await this.request<unknown>(
      `/api/courses/${enrollmentId}/lockedWeeks`,
      { method: "GET" },
    );
    if (result.error) return { error: result.error };
    return { data: parseLockedWeeksResponse(result.data) };
  }

  async getChatConversations(perPage = 25): Promise<{
    data?: ChatApiEnvelope<
      PaginatedChatResponse<ChatConversation> | ChatConversation[]
    >;
    error?: ApiError;
  }> {
    return this.request<
      ChatApiEnvelope<
        PaginatedChatResponse<ChatConversation> | ChatConversation[]
      >
    >(`/api/v2/chat/conversations?per_page=${perPage}`, { method: "GET" });
  }

  async getChatConversation(id: number | string): Promise<{
    data?: ChatApiEnvelope<ChatConversation>;
    error?: ApiError;
  }> {
    return this.request<ChatApiEnvelope<ChatConversation>>(
      `/api/v2/chat/conversations/${id}`,
      { method: "GET" },
    );
  }

  async getChatMessages(
    conversationId: number | string,
    params: { before?: string | null; limit?: number } = {},
  ): Promise<{
    data?: ChatApiEnvelope<PaginatedChatResponse<ChatMessage>>;
    error?: ApiError;
  }> {
    const search = new URLSearchParams();
    search.set("limit", String(params.limit ?? 50));
    if (params.before) search.set("before", params.before);

    return this.request<ChatApiEnvelope<PaginatedChatResponse<ChatMessage>>>(
      `/api/v2/chat/conversations/${conversationId}/messages?${search.toString()}`,
      { method: "GET" },
    );
  }

  async sendChatMessage(
    conversationId: number | string,
    payload: SendChatMessagePayload,
  ): Promise<{
    data?: ChatApiEnvelope<ChatMessage>;
    error?: ApiError;
  }> {
    return this.request<ChatApiEnvelope<ChatMessage>>(
      `/api/v2/chat/conversations/${conversationId}/messages`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );
  }

  async editChatMessage(
    messageId: string,
    payload: { body: string },
  ): Promise<{
    data?: ChatApiEnvelope<ChatMessage>;
    error?: ApiError;
  }> {
    return this.request<ChatApiEnvelope<ChatMessage>>(
      `/api/v2/chat/messages/${messageId}`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      },
    );
  }

  async deleteChatMessage(messageId: string): Promise<{
    data?: ChatApiEnvelope<{ id: string; deleted_at: string }>;
    error?: ApiError;
  }> {
    return this.request<ChatApiEnvelope<{ id: string; deleted_at: string }>>(
      `/api/v2/chat/messages/${messageId}`,
      { method: "DELETE" },
    );
  }

  async markChatConversationRead(
    conversationId: number | string,
    lastReadMessageId: string,
  ): Promise<{
    data?: ChatApiEnvelope<{
      conversation_id: number | string;
      last_read_message_id: string;
      last_read_at: string;
    }>;
    error?: ApiError;
  }> {
    return this.request<
      ChatApiEnvelope<{
        conversation_id: number | string;
        last_read_message_id: string;
        last_read_at: string;
      }>
    >(`/api/v2/chat/conversations/${conversationId}/read`, {
      method: "POST",
      body: JSON.stringify({ last_read_message_id: lastReadMessageId }),
    });
  }

  async markChatPresence(conversationId: number | string): Promise<{
    data?: ChatApiEnvelope<{ present: boolean }>;
    error?: ApiError;
  }> {
    return this.request<ChatApiEnvelope<{ present: boolean }>>(
      `/api/v2/chat/conversations/${conversationId}/presence`,
      { method: "POST" },
    );
  }

  async muteChatConversation(
    conversationId: number | string,
    payload: { notifications_enabled: boolean; muted_until?: string | null },
  ): Promise<{
    data?: ChatApiEnvelope<ChatConversation>;
    error?: ApiError;
  }> {
    return this.request<ChatApiEnvelope<ChatConversation>>(
      `/api/v2/chat/conversations/${conversationId}/mute`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      },
    );
  }

  async getChatUnreadCount(): Promise<{
    data?: ChatApiEnvelope<{
      total: number;
      per_conversation: Record<string, number>;
    }>;
    error?: ApiError;
  }> {
    return this.request<
      ChatApiEnvelope<{
        total: number;
        per_conversation: Record<string, number>;
      }>
    >("/api/v2/chat/unread-count", { method: "GET" });
  }

  async createInstructorDm(payload: {
    classroom_id: number | string;
    instructor_id?: number | string;
  }): Promise<{
    data?: ChatApiEnvelope<ChatConversation>;
    error?: ApiError;
  }> {
    return this.request<ChatApiEnvelope<ChatConversation>>(
      "/api/v2/chat/instructor-dm",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );
  }

  async signChatAttachment(payload: ChatAttachmentSignPayload): Promise<{
    data?: ChatApiEnvelope<ChatAttachmentSignResponse>;
    error?: ApiError;
  }> {
    return this.request<ChatApiEnvelope<ChatAttachmentSignResponse>>(
      "/api/v2/chat/attachments/sign",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );
  }

  async getClassroomEnrollments(): Promise<{
    data?: ChatApiEnvelope<ClassroomEnrollment[]>;
    error?: ApiError;
  }> {
    return this.request<ChatApiEnvelope<ClassroomEnrollment[]>>(
      "/api/v2/class-room/my/course-enrollment",
      { method: "GET" },
    );
  }

  async getClassroomPublic(courseEnrollmentId: number | string): Promise<{
    data?: ChatApiEnvelope<ClassroomPublic>;
    error?: ApiError;
  }> {
    return this.request<ChatApiEnvelope<ClassroomPublic>>(
      `/api/v2/class-room/classrooms/${courseEnrollmentId}/public`,
      { method: "GET" },
    );
  }

  async getClassroomLatest(courseEnrollmentId: number | string): Promise<{
    data?: ChatApiEnvelope<ClassroomLatest>;
    error?: ApiError;
  }> {
    return this.request<ChatApiEnvelope<ClassroomLatest>>(
      `/api/v2/class-room/classrooms/${courseEnrollmentId}/public/latest`,
      { method: "GET" },
    );
  }

  async getClassroomClasswork(
    courseEnrollmentId: number | string,
    params: { type?: string; perGroup?: number } = {},
  ): Promise<{
    data?: ChatApiEnvelope<ClassroomClasswork>;
    error?: ApiError;
  }> {
    const search = new URLSearchParams();
    if (params.type) search.set("type", params.type);
    if (params.perGroup) search.set("per_group", String(params.perGroup));

    const suffix = search.toString() ? `?${search.toString()}` : "";
    return this.request<ChatApiEnvelope<ClassroomClasswork>>(
      `/api/v2/class-room/classrooms/${courseEnrollmentId}/public/classwork${suffix}`,
      { method: "GET" },
    );
  }

  async getClassroomAssignments(
    courseEnrollmentId: number | string,
    params: { page?: number; status?: string | null } = {},
  ): Promise<{
    data?: ChatApiEnvelope<
      ClassroomPaginated<ClassroomAssignment> | ClassroomAssignment[]
    >;
    error?: ApiError;
  }> {
    const search = new URLSearchParams();
    search.set("page", String(params.page ?? 1));
    if (params.status) search.set("status", params.status);

    return this.request<
      ChatApiEnvelope<
        ClassroomPaginated<ClassroomAssignment> | ClassroomAssignment[]
      >
    >(
      `/api/v2/class-room/classrooms/${courseEnrollmentId}/public/assignments?${search.toString()}`,
      { method: "GET" },
    );
  }

  async getClassroomCapstones(
    courseEnrollmentId: number | string,
    params: { page?: number; perPage?: number; status?: string | null } = {},
  ): Promise<{
    data?: ChatApiEnvelope<
      ClassroomPaginated<ClassroomAssignment> | ClassroomAssignment[]
    >;
    error?: ApiError;
  }> {
    const search = new URLSearchParams();
    search.set("page", String(params.page ?? 1));
    search.set("per_page", String(params.perPage ?? 25));
    if (params.status) search.set("status", params.status);

    return this.request<
      ChatApiEnvelope<
        ClassroomPaginated<ClassroomAssignment> | ClassroomAssignment[]
      >
    >(
      `/api/v2/class-room/classrooms/${courseEnrollmentId}/public/capstone-projects?${search.toString()}`,
      { method: "GET" },
    );
  }

  async getClassroomAssignmentDetail(
    courseEnrollmentId: number | string,
    assignmentId: number | string,
  ): Promise<{
    data?: ChatApiEnvelope<ClassroomAssignmentDetail>;
    error?: ApiError;
  }> {
    return this.request<ChatApiEnvelope<ClassroomAssignmentDetail>>(
      `/api/v2/class-room/classrooms/${courseEnrollmentId}/public/assignments/${assignmentId}`,
      { method: "GET" },
    );
  }

  async getClassroomCapstoneDetail(
    courseEnrollmentId: number | string,
    assignmentId: number | string,
  ): Promise<{
    data?: ChatApiEnvelope<ClassroomAssignmentDetail>;
    error?: ApiError;
  }> {
    return this.request<ChatApiEnvelope<ClassroomAssignmentDetail>>(
      `/api/v2/class-room/classrooms/${courseEnrollmentId}/public/capstone-projects/${assignmentId}`,
      { method: "GET" },
    );
  }

  async getClassroomPeople(classroomId: number | string): Promise<{
    data?: ChatApiEnvelope<ClassroomPeople | Record<string, unknown>>;
    error?: ApiError;
  }> {
    return this.request<
      ChatApiEnvelope<ClassroomPeople | Record<string, unknown>>
    >(`/api/v2/class-room/classrooms/${classroomId}/people`, { method: "GET" });
  }

  async getClassroomResources(
    courseEnrollmentId: number | string,
    page = 1,
  ): Promise<{
    data?: ChatApiEnvelope<
      ClassroomPaginated<ClassroomResourcePost> | ClassroomResourcePost[]
    >;
    error?: ApiError;
  }> {
    return this.request<
      ChatApiEnvelope<
        ClassroomPaginated<ClassroomResourcePost> | ClassroomResourcePost[]
      >
    >(
      `/api/v2/class-room/classrooms/${courseEnrollmentId}/public/resources?page=${page}`,
      { method: "GET" },
    );
  }

  async getClassroomRecordings(
    courseEnrollmentId: number | string,
    page = 1,
  ): Promise<{
    data?: ChatApiEnvelope<
      ClassroomPaginated<ClassroomRecording> | ClassroomRecording[]
    >;
    error?: ApiError;
  }> {
    return this.request<
      ChatApiEnvelope<
        ClassroomPaginated<ClassroomRecording> | ClassroomRecording[]
      >
    >(
      `/api/v2/class-room/classrooms/${courseEnrollmentId}/public/recordings?page=${page}`,
      { method: "GET" },
    );
  }

  async getClassroomCalendar(
    courseEnrollmentId: number | string,
    params: { from?: string; to?: string; include?: string } = {},
  ): Promise<{
    data?: ChatApiEnvelope<ClassroomCalendarEvent[]>;
    error?: ApiError;
  }> {
    const search = new URLSearchParams();
    if (params.from) search.set("from", params.from);
    if (params.to) search.set("to", params.to);
    if (params.include) search.set("include", params.include);

    return this.request<ChatApiEnvelope<ClassroomCalendarEvent[]>>(
      `/api/v2/class-room/classrooms/${courseEnrollmentId}/public/calendar?${search.toString()}`,
      { method: "GET" },
    );
  }

  async getClassroomGrades(courseEnrollmentId: number | string): Promise<{
    data?: ChatApiEnvelope<ClassroomGrade[]>;
    error?: ApiError;
  }> {
    return this.request<ChatApiEnvelope<ClassroomGrade[]>>(
      `/api/v2/class-room/classrooms/${courseEnrollmentId}/public/grades`,
      { method: "GET" },
    );
  }

  async googleAuth(): Promise<{
    data?: LoginResponse["user"];
    error?: ApiError;
  }> {
    try {
      const redirectUrl = Linking.createURL("/(tabs)", {});
      const authSearch = new URLSearchParams({ redirect_uri: redirectUrl });
      const timezone = this.getClientTimezone();

      if (timezone) {
        authSearch.set("timezone", timezone);
      }

      const authUrl = `${this.baseURL.replace(
        "/api",
        "",
      )}/auth/google?${authSearch.toString()}`;

      const result = await WebBrowser.openAuthSessionAsync(
        authUrl,
        redirectUrl,
      );

      if (result.type === "success" && result.url) {
        try {
          const url = new URL(result.url);
          const token = url.searchParams.get("token");
          const error = url.searchParams.get("error");

          if (error) {
            return {
              error: {
                message: decodeURIComponent(error),
              },
            };
          }

          if (token) {
            await this.setToken(token);

            console.log("token", token);
            // Fetch user data after setting token
            const userResult = await this.getCurrentUser();
            if (userResult.data) {
              return { data: userResult.data };
            }
          }
        } catch (urlError) {
          // Handle case where URL might not be parseable
          console.log("urlError", urlError);
          return {
            error: {
              message: "Failed to process authentication response",
            },
          };
        }
      }

      return {
        error: {
          message: "Authentication was cancelled or failed",
        },
      };
    } catch (error) {
      return {
        error: {
          message:
            error instanceof Error
              ? error.message
              : "Google authentication failed",
        },
      };
    }
  }

  async appleAuth(): Promise<{
    data?: LoginResponse["user"];
    error?: ApiError;
  }> {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      const result = await this.request<LoginResponse>("/api/v2/auth/apple", {
        method: "POST",
        body: JSON.stringify({
          identity_token: credential.identityToken,
          user_identifier: credential.user,
          full_name: credential.fullName,
          email: credential.email,
        }),
      });

      if (result.error) return { error: result.error };

      if (result.data?.user) {
        return { data: result.data.user };
      }

      return { error: { message: "Apple sign in failed. Please try again." } };
    } catch (error: unknown) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code: string }).code === "ERR_REQUEST_CANCELED"
      ) {
        return { error: { message: "Sign in was cancelled." } };
      }
      return {
        error: {
          message:
            error instanceof Error
              ? error.message
              : "Apple authentication failed",
        },
      };
    }
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
