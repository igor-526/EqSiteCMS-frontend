import apiFetch from "./client";
import type { ApiResult } from "@/types/api/api";
import type {
  EmailOutDto,
  EmailSendConfirmationInDto,
  EmailWriteInDto,
} from "@/types/api/notifications";

function resolveApiBaseUrl(): string {
  const explicitUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    process.env.NEXT_PUBLIC_BACKEND_URL ??
    process.env.API_BASE_URL;

  if (explicitUrl) {
    const trimmed = explicitUrl.trim();

    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      return trimmed.replace(/\/+$/, "");
    }

    if (trimmed.startsWith("//")) {
      if (typeof window !== "undefined") {
        const protocol = window.location.protocol;
        return `${protocol}${trimmed.replace(/\/+$/, "")}`;
      }
      return `https:${trimmed.replace(/\/+$/, "")}`;
    }

    if (trimmed.startsWith("/")) {
      if (typeof window !== "undefined") {
        return `${window.location.origin}${trimmed.replace(/\/+$/, "")}`;
      }
      return `http://localhost:8001${trimmed.replace(/\/+$/, "")}`;
    }

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

export const confirmEmail = async (
  code: string,
): Promise<{ ok: boolean; status: number; detail?: string }> => {
  try {
    const apiBaseUrl = resolveApiBaseUrl();
    const response = await fetch(`${apiBaseUrl}/emails/confirm`, {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ code }),
    });

    if (response.ok) {
      return { ok: true, status: response.status };
    }

    const data = await response.json().catch(() => null);
    return {
      ok: false,
      status: response.status,
      detail: data?.detail || "Неизвестная ошибка",
    };
  } catch {
    return { ok: false, status: 0, detail: "Ошибка сети" };
  }
};

export const getMyEmail = (): Promise<ApiResult<EmailOutDto>> =>
  apiFetch<EmailOutDto>("/emails/me");

export const createEmail = (
  data: EmailWriteInDto,
): Promise<ApiResult<EmailOutDto>> =>
  apiFetch<EmailOutDto>("/emails", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateEmail = (
  data: EmailWriteInDto,
): Promise<ApiResult<EmailOutDto>> =>
  apiFetch<EmailOutDto>("/emails", {
    method: "PATCH",
    body: JSON.stringify(data),
  });

export const deleteEmail = (userId: string): Promise<ApiResult<null>> =>
  apiFetch<null>(`/emails/${userId}`, { method: "DELETE" });

export const sendEmailConfirmation = (
  data: EmailSendConfirmationInDto,
): Promise<ApiResult<null>> =>
  apiFetch<null>("/emails/send-confirmation", {
    method: "POST",
    body: JSON.stringify(data),
  });
