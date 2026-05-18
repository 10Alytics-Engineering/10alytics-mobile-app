import * as AppleAuthentication from "expo-apple-authentication";
import * as Linking from "expo-linking";
import * as SecureStore from "expo-secure-store";
import * as WebBrowser from "expo-web-browser";
import { Platform } from "react-native";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000/api";

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
    options: RequestInit = {}
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

  async login(email: string, password: string): Promise<{
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
    password: string
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

  async googleAuth(): Promise<{
    data?: LoginResponse["user"];
    error?: ApiError;
  }> {
    try {
      const redirectUrl = Linking.createURL("/(tabs)", {});
      const authUrl = `${this.baseURL.replace(
        "/api",
        ""
      )}/auth/google?redirect_uri=${encodeURIComponent(redirectUrl)}`;

      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUrl);


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
