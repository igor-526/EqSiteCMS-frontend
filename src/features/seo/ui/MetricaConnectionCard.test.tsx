import React from "react";
import { act, renderHook, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { http, HttpResponse } from "msw";
import { renderWithCmsProviders } from "@/test/render";
import { server } from "@/test/msw/server";
import { apiSuccess, apiError } from "@/lib/apiStatus";
import { KNOWN_USER_SCOPES } from "@/types/api/user";
import { useMetricaConnection } from "../hooks/useMetricaConnection";
import * as service from "../services/seoService";
import { MetricaConnectionCard } from "./MetricaConnectionCard";

const context = vi.hoisted(() => ({ scopes: [] as KNOWN_USER_SCOPES[] }));
const notification = vi.hoisted(() => ({ success: vi.fn() }));
vi.mock("@/contexts/UserContext", () => ({ useUserContext: () => context }));
vi.mock("@/hooks/useNotification", () => ({ useNotification: () => notification }));
const url = "http://127.0.0.1/api/yandex/metrica/connection";
const account = {
  id: "account-1", yandex_id: "123", yandex_login: "test-login",
  display_name: "Тестовое имя", email: "test@example.invalid", yandex_phone: "+70000000000",
};
const connection = { id: "connection-1", counter_id: "123456", yandex_account: account };

beforeEach(() => {
  context.scopes = [KNOWN_USER_SCOPES.SEO];
  notification.success.mockClear();
});

const hookWrapper = ({ children }: { children: React.ReactNode }) => <>{children}</>;

describe("FT-YX-05 connection hook", () => {
  it.each([connection, null])("loads linked/null and refreshes: %j", async (counter) => {
    const get = vi.fn(() => HttpResponse.json({ counter }));
    server.use(http.get(url, get));
    const { result } = renderHook(useMetricaConnection, { wrapper: hookWrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.connection).toEqual(counter);
    await act(() => result.current.refresh());
    expect(get).toHaveBeenCalledTimes(2);
  });

  it("surfaces a read error and retries", async () => {
    server.use(http.get(url, () => HttpResponse.json({ detail: "Сервис недоступен" }, { status: 502 })));
    const { result } = renderHook(useMetricaConnection);
    await waitFor(() => expect(result.current.error).toBe("Сервис недоступен"));
    server.use(http.get(url, () => HttpResponse.json({ counter: null })));
    await act(() => result.current.refresh());
    expect(result.current.error).toBeNull();
    expect(result.current.connection).toBeNull();
  });

  it.each([[], [KNOWN_USER_SCOPES.ADMIN], [KNOWN_USER_SCOPES.SUPERUSER], [KNOWN_USER_SCOPES.DEVELOPER]])("blocks read and mutation without SEO: %j", async (...scopes) => {
    context.scopes = scopes;
    const get = vi.fn();
    const remove = vi.fn();
    server.use(http.get(url, get), http.delete(url, remove));
    const { result } = renderHook(useMetricaConnection);
    await act(() => result.current.unlinkCounter());
    expect(result.current.mutationError).toBe("Недостаточно прав");
    expect(get).not.toHaveBeenCalled();
    expect(remove).not.toHaveBeenCalled();
  });

  it("rechecks permission after it is revoked", async () => {
    server.use(http.get(url, () => HttpResponse.json({ counter: connection })));
    const remove = vi.spyOn(service, "unlinkMetricaCounter");
    const { result, rerender } = renderHook(useMetricaConnection);
    await waitFor(() => expect(result.current.connection).toEqual(connection));
    context.scopes = [];
    rerender();
    await act(() => result.current.unlinkCounter());
    expect(remove).not.toHaveBeenCalled();
    remove.mockRestore();
  });

  it("guards concurrent submissions synchronously and refreshes on success", async () => {
    let linked = true;
    let release!: () => void;
    const barrier = new Promise<void>((resolve) => { release = resolve; });
    const remove = vi.fn(async () => { await barrier; linked = false; return new HttpResponse(null, { status: 204 }); });
    server.use(http.get(url, () => HttpResponse.json({ counter: linked ? connection : null })), http.delete(url, remove));
    const { result } = renderHook(useMetricaConnection);
    await waitFor(() => expect(result.current.connection).toEqual(connection));
    let request!: Promise<void>;
    act(() => { request = result.current.unlinkCounter(); void result.current.unlinkCounter(); });
    await waitFor(() => expect(remove).toHaveBeenCalledTimes(1));
    expect(result.current.pending).toBe(true);
    await act(async () => { release(); await request; });
    expect(result.current.connection).toBeNull();
    expect(result.current.pending).toBe(false);
    expect(notification.success).toHaveBeenCalledWith({ title: "Счётчик отвязан" });
  });

  it("handles thrown read and mutation exceptions without losing connection", async () => {
    const get = vi.spyOn(service, "fetchMetricaConnection").mockRejectedValueOnce(new Error("network"));
    const { result } = renderHook(useMetricaConnection);
    await waitFor(() => expect(result.current.error).toBe("Не удалось загрузить привязку"));
    get.mockRestore();
    server.use(http.get(url, () => HttpResponse.json({ counter: connection })));
    await act(() => result.current.refresh());
    const remove = vi.spyOn(service, "unlinkMetricaCounter").mockRejectedValueOnce(new Error("network"));
    await act(() => result.current.unlinkCounter());
    expect(result.current.mutationError).toBe("Не удалось отвязать счётчик");
    expect(result.current.connection).toEqual(connection);
    expect(result.current.pending).toBe(false);
    remove.mockRestore();
  });
});

describe("FT-YX-06/07 Metrica card and confirmation", () => {
  it("shows loading and opens/closes placeholder wizard for null connection", async () => {
    let release!: () => void;
    const barrier = new Promise<void>((resolve) => { release = resolve; });
    server.use(http.get(url, async () => { await barrier; return HttpResponse.json({ counter: null }); }));
    renderWithCmsProviders(<MetricaConnectionCard />);
    expect(screen.getAllByText("Загрузка привязки").length).toBeGreaterThan(0);
    expect(screen.queryByRole("button", { name: "Привязать" })).not.toBeInTheDocument();
    release();
    await userEvent.click(await screen.findByRole("button", { name: "Привязать" }));
    expect(screen.getByText("Выбор аккаунта появится позже.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Далее" })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Отмена" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("renders all linked fields; cancellation sends no DELETE", async () => {
    const remove = vi.fn(() => new HttpResponse(null, { status: 204 }));
    server.use(http.get(url, () => HttpResponse.json({ counter: connection })), http.delete(url, remove));
    renderWithCmsProviders(<MetricaConnectionCard />);
    for (const text of [connection.counter_id, account.display_name, account.yandex_login, account.email, account.yandex_phone]) {
      expect(await screen.findByText(text)).toBeInTheDocument();
    }
    await userEvent.click(screen.getByRole("button", { name: "Отвязать" }));
    expect(screen.getByRole("dialog", { name: "Отвязать счётчик?" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Отмена" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(remove).not.toHaveBeenCalled();
    expect(screen.getByText(connection.counter_id)).toBeInTheDocument();
  });

  it("wraps the linked title and preserves long counter and account values", async () => {
    const longCounter = "1234567890123456789012345678901";
    const longName = "ОченьДлинноеИмяАккаунтаБезПробеловДляМобильногоЭкрана";
    server.use(http.get(url, () => HttpResponse.json({ counter: {
      ...connection, counter_id: longCounter, yandex_account: { ...account, display_name: longName },
    } })));
    renderWithCmsProviders(<MetricaConnectionCard />);
    const title = await screen.findByText("Яндекс.Метрика привязана");
    expect(getComputedStyle(title).whiteSpace).toBe("normal");
    expect(getComputedStyle(title).overflowWrap).toBe("anywhere");
    expect(screen.getByText(longCounter)).toBeInTheDocument();
    expect(screen.getByText(longName)).toBeInTheDocument();
    const content = screen.getByText(longCounter).closest(".ant-descriptions-item-content");
    expect(content).not.toBeNull();
    expect(getComputedStyle(content!).overflowWrap).toBe("anywhere");
  });

  it("confirms deletion, refreshes the block and notifies", async () => {
    let linked = true;
    const get = vi.fn(() => HttpResponse.json({ counter: linked ? connection : null }));
    const remove = vi.fn(() => { linked = false; return new HttpResponse(null, { status: 204 }); });
    server.use(http.get(url, get), http.delete(url, remove));
    renderWithCmsProviders(<MetricaConnectionCard />);
    await userEvent.click(await screen.findByRole("button", { name: "Отвязать" }));
    await userEvent.click(screen.getByRole("button", { name: /Подтвердить/ }));
    expect(await screen.findByText("Яндекс.Метрика не привязана")).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(remove).toHaveBeenCalledTimes(1);
    expect(get).toHaveBeenCalledTimes(2);
    expect(notification.success).toHaveBeenCalled();
  });

  it.each([400, 401, 403, 502])("keeps modal and linked data on backend %s", async (status) => {
    server.use(
      http.get(url, () => HttpResponse.json({ counter: connection })),
      http.delete(url, () => HttpResponse.json({ detail: "Отказ backend" }, { status })),
      http.post("http://127.0.0.1/api/auth/refresh", () => new HttpResponse(null, { status: 204 })),
    );
    renderWithCmsProviders(<MetricaConnectionCard />);
    await userEvent.click(await screen.findByRole("button", { name: "Отвязать" }));
    await userEvent.click(screen.getByRole("button", { name: /Подтвердить/ }));
    const dialog = screen.getByRole("dialog");
    expect(await within(dialog).findByText("Отказ backend")).toBeInTheDocument();
    expect(screen.getByText(connection.counter_id)).toBeInTheDocument();
    expect(notification.success).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: /Подтвердить/ })).toBeEnabled();
  });

  it("shows read error and retry without mutation actions", async () => {
    server.use(http.get(url, () => HttpResponse.json({ detail: "Нет доступа" }, { status: 403 })));
    renderWithCmsProviders(<MetricaConnectionCard />);
    expect(await screen.findByText("Нет доступа")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Отвязать" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Привязать" })).not.toBeInTheDocument();
    server.use(http.get(url, () => HttpResponse.json({ counter: null })));
    await userEvent.click(screen.getByRole("button", { name: "Повторить" }));
    expect(await screen.findByRole("button", { name: "Привязать" })).toBeEnabled();
  });

  it("accepts step slots and refreshes the card when the target completes", async () => {
    let linked = false;
    const get = vi.fn(() => HttpResponse.json({ counter: linked ? connection : null }));
    server.use(http.get(url, get));
    renderWithCmsProviders(
      <MetricaConnectionCard
        target={{
          key: "test-target", title: "Тестовая цель", stepTitle: "Тестовый шаг",
          renderStep: ({ onDone }) => <button onClick={onDone}>Готово</button>,
        }}
        renderAccountStep={({ onSelect }) => <button onClick={() => onSelect(account)}>Аккаунт</button>}
      />,
    );
    await userEvent.click(await screen.findByRole("button", { name: "Привязать" }));
    await userEvent.click(screen.getByRole("button", { name: "Аккаунт" }));
    linked = true;
    await userEvent.click(screen.getByRole("button", { name: "Готово" }));
    expect(await screen.findByText(connection.counter_id)).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(get).toHaveBeenCalledTimes(2);
  });

  it("disables mutations immediately when SEO is revoked", async () => {
    server.use(http.get(url, () => HttpResponse.json({ counter: connection })));
    const { rerender } = renderWithCmsProviders(<MetricaConnectionCard />);
    await userEvent.click(await screen.findByRole("button", { name: "Отвязать" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    context.scopes = [KNOWN_USER_SCOPES.ADMIN];
    // The permission check runs before the revoked-role refresh clears cached data.
    rerender(<MetricaConnectionCard />);
    expect(screen.queryByRole("button", { name: "Отвязать" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Повторить" })).toBeDisabled();
    expect(screen.queryByText(account.email)).not.toBeInTheDocument();
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    context.scopes = [KNOWN_USER_SCOPES.SEO];
    rerender(<MetricaConnectionCard />);
    await screen.findByRole("button", { name: "Отвязать" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});

describe("FE-Y01/02 MetricaConnectionCard permission lifetime", () => {
  it("allows SEO+ADMIN through the same SEO guard", async () => {
    context.scopes = [KNOWN_USER_SCOPES.SEO, KNOWN_USER_SCOPES.ADMIN];
    const get = vi.spyOn(service, "fetchMetricaConnection").mockResolvedValue(apiSuccess({ counter: connection }));

    const { result } = renderHook(() => useMetricaConnection());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(get).toHaveBeenCalledOnce();
    get.mockRestore();
  });

  it("clears private data and ignores late reads after revoke", async () => {
    let release!: () => void;
    const get = vi.spyOn(service, "fetchMetricaConnection").mockImplementation(() => new Promise((resolve) => {
      release = () => resolve(apiSuccess({ counter: connection }));
    }));

    const { result, rerender } = renderHook(() => useMetricaConnection());
    const staleRefresh = result.current.refresh;
    context.scopes = [KNOWN_USER_SCOPES.ADMIN];
    rerender();
    await act(() => staleRefresh());
    await act(async () => release());
    expect(result.current.connection).toEqual(null);
    expect(result.current.loading).toBe(false);
    expect(get).toHaveBeenCalledOnce();
    get.mockRestore();
  });

  it.each(["success", "error"])("ignores late mutation %s after revoke and blocks stale handlers", async (outcome) => {
    const get = vi.spyOn(service, "fetchMetricaConnection").mockResolvedValue(apiSuccess({ counter: connection }));
    let release!: () => void;
    const mutate = vi.spyOn(service, "unlinkMetricaCounter").mockImplementation(() => new Promise((resolve) => {
      release = () => resolve(outcome === "success" ? apiSuccess(null) : apiError("Forbidden"));
    }));

    const { result, rerender } = renderHook(() => useMetricaConnection());
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => { result.current.openConfirmation(); });
    const submit = result.current.unlinkCounter;
    const staleSubmit = () => submit();
    let request!: Promise<void>;
    act(() => { request = staleSubmit(); });
    context.scopes = [KNOWN_USER_SCOPES.ADMIN];
    rerender();
    await act(async () => { release(); await request; });
    expect(result.current.connection).toEqual(null);
    expect(notification.success).not.toHaveBeenCalled();
    expect(get).toHaveBeenCalledOnce();
    expect(result.current.mutationError).toBeNull();
    await act(() => staleSubmit());
    expect(mutate).toHaveBeenCalledOnce();
    get.mockRestore();
    mutate.mockRestore();
  });
});
