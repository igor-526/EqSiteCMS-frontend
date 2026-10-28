import React from "react";
import { act, fireEvent, renderHook, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { http, HttpResponse } from "msw";
import { renderWithCmsProviders } from "@/test/render";
import { server } from "@/test/msw/server";
import { KNOWN_USER_SCOPES } from "@/types/api/user";
import { apiError, apiSuccess } from "@/lib/apiStatus";
import { useMetricaCounters } from "../hooks/useMetricaCounters";
import * as service from "../services/seoService";
import { MetricaCounterStep } from "./MetricaCounterStep";
import { SeoPage } from "./SeoPage";
import { ConfigProvider } from "antd";
import { ConnectionWizardModal } from "./ConnectionWizardModal";
import { METRICA_WIZARD_TARGET } from "../wizardTargets";

// FT-UI-11 exercises the real wizard/target, not Tabs/card reload (FT-UI-16).
// Disable only decorative motion locally; keep native controls, MSW and guards.
// Account list/OAuth semantics have their own integration coverage. The controlled
// slot still verifies the real wizard's retained account state.
const ignoreConnectionChange = () => {};

function PendingWizardFixture() {
  const [open, setOpen] = React.useState(true);
  return <ConfigProvider theme={{ token: { motion: false } }}>
    <button onClick={() => setOpen(true)}>Открыть визард</button>
    <ConnectionWizardModal open={open} target={METRICA_WIZARD_TARGET}
      renderAccountStep={({ selectedAccount, onSelect }) => <button
        aria-pressed={selectedAccount?.id === account.id} onClick={() => onSelect(account)}>
        {account.display_name} {account.yandex_login}
      </button>}
      onCancel={() => setOpen(false)} onDone={() => setOpen(false)} onConnectionChange={ignoreConnectionChange} />
  </ConfigProvider>;
}

const context = vi.hoisted(() => ({ scopes: [] as KNOWN_USER_SCOPES[] }));
const notification = vi.hoisted(() => ({ success: vi.fn() }));
vi.mock("@/contexts/UserContext", () => ({ useUserContext: () => context }));
vi.mock("@/hooks/useNotification", () => ({ useNotification: () => notification }));
const url = "http://127.0.0.1/api/yandex/metrica/counters";
const connectionUrl = "http://127.0.0.1/api/yandex/metrica/connection";
const account = {
  id: "account-1", yandex_id: "123", yandex_login: "login-one",
  display_name: "Имя аккаунта", email: "one@example.invalid", yandex_phone: null,
};
const counter = { counter_id: 123456, site: "https://example.invalid" };
const otherCounter = { counter_id: 654321, site: "https://other.invalid" };
const connection = { id: "connection-1", counter_id: "123456", yandex_account: account };
const makeProps = () => ({ account, onDone: vi.fn(), onBack: vi.fn(), busy: false, onPendingChange: vi.fn() });

beforeEach(() => {
  context.scopes = [KNOWN_USER_SCOPES.SEO];
  notification.success.mockClear();
  server.use(http.get(url, () => HttpResponse.json({ items: [counter], total: 100 })));
});
afterEach(() => vi.useRealTimers());

describe("FT-YX-11 counters hook", () => {
  it("maps initial/page/page size to limit/offset and resets search with debounce300 and clear", async () => {
    const get = vi.spyOn(service, "fetchMetricaCounters").mockResolvedValue(apiSuccess({ items: [counter], total: 100 }));
    const props = makeProps();
    const { result } = renderHook(() => useMetricaCounters(props));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(get).toHaveBeenLastCalledWith({ account_id: account.id, limit: 20, offset: 0, search: undefined });
    await act(async () => result.current.changePage(3, 20));
    expect(get).toHaveBeenLastCalledWith({ account_id: account.id, limit: 20, offset: 40, search: undefined });
    await act(async () => result.current.changePage(3, 50));
    expect(get).toHaveBeenLastCalledWith({ account_id: account.id, limit: 50, offset: 0, search: undefined });
    await act(async () => result.current.changePage(2, 50));
    get.mockClear();
    vi.useFakeTimers();
    act(() => result.current.changeSearch("  example  "));
    await act(() => vi.advanceTimersByTimeAsync(299));
    expect(get).not.toHaveBeenCalled();
    await act(() => vi.advanceTimersByTimeAsync(1));
    expect(get).toHaveBeenCalledOnce();
    expect(get).toHaveBeenLastCalledWith({ account_id: account.id, limit: 50, offset: 0, search: "example" });
    await act(async () => result.current.changePage(2, 50));
    act(() => result.current.changeSearch("   "));
    await act(() => vi.advanceTimersByTimeAsync(300));
    expect(get).toHaveBeenLastCalledWith({ account_id: account.id, limit: 50, offset: 0, search: undefined });
    get.mockRestore();
  });

  it("validates explicit ID, locks different rows synchronously and calls onDone once", async () => {
    const props = makeProps();
    const { result } = renderHook(() => useMetricaCounters(props));
    await waitFor(() => expect(result.current.loading).toBe(false));
    const bind = vi.spyOn(service, "bindMetricaCounter");
    await act(() => result.current.bindCounter(Number.NaN));
    expect(bind).not.toHaveBeenCalled();
    expect(result.current.mutationError).toBe("Выберите корректный счётчик");
    let release!: () => void;
    bind.mockImplementation(() => new Promise((resolve) => { release = () => resolve(apiSuccess(connection)); }));
    let request!: Promise<void>;
    act(() => { request = result.current.bindCounter(counter.counter_id); void result.current.bindCounter(counter.counter_id); void result.current.bindCounter(otherCounter.counter_id); });
    expect(bind).toHaveBeenCalledOnce();
    expect(bind).toHaveBeenCalledWith({ yandex_account_id: account.id, counter_id: "123456" });
    expect(result.current.pending).toBe(true);
    await act(async () => { release(); await request; });
    expect(props.onDone).toHaveBeenCalledOnce();
    expect(notification.success).toHaveBeenCalledWith({ title: "Счётчик привязан" });
    bind.mockRestore();
  });

  it.each([[], [KNOWN_USER_SCOPES.ADMIN], [KNOWN_USER_SCOPES.SUPERUSER], [KNOWN_USER_SCOPES.DEVELOPER]])("blocks read/bind without SEO: %j", async (...scopes) => {
    context.scopes = scopes;
    const get = vi.spyOn(service, "fetchMetricaCounters");
    const bind = vi.spyOn(service, "bindMetricaCounter");
    const { result } = renderHook(() => useMetricaCounters(makeProps()));
    await act(() => result.current.bindCounter(counter.counter_id));
    expect(get).not.toHaveBeenCalled();
    expect(bind).not.toHaveBeenCalled();
    expect(result.current.mutationError).toBe("Недостаточно прав");
    get.mockRestore();
    bind.mockRestore();
  });

  it("rechecks permission on submit and retains counters on exceptions", async () => {
    const props = makeProps();
    const { result, rerender } = renderHook(() => useMetricaCounters(props));
    await waitFor(() => expect(result.current.loading).toBe(false));
    const bind = vi.spyOn(service, "bindMetricaCounter").mockRejectedValueOnce(new Error("network"));
    context.scopes = [];
    rerender();
    await act(() => result.current.bindCounter(counter.counter_id));
    expect(bind).not.toHaveBeenCalled();
    context.scopes = [KNOWN_USER_SCOPES.SEO];
    rerender();
    await act(() => result.current.bindCounter(counter.counter_id));
    expect(result.current.mutationError).toBe("Не удалось привязать счётчик");
    expect(result.current.counters).toEqual([counter]);
    expect(props.onDone).not.toHaveBeenCalled();
    bind.mockRestore();
  });

  it("surfaces thrown GET and can refresh", async () => {
    const get = vi.spyOn(service, "fetchMetricaCounters").mockRejectedValueOnce(new Error("network"));
    const props = makeProps();
    const { result } = renderHook(() => useMetricaCounters(props));
    await waitFor(() => expect(result.current.error).toBe("Не удалось загрузить счётчики"));
    await act(() => result.current.refresh());
    expect(result.current.counters).toEqual([counter]);
    get.mockRestore();
  });
});

describe("FT-UI-13/15 network context", () => {
  it.each(["GET", "POST"])("FT-UI-13/15 preserves search/offset after thrown %s; GET retry never auto-posts", async (method) => {
    const get = vi.spyOn(service, "fetchMetricaCounters").mockResolvedValue(apiSuccess({ items: [counter, otherCounter], total: 100 }));
    const bind = vi.spyOn(service, "bindMetricaCounter").mockResolvedValue(apiSuccess(connection));
    const props = makeProps();
    const { result } = renderHook(() => useMetricaCounters(props));
    await waitFor(() => expect(result.current.loading).toBe(false));
    vi.useFakeTimers();
    act(() => result.current.changeSearch("example"));
    await act(() => vi.advanceTimersByTimeAsync(300));
    vi.useRealTimers();
    await act(async () => result.current.changePage(3, 20));
    const query = { account_id: account.id, limit: 20, offset: 40, search: "example" };
    expect(get).toHaveBeenLastCalledWith(query);
    const getCount = get.mock.calls.length;
    if (method === "GET") {
      get.mockRejectedValueOnce(new Error("network"));
      await act(() => result.current.refresh());
      expect(result.current.error).toBe("Не удалось загрузить счётчики");
    } else {
      bind.mockRejectedValueOnce(new Error("network"));
      await act(() => result.current.bindCounter(counter.counter_id));
      expect(result.current.mutationError).toBe("Не удалось привязать счётчик");
      expect(get).toHaveBeenCalledTimes(getCount);
    }
    expect(result.current.search).toBe("example");
    expect(result.current.offset).toBe(40);
    expect(result.current.counters).toEqual([counter, otherCounter]);
    expect(result.current.pending).toBe(false);
    expect(props.onDone).not.toHaveBeenCalled();
    expect(notification.success).not.toHaveBeenCalled();
    const postCount = method === "POST" ? 1 : 0;
    expect(bind).toHaveBeenCalledTimes(postCount);
    await act(() => result.current.refresh());
    expect(get).toHaveBeenLastCalledWith(query);
    expect(get).toHaveBeenCalledTimes(getCount + (method === "GET" ? 2 : 1));
    expect(result.current.error).toBeNull();
    expect(result.current.search).toBe("example");
    expect(result.current.offset).toBe(40);
    expect(bind).toHaveBeenCalledTimes(postCount);
    expect(props.onDone).not.toHaveBeenCalled();
    await act(() => result.current.bindCounter(otherCounter.counter_id));
    expect(bind).toHaveBeenLastCalledWith({ yandex_account_id: account.id, counter_id: "654321" });
    expect(bind).toHaveBeenCalledTimes(postCount + 1);
    expect(props.onDone).toHaveBeenCalledOnce();
    get.mockRestore();
    bind.mockRestore();
  });

});

describe("FT-YX-11 counter list and integration", () => {
  it("shows loading and data; row activation retains context on 403 and explicitly retries", async () => {
    let release!: () => void;
    const barrier = new Promise<void>((resolve) => { release = resolve; });
    server.use(http.get(url, async () => { await barrier; return HttpResponse.json({ items: [counter], total: 100 }); }));
    server.use(http.post(connectionUrl, () => HttpResponse.json({ detail: "Forbidden" }, { status: 403 })));
    const props = makeProps();
    renderWithCmsProviders(<MetricaCounterStep {...props} />);
    expect(screen.getAllByText("Загрузка счётчиков").length).toBeGreaterThan(0);
    expect(screen.queryByRole("button", { name: "Привязать" })).not.toBeInTheDocument();
    release();
    expect(await screen.findByText(counter.site)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /123456.*example/ }));
    expect(await screen.findByText("Недостаточно прав. Требуется роль SEO.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /123456.*example/ })).toBeEnabled();
    expect(props.onDone).not.toHaveBeenCalled();
    server.use(http.post(connectionUrl, () => HttpResponse.json(connection)));
    await userEvent.click(screen.getByRole("button", { name: /123456.*example/ }));
    await waitFor(() => expect(props.onDone).toHaveBeenCalledOnce());
  });

  it("keeps the page-size chooser available and requests size50 with offset reset", async () => {
    const queries: URLSearchParams[] = [];
    server.use(http.get(url, ({ request }) => {
      queries.push(new URL(request.url).searchParams);
      return HttpResponse.json({ items: [counter], total: 100 });
    }));
    renderWithCmsProviders(<MetricaCounterStep {...makeProps()} />);
    await screen.findByText(counter.site);
    await userEvent.click(screen.getByTitle("3"));
    await waitFor(() => expect(queries.at(-1)?.get("offset")).toBe("40"));
    const sizeChooser = screen.getByRole("combobox");
    const options = sizeChooser.closest(".ant-pagination-options");
    expect(options).not.toBeNull();
    expect(getComputedStyle(options!).display).toBe("inline-block");
    expect(getComputedStyle(options!.parentElement!).flexWrap).toBe("wrap");
    await userEvent.click(sizeChooser);
    await userEvent.click(await screen.findByText("50 / page"));
    await waitFor(() => expect(queries.at(-1)?.get("limit")).toBe("50"));
    expect(queries.at(-1)?.get("offset")).toBe("0");
    expect(queries.at(-1)?.has("page")).toBe(false);
  });

  it("shows one empty hint and contextual retry makes only GET", async () => {
    const bind = vi.spyOn(service, "bindMetricaCounter");
    server.use(http.get(url, () => HttpResponse.json({ detail: "Сервис недоступен" }, { status: 502 })));
    renderWithCmsProviders(<MetricaCounterStep {...makeProps()} />);
    expect(await screen.findByText("Сервис недоступен")).toBeInTheDocument();
    server.use(http.get(url, () => HttpResponse.json({ items: [], total: 0 })));
    await userEvent.click(screen.getByRole("button", { name: "Повторить загрузку" }));
    expect(await screen.findByText("Счётчики не найдены")).toBeInTheDocument();
    expect(screen.getAllByText("Счётчики не найдены")).toHaveLength(1);
    expect(screen.queryByRole("button", { name: "Повторить загрузку" })).not.toBeInTheDocument();
    expect(bind).not.toHaveBeenCalled();
    bind.mockRestore();
  });

  it("disables bind without SEO", () => {
    context.scopes = [];
    renderWithCmsProviders(<MetricaCounterStep {...makeProps()} />);
    expect(screen.queryByRole("button", { name: "Привязать" })).not.toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Поиск счётчиков" })).toBeDisabled();
  });

  it("uses real target in SeoPage: choose account, counter, bind closes wizard and refreshes card", async () => {
    let linked = false;
    const get = vi.fn(() => HttpResponse.json({ counter: linked ? connection : null }));
    const bind = vi.fn(() => { linked = true; return HttpResponse.json(connection); });
    server.use(
      http.get(connectionUrl, get), http.post(connectionUrl, bind),
      http.get("http://127.0.0.1/api/yandex/accounts", () => HttpResponse.json({ items: [account], total: 1 })),
    );
    renderWithCmsProviders(<SeoPage />);
    await screen.findByText("Яндекс.Метрика не привязана");
    await userEvent.click(screen.getByText("Привязать", { exact: true }));
    const wizard = within(screen.getByRole("dialog", { hidden: true }));
    await wizard.findByText(account.display_name);
    await userEvent.click(wizard.getByRole("button", { name: /^Имя аккаунта.*login-one/ }));
    await wizard.findByText(counter.site);
    await userEvent.click(wizard.getByRole("button", { name: /123456.*example/ }));
    expect(await screen.findByText("Яндекс.Метрика привязана")).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByRole("dialog", { hidden: true })).not.toBeInTheDocument());
    expect(bind).toHaveBeenCalledOnce();
    expect(get).toHaveBeenCalledTimes(2);
  });

  it("maps 401/404 errors without losing counters", async () => {
    const props = makeProps();
    const { result } = renderHook(() => useMetricaCounters(props));
    await waitFor(() => expect(result.current.loading).toBe(false));
    const bind = vi.spyOn(service, "bindMetricaCounter").mockResolvedValueOnce(apiError("Unauthorized")).mockResolvedValueOnce(apiError("Not found"));
    await act(() => result.current.bindCounter(counter.counter_id));
    expect(result.current.mutationError).toContain("Сессия истекла");
    await act(() => result.current.bindCounter(counter.counter_id));
    expect(result.current.mutationError).toContain("уже отсутствует");
    expect(result.current.counters).toEqual([counter]);
    bind.mockRestore();
  });

  it.each(["click", "Enter", "Space"])("FT-UI-09 native row activation via %s posts the row ID once", async (activation) => {
    const bodies: unknown[] = [];
    server.use(http.post(connectionUrl, async ({ request }) => {
      bodies.push(await request.json());
      return HttpResponse.json(connection);
    }));
    const props = makeProps();
    renderWithCmsProviders(<MetricaCounterStep {...props} />);
    const row = await screen.findByRole("button", { name: /123456.*example/ });
    expect(row.tagName).toBe("BUTTON");
    expect(row.closest("li")?.parentElement?.tagName).toBe("UL");
    expect(row.querySelector("button")).toBeNull();
    expect(screen.queryByRole("button", { name: /Выбрать счётчик|^Привязать$|Обновить счётчики/ })).not.toBeInTheDocument();
    if (activation === "click") await userEvent.click(row);
    else {
      row.focus();
      await userEvent.keyboard(activation === "Enter" ? "{Enter}" : " ");
    }
    await waitFor(() => expect(props.onDone).toHaveBeenCalledOnce());
    expect(bodies).toEqual([{ yandex_account_id: account.id, counter_id: "123456" }]);
  });

  it.each([400, 422, 401, 403, 404, 502])("FT-UI-08/13 keeps search/page/account after %s and retries only the newly activated ID", async (status) => {
    const details: Record<number, string> = { 400: "Некорректные данные", 422: "Ошибка валидации", 401: "Unauthorized", 403: "Forbidden", 404: "Not found", 502: "Сервис недоступен" };
    const get = vi.spyOn(service, "fetchMetricaCounters").mockResolvedValue(apiSuccess({ items: [counter, otherCounter], total: 100 }));
    const bind = vi.spyOn(service, "bindMetricaCounter").mockResolvedValueOnce(apiError(details[status])).mockResolvedValueOnce(apiSuccess(connection));
    const props = makeProps();
    const { result } = renderHook(() => useMetricaCounters(props));
    await waitFor(() => expect(result.current.loading).toBe(false));
    vi.useFakeTimers();
    act(() => result.current.changeSearch("example"));
    await act(async () => { await vi.advanceTimersByTimeAsync(300); });
    vi.useRealTimers();
    await act(async () => { result.current.changePage(3, 20); });
    const getCount = get.mock.calls.length;
    await act(() => result.current.bindCounter(counter.counter_id));
    expect(result.current.mutationError).toBeTruthy();
    expect(result.current.search).toBe("example");
    expect(result.current.offset).toBe(40);
    expect(result.current.pending).toBe(false);
    expect(result.current.counters).toEqual([counter, otherCounter]);
    expect(props.onDone).not.toHaveBeenCalled();
    expect(notification.success).not.toHaveBeenCalled();
    expect(bind).toHaveBeenCalledOnce();
    expect(get).toHaveBeenCalledTimes(getCount);
    await act(() => result.current.bindCounter(otherCounter.counter_id));
    expect(bind).toHaveBeenNthCalledWith(1, { yandex_account_id: account.id, counter_id: "123456" });
    expect(bind).toHaveBeenNthCalledWith(2, { yandex_account_id: account.id, counter_id: "654321" });
    expect(props.onDone).toHaveBeenCalledOnce();
    expect(props.onPendingChange.mock.calls).toEqual([[true], [false], [true], [false]]);
    get.mockRestore();
    bind.mockRestore();
  });

  it("FT-UI-12 blocks a retained callback after SEO is revoked", async () => {
    const props = makeProps();
    const { result, rerender } = renderHook(() => useMetricaCounters(props));
    await waitFor(() => expect(result.current.loading).toBe(false));
    const retainedBind = result.current.bindCounter;
    const bind = vi.spyOn(service, "bindMetricaCounter");
    context.scopes = [KNOWN_USER_SCOPES.SUPERUSER];
    rerender();
    await act(() => retainedBind(counter.counter_id));
    expect(bind).not.toHaveBeenCalled();
    expect(props.onPendingChange).not.toHaveBeenCalled();
    expect(result.current.mutationError).toBe("Недостаточно прав");
    bind.mockRestore();
  });

  it("FT-UI-11 releases parent busy on unmount and ignores late success", async () => {
    const props = makeProps();
    let release!: () => void;
    const bind = vi.spyOn(service, "bindMetricaCounter").mockImplementation(() => new Promise((resolve) => {
      release = () => resolve(apiSuccess(connection));
    }));
    const { result, unmount } = renderHook(() => useMetricaCounters(props));
    await waitFor(() => expect(result.current.loading).toBe(false));
    let request!: Promise<void>;
    act(() => { request = result.current.bindCounter(counter.counter_id); });
    expect(props.onPendingChange).toHaveBeenLastCalledWith(true);
    unmount();
    expect(props.onPendingChange).toHaveBeenLastCalledWith(false);
    await act(async () => { release(); await request; });
    expect(props.onDone).not.toHaveBeenCalled();
    expect(notification.success).not.toHaveBeenCalled();
    bind.mockRestore();
  });

  it.each([401, 403])("FT-UI-12 handles protected GET denial %s without success", async (status) => {
    const props = makeProps();
    const bind = vi.spyOn(service, "bindMetricaCounter");
    const get = vi.spyOn(service, "fetchMetricaCounters").mockResolvedValue(apiError(status === 401 ? "Unauthorized" : "Forbidden"));
    renderWithCmsProviders(<MetricaCounterStep {...props} />);
    expect(await screen.findByText(status === 401 ? "Сессия истекла. Войдите в CMS повторно." : "Недостаточно прав. Требуется роль SEO.")).toBeInTheDocument();
    expect(screen.queryByRole("list", { name: "Счётчики Метрики" })).not.toBeInTheDocument();
    expect(props.onDone).not.toHaveBeenCalled();
    expect(bind).not.toHaveBeenCalled();
    get.mockRestore();
    bind.mockRestore();
  });

  it("FT-UI-11 integrates real pending with rows, clear, pagination and all wizard dismissal guards", async () => {
    let release!: () => void;
    const barrier = new Promise<void>((resolve) => { release = resolve; });
    const bind = vi.fn(async () => { await barrier; return HttpResponse.json({ detail: "Forbidden" }, { status: 403 }); });
    const queries: URLSearchParams[] = [];
    server.use(
      http.get(connectionUrl, () => HttpResponse.json({ counter: null })),
      http.post(connectionUrl, bind),
      http.get(url, ({ request }) => {
        queries.push(new URL(request.url).searchParams);
        return HttpResponse.json({ items: [counter, otherCounter], total: 100 });
      }),
      http.get("http://127.0.0.1/api/yandex/accounts", () => HttpResponse.json({ items: [account], total: 1 })),
    );
    renderWithCmsProviders(<PendingWizardFixture />);
    const dialog = screen.getByRole("dialog");
    await waitFor(() => expect(dialog).toBeVisible());
    const wizard = within(dialog);
    const user = userEvent.setup();
    // Discrete clicks suffice for guards; pointer/Enter/Space semantics are covered
    // by FT-UI-09. Avoid repeated jsdom pointer-style walks for the whole modal.
    fireEvent.click(wizard.getByText("Имя аккаунта login-one"));
    // Resolve native controls once. Recomputing every button's accessible name
    // on each getByRole traverses AntD's styled modal repeatedly in jsdom.
    const row = (await wizard.findByText(counter.site)).closest("button")!;
    const secondRow = wizard.getByText(otherCounter.site).closest("button")!;
    const back = wizard.getByText("Назад").closest("button")!;
    const cancel = wizard.getByText("Отмена").closest("button")!;
    const sizeChooser = wizard.getByRole("combobox", { hidden: true });
    expect(row).toHaveAccessibleName(/123456.*example/);
    expect(secondRow).toHaveAccessibleName(/654321.*other/);
    expect(back).toHaveAccessibleName("Назад");
    expect(cancel).toHaveAccessibleName("Отмена");
    const search = wizard.getByRole("textbox", { hidden: true, name: "Поиск счётчиков" });
    // One input event: typing/debounce299/300 is covered by the hook test above.
    fireEvent.change(search, { target: { value: "example" } });
    await waitFor(() => expect(queries.at(-1)?.get("search")).toBe("example"));
    await waitFor(() => expect(row).toBeEnabled());
    fireEvent.click(wizard.getByTitle("3"));
    await waitFor(() => expect(queries.at(-1)?.get("offset")).toBe("40"));
    await waitFor(() => expect(row).toBeEnabled());
    const getCount = queries.length;
    fireEvent.click(row);
    expect(row).toBeDisabled();
    expect(secondRow).toBeDisabled();
    expect(search).toBeDisabled();
    expect(back).toBeDisabled();
    expect(cancel).toBeDisabled();
    expect(dialog.querySelector('button[aria-label="Close"]')).not.toBeInTheDocument();
    expect(sizeChooser).toBeDisabled();
    const clear = dialog.querySelector(".ant-input-clear-icon");
    // AntD may remove the clear affordance when disabled; if retained it must be inert.
    if (clear) fireEvent.click(clear);
    fireEvent.change(search, { target: { value: "blocked" } });
    fireEvent.click(back);
    fireEvent.click(cancel);
    fireEvent.click(wizard.getByTitle("2"));
    fireEvent.click(row);
    fireEvent.click(row);
    fireEvent.click(secondRow);
    await user.keyboard("{Escape}");
    const wrap = dialog.closest(".ant-modal-wrap")!;
    fireEvent.mouseDown(wrap);
    fireEvent.mouseUp(wrap);
    fireEvent.click(wrap);
    expect(dialog).toBeInTheDocument();
    expect(search).toHaveValue("example");
    await waitFor(() => expect(bind).toHaveBeenCalledOnce());
    expect(queries.at(-1)?.get("offset")).toBe("40");
    expect(queries).toHaveLength(getCount);
    release();
    expect(await wizard.findByText("Недостаточно прав. Требуется роль SEO.")).toBeInTheDocument();
    expect(queries).toHaveLength(getCount);
    expect(notification.success).not.toHaveBeenCalled();
    expect(search).toHaveValue("example");
    expect(wizard.getByTitle("3")).toHaveClass("ant-pagination-item-active");
    expect(row).toBeEnabled();
    expect(back).toBeEnabled();
    expect(dialog.querySelector('button[aria-label="Close"]')).toBeInTheDocument();
    expect(bind).toHaveBeenCalledOnce();
  });

  // Terminal navigation/reopen is an independent lifecycle scenario: do not make
  // its second modal mount share FT-UI-11's search/page/deferred-response budget.
  it("FT-UI-11 releases busy after failure, retains account on Back and resets on reopen", async () => {
    let release!: () => void;
    const barrier = new Promise<void>((resolve) => { release = resolve; });
    const bind = vi.fn(async () => { await barrier; return HttpResponse.json({ detail: "Forbidden" }, { status: 403 }); });
    server.use(http.post(connectionUrl, bind));
    renderWithCmsProviders(<PendingWizardFixture />);
    const wizard = within(screen.getByRole("dialog"));
    fireEvent.click(wizard.getByRole("button", { hidden: true, name: /^Имя аккаунта.*login-one/ }));
    const row = await wizard.findByRole("button", { hidden: true, name: /123456.*example/ });
    fireEvent.click(row);
    expect(wizard.getByRole("button", { hidden: true, name: "Назад" })).toBeDisabled();
    expect(wizard.getByRole("button", { hidden: true, name: "Отмена" })).toBeDisabled();
    await waitFor(() => expect(bind).toHaveBeenCalledOnce());
    release();
    expect(await wizard.findByText("Недостаточно прав. Требуется роль SEO.")).toBeInTheDocument();
    expect(row).toBeEnabled();
    expect(wizard.getByRole("button", { hidden: true, name: "Назад" })).toBeEnabled();
    expect(wizard.getByRole("button", { hidden: true, name: "Отмена" })).toBeEnabled();
    fireEvent.click(wizard.getByRole("button", { hidden: true, name: "Назад" }));
    expect(wizard.getByRole("button", { hidden: true, name: /^Имя аккаунта.*login-one/ })).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(wizard.getByRole("button", { hidden: true, name: "Отмена" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { hidden: true, name: "Открыть визард" }));
    const reopened = within(screen.getByRole("dialog"));
    expect(reopened.getByRole("button", { hidden: true, name: "Отмена" })).toBeEnabled();
    expect(reopened.queryByRole("textbox", { hidden: true, name: "Поиск счётчиков" })).not.toBeInTheDocument();
    expect(bind).toHaveBeenCalledOnce();
  });

});

