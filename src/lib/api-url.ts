const DEFAULT_API_ORIGIN = "http://localhost:8000";

/** Backend origin without a trailing `/api`; request paths already include it. */
export function normalizeApiBaseUrl(value?: string | null): string {
  const raw = (value?.trim() || DEFAULT_API_ORIGIN).replace(/\/+$/, "");
  return raw.replace(/\/api$/i, "") || DEFAULT_API_ORIGIN;
}

export const API_BASE_URL = normalizeApiBaseUrl(
  process.env.EXPO_PUBLIC_API_URL,
);
