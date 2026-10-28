import React from "react";
import { act, renderHook, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { apiError, apiSuccess } from "@/lib/apiStatus";
import { KNOWN_USER_SCOPES } from "@/types/api/user";
import { renderWithCmsProviders } from "@/test/render";
import * as service from "../services/seoService";
import { YandexAccountStep } from "../ui/YandexAccountStep";
import { useYandexOAuthPopup } from "./useYandexOAuthPopup";

const context = vi.hoisted(() => ({ scopes: [] as KNOWN_USER_SCOPES[] }));
vi.mock("@/contexts/UserContext", () => ({ useUserContext: () => context }));
vi.mock("@/hooks/useNotification", () => ({ useNotification: () => ({ success: vi.fn() }) }));
const popup = { closed: false, focus: vi.fn() };
const source = popup as unknown as Window;
const message = (status = "success", origin = window.location.origin, type = "eqsite:yandex-oauth", sender = source) => {
  window.dispatchEvent(new MessageEvent("message", { origin, source: sender, data: { type, status } }));
};
beforeEach(() => {
  context.scopes = [KNOWN_USER_SCOPES.SEO];
  popup.closed = false;
  popup.focus.mockClear();
  vi.spyOn(window, "open").mockReturnValue(source);
  vi.spyOn(service, "fetchYandexAuthLink").mockResolvedValue(apiSuccess({ auth_link: "https://oauth.yandex.ru/authorize" }));
});
afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks(); });

describe("FT-YX-12 popup", () => {
  it("opens 600x700 with opener, focuses existing window, accepts success once", async () => {
    const refresh = vi.fn();
    const { result } = renderHook(() => useYandexOAuthPopup(refresh));
    await act(() => result.current.open());
    expect(window.open).toHaveBeenCalledWith("https://oauth.yandex.ru/authorize", "eqsite-yandex-oauth", "popup,width=600,height=700");
    expect(result.current.waiting).toBe(true);
    await act(() => result.current.open());
    expect(popup.focus).toHaveBeenCalledOnce();
    expect(service.fetchYandexAuthLink).toHaveBeenCalledOnce();
    act(() => { message(); message(); });
    expect(refresh).toHaveBeenCalledOnce();
    expect(result.current.waiting).toBe(false);
  });
  it("ignores foreign origin, type, popup source and unsupported status", async () => {
    const refresh = vi.fn();
    const { result } = renderHook(() => useYandexOAuthPopup(refresh));
    await act(() => result.current.open());
    act(() => {
      message("success", "https://foreign.invalid");
      message("success", window.location.origin, "other");
      message("success", window.location.origin, "eqsite:yandex-oauth", window);
      message("unknown");
    });
    expect(refresh).not.toHaveBeenCalled();
    expect(result.current.waiting).toBe(true);
  });
  it.each(["error", "cancelled"])("settles %s without claiming backend success", async (status) => {
    const refresh = vi.fn();
    const { result } = renderHook(() => useYandexOAuthPopup(refresh));
    await act(() => result.current.open());
    act(() => message(status));
    expect(result.current.waiting).toBe(false);
    expect(result.current.error).toBeTruthy();
    expect(refresh).not.toHaveBeenCalled();
  });
  it("handles blocked popup and allows retry", async () => {
    vi.mocked(window.open).mockReturnValueOnce(null);
    const { result } = renderHook(() => useYandexOAuthPopup(vi.fn()));
    await act(() => result.current.open());
    expect(result.current.error).toMatch(/заблокировано/);
    expect(result.current.waiting).toBe(false);
    await act(() => result.current.open());
    expect(result.current.error).toBeNull();
    expect(result.current.waiting).toBe(true);
  });
  it.each([apiError("Forbidden"), apiError("Unauthorized"), apiSuccess(null)])("handles link denial/empty without opening", async (response) => {
    vi.mocked(service.fetchYandexAuthLink).mockResolvedValue(response);
    const { result } = renderHook(() => useYandexOAuthPopup(vi.fn()));
    await act(() => result.current.open());
    expect(window.open).not.toHaveBeenCalled();
    expect(result.current.error).toMatch(/ссылку/);
    expect(result.current.waiting).toBe(false);
  });
  it("handles thrown link errors", async () => {
    vi.mocked(service.fetchYandexAuthLink).mockRejectedValue(new Error("network"));
    const { result } = renderHook(() => useYandexOAuthPopup(vi.fn()));
    await act(() => result.current.open());
    expect(result.current.error).toMatch(/открыть/);
    expect(result.current.waiting).toBe(false);
  });
  it("polls closed every 500ms, supports another attempt and cleans listeners/timers", async () => {
    vi.useFakeTimers();
    const refresh = vi.fn();
    const { result, unmount } = renderHook(() => useYandexOAuthPopup(refresh));
    await act(() => result.current.open());
    popup.closed = true;
    act(() => vi.advanceTimersByTime(500));
    expect(refresh).toHaveBeenCalledOnce();
    expect(result.current.waiting).toBe(false);
    popup.closed = false;
    await act(() => result.current.open());
    popup.closed = true;
    act(() => vi.advanceTimersByTime(500));
    expect(refresh).toHaveBeenCalledTimes(2);
    unmount();
    act(() => { message(); vi.advanceTimersByTime(1000); });
    expect(refresh).toHaveBeenCalledTimes(2);
    expect(vi.getTimerCount()).toBe(0);
  });
  it("rechecks permission after link resolves and guards parallel open/unmount", async () => {
    let release!: (value: Awaited<ReturnType<typeof service.fetchYandexAuthLink>>) => void;
    vi.mocked(service.fetchYandexAuthLink).mockImplementation(() => new Promise((resolve) => { release = resolve; }));
    const { result, rerender, unmount } = renderHook(() => useYandexOAuthPopup(vi.fn()));
    let request!: Promise<void>;
    act(() => { request = result.current.open(); void result.current.open(); });
    expect(service.fetchYandexAuthLink).toHaveBeenCalledOnce();
    context.scopes = [];
    rerender();
    await act(async () => { release(apiSuccess({ auth_link: "https://oauth.yandex.ru" })); await request; });
    expect(window.open).not.toHaveBeenCalled();
    await act(() => result.current.open());
    expect(service.fetchYandexAuthLink).toHaveBeenCalledOnce();
    context.scopes = [KNOWN_USER_SCOPES.SEO];
    rerender();
    act(() => { request = result.current.open(); });
    unmount();
    await act(async () => { release(apiSuccess({ auth_link: "https://oauth.yandex.ru" })); await request; });
    expect(window.open).not.toHaveBeenCalled();
  });
  it("integrates add without waiting banner, focus and refresh at offset0 after success/closure", async () => {
    const list = vi.spyOn(service, "fetchYandexAccounts").mockResolvedValue(apiSuccess({ items: [], total: 0 }));
    renderWithCmsProviders(<YandexAccountStep selectedAccount={null} onSelect={vi.fn()} onConnectionChange={vi.fn()} />);
    await waitFor(() => expect(list).toHaveBeenCalledOnce());
    const add = screen.getByRole("button", { name: "Добавить аккаунт" });
    await userEvent.click(add);
    expect(screen.queryByText(/Ожидание авторизации/)).not.toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(add).toBeEnabled();
    await userEvent.click(add);
    expect(popup.focus).toHaveBeenCalledOnce();
    expect(service.fetchYandexAuthLink).toHaveBeenCalledOnce();
    expect(window.open).toHaveBeenCalledOnce();
    act(() => message());
    await waitFor(() => expect(list).toHaveBeenCalledTimes(2));
    expect(list).toHaveBeenLastCalledWith({ limit: 20, offset: 0 });
    expect(screen.queryByText(/Ожидание авторизации/)).not.toBeInTheDocument();
    await userEvent.click(add);
    popup.closed = true;
    await waitFor(() => expect(list).toHaveBeenCalledTimes(3));
    expect(list).toHaveBeenLastCalledWith({ limit: 20, offset: 0 });
  });
});

