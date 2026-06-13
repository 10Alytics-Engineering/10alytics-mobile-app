import * as AppleAuthentication from "expo-apple-authentication";
import * as Linking from "expo-linking";
import * as SecureStore from "expo-secure-store";
import * as WebBrowser from "expo-web-browser";
import { Platform } from "react-native";

import { API_BASE_URL } from "@/lib/api-url";

const TIMEZONE_HEADER = "X-Timezone";

// Complete the OAuth flow
WebBrowser.maybeCompleteAuthSession();

interface LoginResponse {
  user: MobileUser;
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

export interface RegisterPayload {
  first_name: string;
  other_names: string;
  email: string;
  password: string;
  phone: string;
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

export interface CourseBenefit {
  id: number;
  title: string;
}

/**
 * Public course-catalog row from `GET /api/courses`.
 * `id` is the catalog course id — matches `UserCourse.course_id`.
 */
export interface Course {
  id: number;
  title: string;
  slug: string;
  short_code: string | null;
  tagline: string | null;
  description: string | null;
  image: string | null;
  level: string | null;
  duration: string | null;
  language: string | null;
  no_of_projects: string | null;
  price: number | null;
  usd_amount: number | null;
  gbp_amount: number | null;
  enrolled_students_count?: number;
  course_benefits?: CourseBenefit[];
  full_link: string | null;
  half_link: string | null;
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

/** Generic `{ status, message, data }` envelope used by the mobile course endpoints. */
export interface StatusEnvelope<T> {
  status: string;
  message: string;
  data: T;
}

/** Generic `{ success, message, data }` envelope used by `HttpResponses`-trait endpoints. */
export type ApiEnvelope<T> = ChatApiEnvelope<T>;

// --- Gamification (leaderboard / streak / xp) ---

export interface CourseLeaderboardEntry {
  user_id: number;
  name: string;
  xp_points: number;
}

export interface CourseLeaderboardData {
  course_id: number;
  course_cohort_id: number;
  user_rank: number | null;
  user_xp: number;
  leaderboard: CourseLeaderboardEntry[];
}

export interface WeeklyStreakStats {
  course_id: number;
  course_cohort_id: number;
  current_streak: number;
  weekly_completed_lessons: number;
  total_completed_lessons: number;
  total_lessons: number;
  completion_rate: number;
  completed_weeks: number;
}

export interface CourseXp {
  course_id: number;
  course_cohort_id: number;
  xp_points: number;
}

/** Optional course/cohort scoping for gamification endpoints. Omit to use latest enrollment. */
export interface GamificationScope {
  course_id?: number;
  cohort_id?: number;
}

// --- Billing (read-only) ---

export interface BillingCardInfo {
  cardType: string;
  last4Digits: string;
  expiryDate: string;
}

export interface BillingHistoryItem {
  id: number;
  invoiceNo: string;
  amountPaid: number;
  paymentDate: string | null;
  amountDue: number;
  paymentPlan: number | null;
  currency: string | null;
  course: string | null;
  status: string;
  stripe_invoice_id?: string | null;
  stripe_payment_intent_id?: string | null;
}

export interface BillingInfo {
  paymentHistory: BillingHistoryItem[];
  upcomingBillId: number | null;
  nextPaymentDate: string | null;
  upcomingBillAmount: number;
  isPaymentDatePastDue?: boolean;
  billingInfo: BillingCardInfo;
}

// --- Notification preferences ---

export interface NotificationPreferences {
  push_chat: boolean;
  push_classroom: boolean;
  push_assignments: boolean;
  email_updates: boolean;
}

// --- Profile ---

/** Full current-user shape from `GET /api/v2/user` (UserResource). */
export interface MobileUser {
  id: string | number;
  first_name: string;
  other_names: string;
  name?: string;
  email: string;
  phone?: string | null;
  /** Class time (stored server-side as `saturday_schedule`). */
  saturday_schedule?: string | null;
  avatar?: string;
  image?: string;
}

export interface UpdateProfilePayload {
  first_name: string;
  other_names: string;
  phone: string;
  /** Class time. */
  saturday_schedule?: string | null;
}

// --- Password reset ---

export interface ResetPasswordPayload {
  email: string;
  otp: string;
  password: string;
  password_confirmation: string;
}

// --- Assignment submission ---

/** A file picked on-device, ready for multipart upload. */
export interface UploadFile {
  uri: string;
  name: string;
  type: string;
}

export interface SubmitAssignmentPayload {
  courseEnrollmentId: number | string;
  assignmentId: number | string;
  submission_text?: string | null;
  submission_link?: string | null;
  files?: UploadFile[];
}

/** Submission row returned by the public submit / turn-in endpoints. */
export interface ClassroomSubmissionResponse {
  id: number | string;
  classroom_assignment_id?: number | string;
  status?: string | null;
  submission_text?: string | null;
  submission_link?: string | null;
  score_earned?: number | null;
  feedback?: string | null;
  submitted_at?: string | null;
  attachments?: ClassroomAttachment[];
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

