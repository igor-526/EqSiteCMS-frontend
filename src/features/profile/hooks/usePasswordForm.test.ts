import { http, HttpResponse } from "msw";
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { server } from "@/test/msw/server";
import { usePasswordForm } from "./usePasswordForm";
import { changePassword } from "@/api/user";

const apiUrl = (path: string) => `http://127.0.0.1/api${path}`;

const notificationMock = vi.hoisted(() => ({
  success: vi.fn(),
  error: vi.fn(),
  warning: vi.fn(),
  info: vi.fn(),
}));

vi.mock("@/hooks/useNotification", () => ({
  useNotification: () => notificationMock,
}));

describe("changePassword — API boundary", () => {
  it("returns success (null) on 204 from MSW", async () => {
    server.use(
      http.patch(
        apiUrl("/users/me/password"),
        () => new HttpResponse(null, { status: 204 }),
      ),
    );
    const result = await changePassword({
      current_password: "oldpass1",
      new_password: "newpass123",
      confirm_new_password: "newpass123",
    });
    expect(result.status).toBe("ok");
  });

  it("returns error on 400 (wrong current password)", async () => {
    server.use(
      http.patch(apiUrl("/users/me/password"), () =>
        HttpResponse.json({ detail: "Invalid credentials" }, { status: 400 }),
      ),
    );
    const result = await changePassword({
      current_password: "wrong",
      new_password: "newpass123",
      confirm_new_password: "newpass123",
    });
    expect(result.status).toBe("error");
  });

  it("returns error on 401", async () => {
    server.use(
      http.patch(apiUrl("/users/me/password"), () =>
        HttpResponse.json({ detail: "Not authenticated" }, { status: 401 }),
      ),
    );
    const result = await changePassword({
      current_password: "anything",
      new_password: "newpass123",
      confirm_new_password: "newpass123",
    });
    expect(result.status).toBe("error");
  });
});

describe("usePasswordForm — hook unit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("success change — shows success toast and clears fields", async () => {
    server.use(
      http.patch(
        apiUrl("/users/me/password"),
        () => new HttpResponse(null, { status: 204 }),
      ),
    );

    const { result } = renderHook(() => usePasswordForm());

    act(() => {
      result.current.setField("current_password", "OldPass1!");
      result.current.setField("new_password", "NewPass1!");
      result.current.setField("confirm_new_password", "NewPass1!");
    });

    await act(async () => {
      await result.current.changePassword();
    });

    expect(notificationMock.success).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Успешно" }),
    );
    expect(result.current.formState.current_password).toBe("");
    expect(result.current.formState.new_password).toBe("");
    expect(result.current.formState.confirm_new_password).toBe("");
  });

  it("wrong current password (400) — shows error toast, fields not cleared", async () => {
    server.use(
      http.patch(apiUrl("/users/me/password"), () =>
        HttpResponse.json({ detail: "Invalid credentials" }, { status: 400 }),
      ),
    );

    const { result } = renderHook(() => usePasswordForm());

    act(() => {
      result.current.setField("current_password", "WrongPass!");
      result.current.setField("new_password", "NewPass123!");
      result.current.setField("confirm_new_password", "NewPass123!");
    });

    await act(async () => {
      await result.current.changePassword();
    });

    expect(notificationMock.error).toHaveBeenCalled();
    expect(result.current.formState.current_password).toBe("WrongPass!");
    expect(result.current.formState.new_password).toBe("NewPass123!");
  });

  it("confirm mismatch — shows validation error, no API call", async () => {
    let apiCalled = false;
    server.use(
      http.patch(apiUrl("/users/me/password"), () => {
        apiCalled = true;
        return new HttpResponse(null, { status: 204 });
      }),
    );

    const { result } = renderHook(() => usePasswordForm());

    act(() => {
      result.current.setField("current_password", "OldPass1!");
      result.current.setField("new_password", "NewPass123!");
      result.current.setField("confirm_new_password", "DifferentPass!");
    });

    await act(async () => {
      await result.current.changePassword();
    });

    expect(notificationMock.error).toHaveBeenCalled();
    expect(apiCalled).toBe(false);
  });

  it("clear resets all fields", () => {
    const { result } = renderHook(() => usePasswordForm());

    act(() => {
      result.current.setField("current_password", "OldPass1!");
      result.current.setField("new_password", "NewPass123!");
      result.current.setField("confirm_new_password", "NewPass123!");
    });

    act(() => {
      result.current.clear();
    });

    expect(result.current.formState.current_password).toBe("");
    expect(result.current.formState.new_password).toBe("");
    expect(result.current.formState.confirm_new_password).toBe("");
  });

  it("passwordStrength computes correctly", () => {
    const { result } = renderHook(() => usePasswordForm());

    // Empty — 0
    expect(result.current.passwordStrength).toBe(0);

    // Only length criterion
    act(() => {
      result.current.setField("new_password", "abcdefgh");
    });
    expect(result.current.passwordStrength).toBe(1);

    // All 4 criteria: length + uppercase + digit + special
    act(() => {
      result.current.setField("new_password", "Abcdef1!");
    });
    expect(result.current.passwordStrength).toBe(4);
    expect(result.current.strengthLabel).toBe("Надёжный");
    expect(result.current.strengthColor).toBe("#006400");
  });
});
