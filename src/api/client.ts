import { ApiResult, DetailResponse } from "@/types/api/api";

export function addQueryParamsToUrl<T extends Record<string, unknown>>(
  url: string,
  params: T = {} as T
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

function resolveApiBaseUrl() {
  const explicitUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? 
    process.env.NEXT_PUBLIC_BACKEND_URL ?? 
    process.env.API_BASE_URL;
  
  if (explicitUrl) {
    const trimmed = explicitUrl.trim();
    
    // Если URL начинается с протокола, используем как есть
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      // Убираем завершающий слэш, если есть
      return trimmed.replace(/\/+$/, "");
    }
    
    // Если URL начинается с //, добавляем текущий протокол
    if (trimmed.startsWith("//")) {
      if (typeof window !== "undefined") {
        const protocol = window.location.protocol;
        return `${protocol}${trimmed.replace(/\/+$/, "")}`;
      }
      return `https:${trimmed.replace(/\/+$/, "")}`;
    }
    
    // Если URL начинается со слэша, это относительный путь - используем текущий origin
    if (trimmed.startsWith("/")) {
      if (typeof window !== "undefined") {
        return `${window.location.origin}${trimmed.replace(/\/+$/, "")}`;
      }
      return `http://localhost:8001${trimmed.replace(/\/+$/, "")}`;
    }
    
    // Иначе это домен без протокола - добавляем протокол
    if (typeof window !== "undefined") {
      const protocol = window.location.protocol;
      return `${protocol}//${trimmed.replace(/\/+$/, "")}`;
    }
    
    return `https://${trimmed.replace(/\/+$/, "")}`;
  }

  if (typeof window !== "undefined") {
    const { protocol, hostname, port } = window.location;

    const configuredPort = process.env.NEXT_PUBLIC_API_PORT;
    const backendPort =
      configuredPort && configuredPort.trim() !== ""
        ? configuredPort
        : port && port !== "" && port !== "3000"
          ? port
          : "8001";

    const normalizedPort =
      (protocol === "http:" && backendPort === "80") ||
      (protocol === "https:" && backendPort === "443")
        ? ""
        : `:${backendPort}`;

    return `${protocol}//${hostname}${normalizedPort}/api`;
  }

  return "http://localhost:8001/api";
}

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

async function attemptRefresh(): Promise<boolean> {
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
  options?: RequestInit
): Promise<ApiResult<T>> {
  const apiBaseUrl = resolveApiBaseUrl();
  const url = `${apiBaseUrl}${path}`;

  try {
    const credentials =
      options?.credentials ?? (typeof window === "undefined" ? undefined : "include");
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
      return { status: "ok", data: null as unknown as T };
    }

    const raw = await res.text(); // не кидает
    const parsed = raw ? safeJson(raw) : null;

    if (res.ok) {
      return { status: "ok", data: (parsed as T) ?? (null as unknown as T) };
    }

    if (res.status === 401 && path !== "/auth/refresh" && typeof window !== "undefined") {
      // Не пытаемся refresh если это запрос verify с корневой страницы
      // (чтобы избежать цикла)
      const currentPath = window.location.pathname;
      if (currentPath === "/" && path === "/auth/verify") {
        return { status: "error", data: { detail: "Authentication required" } };
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
          return { status: "ok", data: null as unknown as T };
        }

        const retryRaw = await retryRes.text();
        const retryParsed = retryRaw ? safeJson(retryRaw) : null;

        if (retryRes.ok) {
          return { status: "ok", data: (retryParsed as T) ?? (null as unknown as T) };
        }

        const retryDetail =
          (retryParsed as DetailResponse | null)?.detail ||
          (retryRaw?.trim() || retryRes.statusText || "Request failed");

        return { status: "error", data: { detail: retryDetail } };
      }
      return { status: "error", data: { detail: "Authentication failed" } };
    }

    const detail =
      (parsed as DetailResponse | null)?.detail ||
      (raw?.trim() || res.statusText || "Request failed");

    return { status: "error", data: { detail } };
  } catch {
    // сюда попадём при CORS/сети или если вдруг наш safeJson упадёт (не упадёт)
    return { status: "error", data: { detail: "Network error or invalid JSON" } };
  }
}

export async function apiFetchFormData<T>(
  path: string,
  formData: FormData,
  options?: RequestInit
): Promise<ApiResult<T>> {
  const apiBaseUrl = resolveApiBaseUrl();
  const url = `${apiBaseUrl}${path}`;

  try {
    const credentials =
      options?.credentials ?? (typeof window === "undefined" ? undefined : "include");
    
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
      return { status: "ok", data: null as unknown as T };
    }

    const raw = await res.text();
    const parsed = raw ? safeJson(raw) : null;

    if (res.ok) {
      return { status: "ok", data: (parsed as T) ?? (null as unknown as T) };
    }

    if (res.status === 401 && path !== "/auth/refresh" && typeof window !== "undefined") {
      const currentPath = window.location.pathname;
      if (currentPath === "/" && path === "/auth/verify") {
        return { status: "error", data: { detail: "Authentication required" } };
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
          return { status: "ok", data: null as unknown as T };
        }

        const retryRaw = await retryRes.text();
        const retryParsed = retryRaw ? safeJson(retryRaw) : null;

        if (retryRes.ok) {
          return { status: "ok", data: (retryParsed as T) ?? (null as unknown as T) };
        }

        const retryDetail =
          (retryParsed as DetailResponse | null)?.detail ||
          (retryRaw?.trim() || retryRes.statusText || "Request failed");

        return { status: "error", data: { detail: retryDetail } };
      }
      return { status: "error", data: { detail: "Authentication failed" } };
    }

    const detail =
      (parsed as DetailResponse | null)?.detail ||
      (raw?.trim() || res.statusText || "Request failed");

    return { status: "error", data: { detail } };
  } catch {
    return { status: "error", data: { detail: "Network error or invalid JSON" } };
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