      // Let fetch set the multipart boundary itself for FormData uploads.
      if (typeof FormData !== "undefined" && options.body instanceof FormData) {
        delete (headers as Record<string, string>)["Content-Type"];
      }

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      const responseText = await response.text();
      let responseData: unknown = {};

      if (responseText) {
        try {
          responseData = JSON.parse(responseText);
        } catch {
          responseData = { message: responseText };
        }
      }

      if (!response.ok) {
        const errorData: Partial<ApiError> | undefined =
          responseData && typeof responseData === "object"
            ? (responseData as Partial<ApiError>)
            : undefined;

        return {
          error: {
            message:
              errorData?.message ||
              `Request failed with status ${response.status}`,
            errors: errorData?.errors,
          },
        };
      }

      // Handle token storage for login/register
      if (
        (endpoint.includes("/login") || endpoint.includes("/register")) &&
        responseData &&
        typeof responseData === "object" &&
        "token" in responseData &&
        typeof (responseData as { token?: unknown }).token === "string"
      ) {
        await this.setToken((responseData as { token: string }).token);
      }

      return { data: responseData as T };
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

  async register(payload: RegisterPayload): Promise<{
    data?: MobileUser;
    error?: ApiError;
  }> {
    return this.request<MobileUser>("/api/v2/register", {
      method: "POST",
      body: JSON.stringify(payload),
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
    data?: MobileUser;
    error?: ApiError;
  }> {
    return this.request<MobileUser>("/api/v2/user", {
      method: "GET",
    });
  }

  /** Update the user's profile (first name, other names, phone). Returns 200 with no body. */
  async updateProfile(payload: UpdateProfilePayload): Promise<{
    data?: unknown;
    error?: ApiError;
  }> {
    return this.request("/api/v2/user/update-profile", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  /** Request a password-reset OTP by email. Always succeeds (no account enumeration). */
  async forgotPassword(email: string): Promise<{
    data?: { message: string };
    error?: ApiError;
  }> {
    return this.request<{ message: string }>("/api/v2/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }

  /** Reset the password using the emailed OTP. */
  async resetPassword(payload: ResetPasswordPayload): Promise<{
    data?: { message: string };
    error?: ApiError;
  }> {
    return this.request<{ message: string }>("/api/v2/reset-password", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  /**
   * Mark a lesson as completed. `enrollmentId` is the `CourseEnrolled.id`
   * (i.e. `UserCourse.id`), not the catalog course id. Also bumps XP server-side.
   */
  async markLessonComplete(
    enrollmentId: number,
    lessonId: number,
  ): Promise<{ data?: unknown; error?: ApiError }> {
    return this.request("/api/courses/markCourseLessonAsComplete", {
      method: "POST",
      body: JSON.stringify({ course_id: enrollmentId, lesson_id: lessonId }),
    });
  }

  /** Completed lesson ids for an enrollment. Returns a bare array of lesson ids. */
  async getCompletedVideos(enrollmentId: number): Promise<{
    data?: number[];
    error?: ApiError;
  }> {
    return this.request<number[]>(
      `/api/course/${enrollmentId}/getCompletedVideos`,
      { method: "GET" },
    );
  }

  /** Submit (save) work for a classroom assignment. Supports text, link, and file uploads. */
  async submitAssignment(payload: SubmitAssignmentPayload): Promise<{
    data?: ChatApiEnvelope<ClassroomSubmissionResponse>;
    error?: ApiError;
  }> {
    const form = new FormData();
    if (payload.submission_text != null) {
      form.append("submission_text", payload.submission_text);
    }
    if (payload.submission_link != null) {
      form.append("submission_link", payload.submission_link);
    }
    for (const file of payload.files ?? []) {
      form.append("files[]", {
        uri: file.uri,
        name: file.name,
        type: file.type,
      } as unknown as Blob);
    }

    return this.request<ChatApiEnvelope<ClassroomSubmissionResponse>>(
      `/api/v2/class-room/classrooms/${payload.courseEnrollmentId}/public/assignments/${payload.assignmentId}/submissions`,
      { method: "POST", body: form },
    );
  }

  /** Finalise (turn in) a saved submission for grading. */
  async turnInSubmission(
    courseEnrollmentId: number | string,
    submissionId: number | string,
  ): Promise<{
    data?: ChatApiEnvelope<ClassroomSubmissionResponse>;
    error?: ApiError;
  }> {
    return this.request<ChatApiEnvelope<ClassroomSubmissionResponse>>(
      `/api/v2/class-room/classrooms/${courseEnrollmentId}/public/submissions/${submissionId}/turn-in`,
      { method: "POST" },
    );
  }

  async getUserCourses(): Promise<{
    data?: UserCoursesApiResponse;
    error?: ApiError;
  }> {
    return this.request<UserCoursesApiResponse>("/api/v2/user/courses", {
      method: "GET",
    });
  }

  /** Public course catalog. Responds with a bare array of courses. */
  async getCourses(): Promise<{
    data?: Course[];
    error?: ApiError;
  }> {
    return this.request<Course[]>("/api/courses", {
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

  private buildScopeQuery(scope?: GamificationScope): string {
    if (!scope) return "";
    const params = new URLSearchParams();
    if (scope.course_id != null)
      params.set("course_id", String(scope.course_id));
    if (scope.cohort_id != null)
      params.set("cohort_id", String(scope.cohort_id));
    const query = params.toString();
    return query ? `?${query}` : "";
  }

  /** Course leaderboard + current user's rank/xp. Server-cached ~60s. */
  async getCourseLeaderboard(scope?: GamificationScope): Promise<{
    data?: StatusEnvelope<CourseLeaderboardData>;
    error?: ApiError;
  }> {
    return this.request<StatusEnvelope<CourseLeaderboardData>>(
      `/api/v2/user/courses/leaderboard${this.buildScopeQuery(scope)}`,
      { method: "GET" },
    );
  }

  /** Weekly streak + lesson-completion stats for the dashboard. */
  async getWeeklyStreakStats(scope?: GamificationScope): Promise<{
    data?: StatusEnvelope<WeeklyStreakStats>;
    error?: ApiError;
  }> {
    return this.request<StatusEnvelope<WeeklyStreakStats>>(
      `/api/v2/user/courses/weekly-stats${this.buildScopeQuery(scope)}`,
      { method: "GET" },
    );
  }

  /** Current user's XP for a course/cohort. */
  async getCourseXp(scope?: GamificationScope): Promise<{
    data?: StatusEnvelope<CourseXp>;
    error?: ApiError;
  }> {
    return this.request<StatusEnvelope<CourseXp>>(
      `/api/v2/user/courses/xp${this.buildScopeQuery(scope)}`,
      { method: "GET" },
    );
  }

  /** Read-only billing summary: next payment, saved card, payment history. */
  async getBillingInfo(): Promise<{
    data?: ApiEnvelope<BillingInfo>;
    error?: ApiError;
  }> {
    return this.request<ApiEnvelope<BillingInfo>>("/api/user/billing-info", {
      method: "GET",
    });
  }

  /** Read-only list of the user's invoices / payment plans. */
  async getUserPaymentPlans(): Promise<{
    data?: ApiEnvelope<unknown[]>;
    error?: ApiError;
  }> {
    return this.request<ApiEnvelope<unknown[]>>("/api/user/payment-plans", {
      method: "GET",
    });
  }

  /** Current user's notification preferences (merged over server defaults). */
  async getNotificationPreferences(): Promise<{
    data?: ApiEnvelope<NotificationPreferences>;
    error?: ApiError;
  }> {
    return this.request<ApiEnvelope<NotificationPreferences>>(
      "/api/v2/user/notification-preferences",
      { method: "GET" },
    );
  }

  /** Update one or more notification preference toggles. */
  async updateNotificationPreferences(
    payload: Partial<NotificationPreferences>,
  ): Promise<{
    data?: ApiEnvelope<NotificationPreferences>;
    error?: ApiError;
  }> {
    return this.request<ApiEnvelope<NotificationPreferences>>(
      "/api/v2/user/notification-preferences",
      { method: "PUT", body: JSON.stringify(payload) },
    );
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
