import { loginCredentialsType } from "@/types/api/login";
import { AuthStatus } from "@/types/api/auth";

function resolveApiBaseUrl(): string {
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

export const authApiLogin = async (
  credentials: loginCredentialsType
): Promise<AuthStatus> => {
  try {
    const apiBaseUrl = resolveApiBaseUrl();
    const response = await fetch(`${apiBaseUrl}/auth/login`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        username: credentials.username,
        password: credentials.password,
      }),
    });

    if (response.status === 401) {
      return "denied";
    }

    if (!response.ok) {
      return "error";
    }

    const data = await response.json().catch(() => null);
    const status = data?.status;

    if (status === "ok" || status === "denied") {
      return status;
    }

    return "error";
  } catch {
    return "error";
  }
};

export const authApiRefresh = async (): Promise<boolean> => {
  try {
    const apiBaseUrl = resolveApiBaseUrl();
    const response = await fetch(`${apiBaseUrl}/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    return response.ok || response.status === 204;
  } catch {
    return false;
  }
};

export const authApiLogout = async (): Promise<boolean> => {
  try {
    const apiBaseUrl = resolveApiBaseUrl();
    const response = await fetch(`${apiBaseUrl}/auth/logout`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    return response.ok || response.status === 204;
  } catch {
    return false;
  }
};

export default authApiLogin;