describe("FE-Y02/03 SEO popup access lifetime", () => {
  it.each([[], [KNOWN_USER_SCOPES.ADMIN], [KNOWN_USER_SCOPES.SUPERUSER], [KNOWN_USER_SCOPES.DEVELOPER]])("denies non-SEO roles %j with SEO text", async (...scopes) => {
    context.scopes = scopes;
    const { result } = renderHook(() => useYandexOAuthPopup(vi.fn()));
    await act(() => result.current.open());
    expect(service.fetchYandexAuthLink).not.toHaveBeenCalled();
    expect(window.open).not.toHaveBeenCalled();
    expect(result.current.error).toBe("Недостаточно прав. Требуется роль SEO.");
  });

  it("ignores messages and closure after revoke, including after regrant", async () => {
    vi.useFakeTimers();
    const refresh = vi.fn();
    const { result, rerender } = renderHook(() => useYandexOAuthPopup(refresh));
    await act(() => result.current.open());
    const staleOpen = result.current.open;
    context.scopes = [KNOWN_USER_SCOPES.ADMIN];
    rerender();
    await act(() => staleOpen());
    expect(service.fetchYandexAuthLink).toHaveBeenCalledOnce();
    expect(result.current.waiting).toBe(false);
    context.scopes = [KNOWN_USER_SCOPES.SEO, KNOWN_USER_SCOPES.ADMIN];
    rerender();
    act(() => { message(); popup.closed = true; vi.advanceTimersByTime(1000); });
    expect(refresh).not.toHaveBeenCalled();
  });

  it("does not revive an in-flight link after revoke then regrant", async () => {
    let release!: () => void;
    vi.mocked(service.fetchYandexAuthLink).mockImplementation(() => new Promise((resolve) => {
      release = () => resolve(apiSuccess({ auth_link: "https://oauth.yandex.ru/authorize" }));
    }));
    const { result, rerender } = renderHook(() => useYandexOAuthPopup(vi.fn()));
    let request!: Promise<void>;
    act(() => { request = result.current.open(); });
    context.scopes = [];
    rerender();
    context.scopes = [KNOWN_USER_SCOPES.SEO];
    rerender();
    await act(async () => { release(); await request; });
    expect(window.open).not.toHaveBeenCalled();
    expect(result.current.waiting).toBe(false);
  });
});
