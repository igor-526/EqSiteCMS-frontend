import { http, HttpResponse } from "msw";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { server } from "@/test/msw/server";
import { useProfileForm } from "./useProfileForm";
import { getMyProfile, updateProfile } from "@/api/user";
import type { UUID } from "crypto";

const apiUrl = (path: string) => `http://127.0.0.1/api${path}`;

const userId = "00000000-0000-4000-8000-000000000010" as UUID;
const equestrianId = "00000000-0000-4000-8000-000000000011" as UUID;

const mockProfile = {
  id: userId,
  equestrian_id: equestrianId,
  username: "cms-admin",
  first_name: "Иван",
  last_name: "Иванов",
  middle_name: "Петрович",
  equestrian_name: "Конюшня Звезда",
  created_at: "2026-05-01T00:00:00.000Z",
  updated_at: null,
  scopes: [],
};

const notificationMock = vi.hoisted(() => ({
  success: vi.fn(),
  error: vi.fn(),
  warning: vi.fn(),
  info: vi.fn(),
}));

const refreshUserMock = vi.hoisted(() => vi.fn());

vi.mock("@/hooks/useNotification", () => ({
  useNotification: () => notificationMock,
}));

vi.mock("@/contexts/UserContext", () => ({
  useUserContext: () => ({
    user: null,
    loading: false,
    error: null,
    scopes: [],
    refreshUser: refreshUserMock,
    clearUser: vi.fn(),
  }),
}));

describe("useProfileForm — API boundary", () => {
  it("getMyProfile returns success data from MSW", async () => {
    server.use(
      http.get(apiUrl("/users/me"), () => HttpResponse.json(mockProfile)),
    );
    const result = await getMyProfile();
    expect(result.status).toBe("ok");
    if (result.status === "ok") {
      expect(result.data?.username).toBe("cms-admin");
      expect(result.data?.equestrian_name).toBe("Конюшня Звезда");
    }
  });

  it("updateProfile returns updated data from MSW", async () => {
    const updated = { ...mockProfile, first_name: "Алексей" };
    server.use(
      http.patch(apiUrl("/users/me"), () => HttpResponse.json(updated)),
    );
    const result = await updateProfile({
      first_name: "Алексей",
      last_name: "Иванов",
      middle_name: null,
    });
    expect(result.status).toBe("ok");
    if (result.status === "ok") {
      expect(result.data?.first_name).toBe("Алексей");
    }
  });

  it("getMyProfile returns error on 401", async () => {
    server.use(
      http.get(apiUrl("/users/me"), () =>
        HttpResponse.json({ detail: "Not authenticated" }, { status: 401 }),
      ),
    );
    const result = await getMyProfile();
    expect(result.status).toBe("error");
  });
});

describe("useProfileForm — hook unit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads profile and populates form on mount", async () => {
    server.use(
      http.get(apiUrl("/users/me"), () => HttpResponse.json(mockProfile)),
    );

    const { result } = renderHook(() => useProfileForm());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.profile?.username).toBe("cms-admin");
    expect(result.current.formState.first_name).toBe("Иван");
    expect(result.current.formState.last_name).toBe("Иванов");
    expect(result.current.isDirty).toBe(false);
  });

  it("reset returns form to loaded values and clears isDirty", async () => {
    server.use(
      http.get(apiUrl("/users/me"), () => HttpResponse.json(mockProfile)),
    );

    const { result } = renderHook(() => useProfileForm());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.setField("first_name", "Измененное");
    });
    expect(result.current.isDirty).toBe(true);

    act(() => {
      result.current.reset();
    });
    expect(result.current.formState.first_name).toBe("Иван");
    expect(result.current.isDirty).toBe(false);
  });

  it("save calls updateProfile and shows success toast, clears isDirty", async () => {
    server.use(
      http.get(apiUrl("/users/me"), () => HttpResponse.json(mockProfile)),
      http.patch(apiUrl("/users/me"), () =>
        HttpResponse.json({ ...mockProfile, first_name: "Новый" }),
      ),
    );

    const { result } = renderHook(() => useProfileForm());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.setField("first_name", "Новый");
    });
    expect(result.current.isDirty).toBe(true);

    await act(async () => {
      await result.current.save();
    });

    expect(notificationMock.success).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Успешно" }),
    );
    expect(result.current.isDirty).toBe(false);
    expect(refreshUserMock).toHaveBeenCalled();
  });

  it("save shows error toast on backend error, does not clear isDirty", async () => {
    server.use(
      http.get(apiUrl("/users/me"), () => HttpResponse.json(mockProfile)),
      http.patch(apiUrl("/users/me"), () =>
        HttpResponse.json({ detail: "Server error" }, { status: 500 }),
      ),
    );

    const { result } = renderHook(() => useProfileForm());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.setField("first_name", "Другое");
    });

    await act(async () => {
      await result.current.save();
    });

    expect(notificationMock.error).toHaveBeenCalled();
    expect(result.current.isDirty).toBe(true);
  });
});
