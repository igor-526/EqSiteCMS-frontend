import { apiError, apiSuccess } from "@/lib/apiStatus";
import { resolveApiBaseUrl } from "@/lib/apiBaseUrl";
import { ApiResult, DetailResponse } from "@/types/api/api";

export function addQueryParamsToUrl<T extends Record<string, unknown>>(
  url: string,
  params: T = {} as T,
) {
  const hashIndex = url.indexOf("#");
  const hasHash = hashIndex >= 0;

  const withoutHash = hasHash ? url.slice(0, hashIndex) : url;
  const hash = hasHash ? url.slice(hashIndex) : "";

  const [path, initialQuery = ""] = withoutHash.split("?");
  const searchParams = new URLSearchParams(initialQuery);

  for (const [key, value] of Object.entries(params)) {
    if (value == null) continue;

    if (Array.isArray(value)) {
      searchParams.delete(key);
      for (const item of value) {
        if (item != null) {
          searchParams.append(key, String(item));
        }
      }
      continue;
    }

    searchParams.set(key, String(value));
  }

  const queryString = searchParams.toString();
  const queryPart = queryString ? `?${queryString}` : "";

  return `${path}${queryPart}${hash}`;
}

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

export async function attemptRefresh(): Promise<boolean> {
  if (isRefreshing && refreshPromise) {
    return await refreshPromise;
  }

  if (typeof window === "undefined") {
    return false;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const apiBaseUrl = resolveApiBaseUrl();
      const refreshUrl = `${apiBaseUrl}/auth/refresh`;
      const res = await fetch(refreshUrl, {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      if (res.ok || res.status === 204) {
        return true;
      }

      const currentPath = window.location.pathname;
      if (currentPath !== "/login" && currentPath !== "/") {
        window.location.href = "/login";
      }
      return false;
    } catch {
      const currentPath = window.location.pathname;
      if (currentPath !== "/login" && currentPath !== "/") {
        window.location.href = "/login";
      }
      return false;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return await refreshPromise;
}

export default async function apiFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<ApiResult<T>> {
  const apiBaseUrl = resolveApiBaseUrl();
  const url = `${apiBaseUrl}${path}`;

  try {
    const credentials =
      options?.credentials ??
      (typeof window === "undefined" ? undefined : "include");
    const res = await fetch(url, {
      ...options,
      credentials,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...normalizeHeaders(options?.headers),
      },
    });

    // 204/205 без тела
    if (res.status === 204 || res.status === 205) {
      return apiSuccess(null as unknown as T);
    }

    const raw = await res.text(); // не кидает
    const parsed = raw ? safeJson(raw) : null;

    if (res.ok) {
      return apiSuccess((parsed as T) ?? (null as unknown as T));
    }

    if (
      res.status === 401 &&
      path !== "/auth/refresh" &&
      typeof window !== "undefined"
    ) {
      // Не пытаемся refresh если это запрос verify с корневой страницы
      // (чтобы избежать цикла)
      const currentPath = window.location.pathname;
      if (currentPath === "/" && path === "/auth/verify") {
        return apiError("Authentication required");
      }

      const refreshSuccess = await attemptRefresh();
      if (refreshSuccess) {
        // Повторяем оригинальный запрос после успешного refresh
        const retryRes = await fetch(url, {
          ...options,
          credentials,
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            ...normalizeHeaders(options?.headers),
          },
        });

        if (retryRes.status === 204 || retryRes.status === 205) {
          return apiSuccess(null as unknown as T);
        }

        const retryRaw = await retryRes.text();
        const retryParsed = retryRaw ? safeJson(retryRaw) : null;

        if (retryRes.ok) {
          return apiSuccess((retryParsed as T) ?? (null as unknown as T));
        }

        const retryDetail =
          (retryParsed as DetailResponse | null)?.detail ||
          retryRaw?.trim() ||
          retryRes.statusText ||
          "Request failed";

        return apiError(retryDetail);
      }
      return apiError("Authentication failed");
    }

    const detail =
      (parsed as DetailResponse | null)?.detail ||
      raw?.trim() ||
      res.statusText ||
      "Request failed";

    return apiError(detail);
  } catch {
    // сюда попадём при CORS/сети или если вдруг наш safeJson упадёт (не упадёт)
    return apiError("Network error or invalid JSON");
  }
}

export async function apiFetchFormData<T>(
  path: string,
  formData: FormData,
  options?: RequestInit,
): Promise<ApiResult<T>> {
  const apiBaseUrl = resolveApiBaseUrl();
  const url = `${apiBaseUrl}${path}`;

  try {
    const credentials =
      options?.credentials ??
      (typeof window === "undefined" ? undefined : "include");

    const headers: Record<string, string> = {
      Accept: "application/json",
    };

    if (options?.headers) {
      const normalized = normalizeHeaders(options.headers);
      Object.assign(headers, normalized);
    }

    const res = await fetch(url, {
      ...options,
      method: options?.method ?? "POST",
      credentials,
      headers,
      body: formData,
    });

    if (res.status === 204 || res.status === 205) {
      return apiSuccess(null as unknown as T);
    }

    const raw = await res.text();
    const parsed = raw ? safeJson(raw) : null;

    if (res.ok) {
      return apiSuccess((parsed as T) ?? (null as unknown as T));
    }

    if (
      res.status === 401 &&
      path !== "/auth/refresh" &&
      typeof window !== "undefined"
    ) {
      const currentPath = window.location.pathname;
      if (currentPath === "/" && path === "/auth/verify") {
        return apiError("Authentication required");
      }

      const refreshSuccess = await attemptRefresh();
      if (refreshSuccess) {
        const retryRes = await fetch(url, {
          ...options,
          method: options?.method ?? "POST",
          credentials,
          headers,
          body: formData,
        });

        if (retryRes.status === 204 || retryRes.status === 205) {
          return apiSuccess(null as unknown as T);
        }

        const retryRaw = await retryRes.text();
        const retryParsed = retryRaw ? safeJson(retryRaw) : null;

        if (retryRes.ok) {
          return apiSuccess((retryParsed as T) ?? (null as unknown as T));
        }

        const retryDetail =
          (retryParsed as DetailResponse | null)?.detail ||
          retryRaw?.trim() ||
          retryRes.statusText ||
          "Request failed";

        return apiError(retryDetail);
      }
      return apiError("Authentication failed");
    }

    const detail =
      (parsed as DetailResponse | null)?.detail ||
      raw?.trim() ||
      res.statusText ||
      "Request failed";

    return apiError(detail);
  } catch {
    return apiError("Network error or invalid JSON");
  }
}

function normalizeHeaders(headers?: HeadersInit): Record<string, string> {
  if (!headers) {
    return {};
  }

  if (headers instanceof Headers) {
    return Object.fromEntries(headers.entries());
  }

  if (Array.isArray(headers)) {
    return Object.fromEntries(headers);
  }

  return headers;
}

function safeJson(s: string) {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}
