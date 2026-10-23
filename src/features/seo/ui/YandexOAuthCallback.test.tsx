import React, { StrictMode } from "react";
import { act, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { apiError, apiSuccess } from "@/lib/apiStatus";
import { KNOWN_USER_SCOPES } from "@/types/api/user";
import { renderWithCmsProviders } from "@/test/render";
import * as service from "../services/seoService";
import { YandexOAuthCallback } from "./YandexOAuthCallback";

const context = vi.hoisted(() => ({ scopes: [] as KNOWN_USER_SCOPES[], loading: false }));
const query = vi.hoisted(() => ({ params: new URLSearchParams() }));
vi.mock("@/contexts/UserContext", () => ({ useUserContext: () => context }));
vi.mock("next/navigation", () => ({ useSearchParams: () => query.params }));
const postMessage = vi.fn();
beforeEach(() => {
  context.scopes = [KNOWN_USER_SCOPES.ADMIN];
  context.loading = false;
  query.params = new URLSearchParams("code=secret-onetime-code&state=tenant-id&cid=ignored");
  postMessage.mockClear();
  vi.stubGlobal("opener", { postMessage });
  vi.spyOn(window, "close").mockImplementation(() => {});
  vi.spyOn(service, "submitYandexAuthCode").mockResolvedValue(apiSuccess({ id: "account-id", yandex_id: "123", yandex_login: "test-login", display_name: "", email: null, yandex_phone: null }));
});
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe("FT-YX-13 callback", () => {
  it("sends exactly one POST in StrictMode, whitelists code/state, notifies exact origin and closes on success", async () => {
    const { rerender } = renderWithCmsProviders(<StrictMode><YandexOAuthCallback /></StrictMode>);
    await screen.findByText("Аккаунт добавлен");
    rerender(<StrictMode><YandexOAuthCallback /></StrictMode>);
    expect(service.submitYandexAuthCode).toHaveBeenCalledExactlyOnceWith({ code: "secret-onetime-code", state: "tenant-id" });
    expect(postMessage).toHaveBeenCalledExactlyOnceWith({ type: "eqsite:yandex-oauth", status: "success", login: "test-login" }, window.location.origin);
    expect(screen.getByText(/test-login успешно добавлен/)).toBeInTheDocument();
    expect(window.close).toHaveBeenCalledOnce();
    expect(screen.queryByText(/secret-onetime-code/)).not.toBeInTheDocument();
  });
  it.each(["", "code=secret-onetime-code", "state=tenant-id", "code=%20&state=tenant-id"])("rejects missing/empty parameters: %s", async (params) => {
    query.params = new URLSearchParams(params);
    renderWithCmsProviders(<YandexOAuthCallback />);
    await screen.findByText(/Некорректная ссылка/);
    expect(service.submitYandexAuthCode).not.toHaveBeenCalled();
    expect(postMessage).toHaveBeenCalledWith({ type: "eqsite:yandex-oauth", status: "error" }, window.location.origin);
    expect(window.close).not.toHaveBeenCalled();
  });
  it("handles access_denied without POST or rendering provider error", async () => {
    query.params = new URLSearchParams("error=access_denied&error_description=secret-onetime-code");
    renderWithCmsProviders(<YandexOAuthCallback />);
    await screen.findByText("Авторизация отменена");
    expect(service.submitYandexAuthCode).not.toHaveBeenCalled();
    expect(postMessage).toHaveBeenCalledWith({ type: "eqsite:yandex-oauth", status: "cancelled" }, window.location.origin);
    expect(window.close).not.toHaveBeenCalled();
    expect(screen.queryByText(/secret-onetime-code/)).not.toBeInTheDocument();
  });
  it.each(["400 secret-onetime-code", "403 Forbidden secret-onetime-code", "401 Unauthorized secret-onetime-code", "502 secret-onetime-code"])("displays safe backend error: %s", async (detail) => {
    vi.mocked(service.submitYandexAuthCode).mockResolvedValue(apiError(detail));
    renderWithCmsProviders(<YandexOAuthCallback />);
    await screen.findByText("Ошибка авторизации");
    expect(screen.queryByText(/secret-onetime-code/)).not.toBeInTheDocument();
    expect(postMessage).toHaveBeenCalledExactlyOnceWith({ type: "eqsite:yandex-oauth", status: "error" }, window.location.origin);
    expect(window.close).not.toHaveBeenCalled();
  });
  it("handles thrown exception without leaking code", async () => {
    vi.mocked(service.submitYandexAuthCode).mockRejectedValue(new Error("secret-onetime-code"));
    renderWithCmsProviders(<YandexOAuthCallback />);
    await screen.findByText("Ошибка авторизации");
    expect(screen.queryByText(/secret-onetime-code/)).not.toBeInTheDocument();
  });
  it.each([[], [KNOWN_USER_SCOPES.SUPERUSER], [KNOWN_USER_SCOPES.DEVELOPER]])("locally denies mutation without ADMIN: %j", async (...scopes) => {
    context.scopes = scopes;
    renderWithCmsProviders(<YandexOAuthCallback />);
    await screen.findByText(/Недостаточно прав или сессия истекла/);
    expect(service.submitYandexAuthCode).not.toHaveBeenCalled();
    expect(window.close).not.toHaveBeenCalled();
  });
  it("waits for session loading before checking mutation permission", async () => {
    context.loading = true;
    context.scopes = [];
    const { rerender } = renderWithCmsProviders(<StrictMode><YandexOAuthCallback /></StrictMode>);
    expect(screen.getAllByText("Обработка авторизации").length).toBeGreaterThan(0);
    expect(service.submitYandexAuthCode).not.toHaveBeenCalled();
    context.loading = false;
    context.scopes = [KNOWN_USER_SCOPES.ADMIN];
    rerender(<StrictMode><YandexOAuthCallback /></StrictMode>);
    await screen.findByText("Аккаунт добавлен");
    expect(service.submitYandexAuthCode).toHaveBeenCalledOnce();
  });
  it("without opener keeps the result and SEO link, never closes", async () => {
    vi.stubGlobal("opener", null);
    renderWithCmsProviders(<YandexOAuthCallback />);
    await screen.findByText("Аккаунт добавлен");
    expect(screen.getByRole("link", { name: "Перейти в раздел SEO" })).toHaveAttribute("href", "/seo");
    expect(window.close).not.toHaveBeenCalled();
    expect(postMessage).not.toHaveBeenCalled();
  });
  it("shows processing until exchange resolves and tolerates a detached opener", async () => {
    let release!: () => void;
    vi.mocked(service.submitYandexAuthCode).mockImplementation(() => new Promise((resolve) => { release = () => resolve(apiSuccess(null)); }));
    postMessage.mockImplementationOnce(() => { throw new Error("detached"); });
    renderWithCmsProviders(<YandexOAuthCallback />);
    await waitFor(() => expect(service.submitYandexAuthCode).toHaveBeenCalledOnce());
    expect(screen.getAllByText("Обработка авторизации").length).toBeGreaterThan(0);
    await act(async () => release());
    await screen.findByText("Аккаунт добавлен");
    expect(service.submitYandexAuthCode).toHaveBeenCalledOnce();
  });
});
