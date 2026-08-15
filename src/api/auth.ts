import { loginCredentialsType } from "@/types/api/login";
import { AUTH_STATUS, AuthStatus } from "@/types/api/auth";
import { resolveApiBaseUrl } from "@/lib/apiBaseUrl";
import { attemptRefresh } from "@/api/client";

export const authApiLogin = async (
  credentials: loginCredentialsType,
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
      return AUTH_STATUS.DENIED;
    }

    if (!response.ok) {
      return AUTH_STATUS.ERROR;
    }

    const data = await response.json().catch(() => null);
    const status = data?.status;

    if (status === AUTH_STATUS.OK || status === AUTH_STATUS.DENIED) {
      return status;
    }

    return AUTH_STATUS.ERROR;
  } catch {
    return AUTH_STATUS.ERROR;
  }
};

export const authApiRefresh = async (): Promise<boolean> => {
  return attemptRefresh();
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