describe("FE-Y01/02 MetricaCounterStep permission lifetime", () => {
  it("allows SEO+ADMIN through the same SEO guard", async () => {
    context.scopes = [KNOWN_USER_SCOPES.SEO, KNOWN_USER_SCOPES.ADMIN];
    const get = vi.spyOn(service, "fetchMetricaCounters").mockResolvedValue(apiSuccess({ items: [counter], total: 1 }));
    const props = makeProps();
    const { result } = renderHook(() => useMetricaCounters(props));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(get).toHaveBeenCalledOnce();
    get.mockRestore();
  });

  it("clears private data and ignores late reads after revoke", async () => {
    let release!: () => void;
    const get = vi.spyOn(service, "fetchMetricaCounters").mockImplementation(() => new Promise((resolve) => {
      release = () => resolve(apiSuccess({ items: [counter], total: 1 }));
    }));
    const props = makeProps();
    const { result, rerender } = renderHook(() => useMetricaCounters(props));
    const staleRefresh = result.current.refresh;
    context.scopes = [KNOWN_USER_SCOPES.ADMIN];
    rerender();
    await act(() => staleRefresh());
    await act(async () => release());
    expect(result.current.counters).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(get).toHaveBeenCalledOnce();
    get.mockRestore();
  });

  it.each(["success", "error"])("ignores late mutation %s after revoke and blocks stale handlers", async (outcome) => {
    const get = vi.spyOn(service, "fetchMetricaCounters").mockResolvedValue(apiSuccess({ items: [counter], total: 1 }));
    let release!: () => void;
    const mutate = vi.spyOn(service, "bindMetricaCounter").mockImplementation(() => new Promise((resolve) => {
      release = () => resolve(outcome === "success" ? apiSuccess(connection) : apiError("Forbidden"));
    }));
    const props = makeProps();
    const { result, rerender } = renderHook(() => useMetricaCounters(props));
    await waitFor(() => expect(result.current.loading).toBe(false));
    const submit = result.current.bindCounter;
    const staleSubmit = () => submit(counter.counter_id);
    let request!: Promise<void>;
    act(() => { request = staleSubmit(); });
    context.scopes = [KNOWN_USER_SCOPES.ADMIN];
    rerender();
    await act(async () => { release(); await request; });
    expect(result.current.counters).toEqual([]);
    expect(notification.success).not.toHaveBeenCalled();
    expect(props.onDone).not.toHaveBeenCalled();
    expect(get).toHaveBeenCalledOnce();
    expect(result.current.mutationError).toBeNull();
    await act(() => staleSubmit());
    expect(mutate).toHaveBeenCalledOnce();
    get.mockRestore();
    mutate.mockRestore();
  });
});

describe("FE-Y01 MetricaCounterStep read denial", () => {
  it.each([["Unauthorized", "Сессия истекла. Войдите в CMS повторно."], ["Forbidden", "Недостаточно прав. Требуется роль SEO."]])("surfaces %s without private data or success", async (detail, expected) => {
    const get = vi.spyOn(service, "fetchMetricaCounters").mockResolvedValue(apiError(detail));
    const { result } = renderHook(() => useMetricaCounters(makeProps()));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe(expected);
    expect(result.current.counters).toEqual([]);
    expect(notification.success).not.toHaveBeenCalled();
    get.mockRestore();
  });
});
