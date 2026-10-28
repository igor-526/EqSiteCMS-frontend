import React from "react";
import { act, renderHook, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { http, HttpResponse } from "msw";
import { renderWithCmsProviders } from "@/test/render";
import { server } from "@/test/msw/server";
import { KNOWN_USER_SCOPES } from "@/types/api/user";
import { apiError, apiSuccess } from "@/lib/apiStatus";
import { useYandexAccounts } from "../hooks/useYandexAccounts";
import { useYandexOAuthPopup } from "../hooks/useYandexOAuthPopup";
import * as service from "../services/seoService";
import { YandexAccountStep } from "./YandexAccountStep";
import { ConnectionWizardModal, type WizardTarget } from "./ConnectionWizardModal";

const context = vi.hoisted(() => ({ scopes: [] as KNOWN_USER_SCOPES[] }));
const notification = vi.hoisted(() => ({ success: vi.fn() }));
vi.mock("@/contexts/UserContext", () => ({ useUserContext: () => context }));
vi.mock("@/hooks/useNotification", () => ({ useNotification: () => notification }));
const url = "http://127.0.0.1/api/yandex/accounts";
const account = {
  id: "account-1", yandex_id: "123", yandex_login: "login-one",
  display_name: "Имя аккаунта", email: "one@example.invalid", yandex_phone: null,
};
const other = { ...account, id: "account-2", yandex_login: "login-two" };
const makeProps = () => ({ selectedAccount: account, onSelect: vi.fn(), onConnectionChange: vi.fn(), onAddAccount: vi.fn() });

beforeEach(() => {
  context.scopes = [KNOWN_USER_SCOPES.SEO];
  notification.success.mockClear();
  server.use(http.get(url, () => HttpResponse.json({ items: [account], total: 1 })));
});

describe("FT-YX-09 accounts hook and list", () => {
  it("uses limit20/offset0, appends at loaded offset and resets on refresh", async () => {
    const queries: string[] = [];
    server.use(http.get(url, ({ request }) => {
      const query = new URL(request.url).searchParams;
      queries.push(query.toString());
      return HttpResponse.json({ items: query.get("offset") === "0" ? [account] : [other], total: 2 });
    }));
    const props = makeProps();
    const { result } = renderHook(() => useYandexAccounts(props));
    await waitFor(() => expect(result.current.accounts).toEqual([account]));
    act(() => result.current.loadMore());
    await waitFor(() => expect(result.current.accounts).toEqual([account, other]));
    await act(() => result.current.refresh());
    expect(result.current.accounts).toEqual([account]);
    expect(queries).toEqual(["limit=20&offset=0", "limit=20&offset=1", "limit=20&offset=0"]);
  });

  it("FT-UI-06 deduplicates overlapping payloads by stable ID, keeps order and advances the raw cursor", async () => {
    const third = { ...account, id: "account-3", yandex_login: "login-three" };
    const fourth = { ...account, id: "account-4", yandex_login: "login-four" };
    const get = vi.spyOn(service, "fetchYandexAccounts")
      .mockResolvedValueOnce(apiSuccess({ items: [account, account], total: 8 }))
      .mockResolvedValueOnce(apiSuccess({ items: [{ ...account, display_name: "Overlap" }, other, other, third], total: 8 }))
      .mockResolvedValueOnce(apiSuccess({ items: [third, fourth], total: 8 }));
    const props = makeProps();
    const { result } = renderHook(() => useYandexAccounts(props));
    try {
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.accounts).toEqual([account]);
      await act(async () => result.current.loadMore());
      expect(result.current.accounts).toEqual([account, other, third]);
      expect(result.current.total).toBe(8);
      await act(async () => result.current.loadMore());
      expect(result.current.accounts).toEqual([account, other, third, fourth]);
      expect(get.mock.calls).toEqual([
        [{ limit: 20, offset: 0 }], [{ limit: 20, offset: 2 }], [{ limit: 20, offset: 6 }],
      ]);
      act(() => result.current.loadMore());
      expect(get).toHaveBeenCalledTimes(3);
      expect(result.current.total).toBe(8);
      expect(props.onSelect).not.toHaveBeenCalled();
    } finally { get.mockRestore(); }
  });

  it("FT-UI-06 advances past a duplicate-only page without replacing existing account data", async () => {
    const get = vi.spyOn(service, "fetchYandexAccounts")
      .mockResolvedValueOnce(apiSuccess({ items: [account], total: 4 }))
      .mockResolvedValueOnce(apiSuccess({ items: [account, account], total: 4 }))
      .mockResolvedValueOnce(apiSuccess({ items: [other], total: 4 }));
    const { result } = renderHook(() => useYandexAccounts(makeProps()));
    try {
      await waitFor(() => expect(result.current.loading).toBe(false));
      await act(async () => result.current.loadMore());
      expect(result.current.accounts).toEqual([account]);
      await act(async () => result.current.loadMore());
      expect(result.current.accounts).toEqual([account, other]);
      expect(get).toHaveBeenLastCalledWith({ limit: 20, offset: 3 });
    } finally { get.mockRestore(); }
  });

  it("FT-UI-06 refresh replaces old pages and account data, resets cursor and accepts an empty result", async () => {
    const refreshed = { ...account, display_name: "Новое имя" };
    const get = vi.spyOn(service, "fetchYandexAccounts")
      .mockResolvedValueOnce(apiSuccess({ items: [account], total: 3 }))
      .mockResolvedValueOnce(apiSuccess({ items: [account, other], total: 3 }))
      .mockResolvedValueOnce(apiSuccess({ items: [refreshed, refreshed], total: 3 }))
      .mockResolvedValueOnce(apiSuccess({ items: [other], total: 3 }))
      .mockResolvedValueOnce(apiSuccess({ items: [], total: 0 }));
    const { result } = renderHook(() => useYandexAccounts(makeProps()));
    try {
      await waitFor(() => expect(result.current.loading).toBe(false));
      await act(async () => result.current.loadMore());
      await act(() => result.current.refresh());
      expect(result.current.accounts).toEqual([refreshed]);
      expect(get).toHaveBeenLastCalledWith({ limit: 20, offset: 0 });
      await act(async () => result.current.loadMore());
      expect(get).toHaveBeenLastCalledWith({ limit: 20, offset: 2 });
      expect(result.current.accounts).toEqual([refreshed, other]);
      await act(() => result.current.refresh());
      expect(result.current.accounts).toEqual([]);
      expect(result.current.total).toBe(0);
      act(() => result.current.loadMore());
      expect(get).toHaveBeenCalledTimes(5);
    } finally { get.mockRestore(); }
  });

  it.each(["denied", "network"])("FT-UI-06 preserves accounts and raw cursor after an append %s error", async (failure) => {
    const get = vi.spyOn(service, "fetchYandexAccounts")
      .mockResolvedValueOnce(apiSuccess({ items: [account, account], total: 4 }));
    if (failure === "denied") get.mockResolvedValueOnce(apiError("Forbidden"));
    else get.mockRejectedValueOnce(new Error("network"));
    get.mockResolvedValueOnce(apiSuccess({ items: [account, other], total: 4 }));
    const props = makeProps();
    const { result } = renderHook(() => useYandexAccounts(props));
    try {
      await waitFor(() => expect(result.current.loading).toBe(false));
      await act(async () => result.current.loadMore());
      expect(result.current.accounts).toEqual([account]);
      expect(result.current.error).toBe(failure === "denied"
        ? "Недостаточно прав. Требуется роль SEO." : "Не удалось загрузить аккаунты");
      expect(result.current.total).toBe(4);
      expect(props.onSelect).not.toHaveBeenCalled();
      await act(async () => result.current.loadMore());
      expect(result.current.accounts).toEqual([account, other]);
      expect(result.current.error).toBeNull();
      expect(get.mock.calls).toEqual([
        [{ limit: 20, offset: 0 }], [{ limit: 20, offset: 2 }], [{ limit: 20, offset: 2 }],
      ]);
    } finally { get.mockRestore(); }
  });

  it("FT-UI-06 keeps the dedup state local to each mounted account list", async () => {
    const get = vi.spyOn(service, "fetchYandexAccounts")
      .mockResolvedValueOnce(apiSuccess({ items: [account, account], total: 3 }))
      .mockResolvedValueOnce(apiSuccess({ items: [account, other], total: 2 }));
    try {
      const first = renderHook(() => useYandexAccounts(makeProps()));
      await waitFor(() => expect(first.result.current.loading).toBe(false));
      expect(first.result.current.accounts).toEqual([account]);
      first.unmount();
      const second = renderHook(() => useYandexAccounts(makeProps()));
      await waitFor(() => expect(second.result.current.loading).toBe(false));
      expect(second.result.current.accounts).toEqual([account, other]);
      expect(get.mock.calls).toEqual([[{ limit: 20, offset: 0 }], [{ limit: 20, offset: 0 }]]);
    } finally { get.mockRestore(); }
  });

  it("FT-UI-06 renders and selects an overlapping account once, then clears selection on unlink", async () => {
    const get = vi.spyOn(service, "fetchYandexAccounts")
      .mockResolvedValueOnce(apiSuccess({ items: [account], total: 3 }))
      .mockResolvedValueOnce(apiSuccess({ items: [account, other], total: 3 }))
      .mockResolvedValueOnce(apiSuccess({ items: [other], total: 1 }));
    const remove = vi.spyOn(service, "unlinkYandexAccount").mockResolvedValue(apiSuccess(null));
    const props = makeProps();
    try {
      renderWithCmsProviders(<YandexAccountStep {...props} />);
      await screen.findByRole("listitem");
      await userEvent.click(screen.getByRole("button", { name: "Показать ещё" }));
      await waitFor(() => expect(screen.getAllByRole("listitem")).toHaveLength(2));
      const selected = screen.getAllByRole("button", { name: /Имя аккаунта login-one/ });
      expect(selected).toHaveLength(1);
      expect(selected[0]).toHaveAttribute("aria-pressed", "true");
      await userEvent.click(selected[0]);
      expect(props.onSelect).toHaveBeenCalledExactlyOnceWith(account);
      props.onSelect.mockClear();
      await userEvent.click(screen.getByRole("button", { name: "Отвязать аккаунт login-one" }));
      await userEvent.click(screen.getByRole("button", { name: "Подтвердить" }));
      await waitFor(() => expect(screen.getAllByRole("listitem")).toHaveLength(1));
      expect(props.onSelect).toHaveBeenCalledExactlyOnceWith(null);
      expect(remove).toHaveBeenCalledExactlyOnceWith(account.id);
      expect(props.onConnectionChange).toHaveBeenCalledOnce();
      expect(screen.queryByRole("button", { name: /Имя аккаунта login-one/ })).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Имя аккаунта login-two/ })).toHaveAttribute("aria-pressed", "false");
      expect(get).toHaveBeenLastCalledWith({ limit: 20, offset: 0 });
    } finally { get.mockRestore(); remove.mockRestore(); }
  });

  it.each(["success", "closed"])("FT-UI-06/07 OAuth %s resets offset after append instead of appending refreshed accounts", async (terminal) => {
    const get = vi.spyOn(service, "fetchYandexAccounts")
      .mockResolvedValueOnce(apiSuccess({ items: [account], total: 3 }))
      .mockResolvedValueOnce(apiSuccess({ items: [account, other], total: 3 }))
      .mockResolvedValueOnce(apiSuccess({ items: [account, other], total: 2 }));
    const link = vi.spyOn(service, "fetchYandexAuthLink").mockResolvedValue(apiSuccess({ auth_link: "https://oauth.yandex.invalid/authorize" }));
    const popup = { closed: false, focus: vi.fn() };
    const open = vi.spyOn(window, "open").mockReturnValue(popup as unknown as Window);
    const { result } = renderHook(() => {
      const accounts = useYandexAccounts(makeProps());
      const oauth = useYandexOAuthPopup(accounts.refresh);
      return { accounts, oauth };
    });
    try {
      await waitFor(() => expect(result.current.accounts.accounts).toEqual([account]));
      await act(async () => result.current.accounts.loadMore());
      expect(result.current.accounts.accounts).toEqual([account, other]);
      expect(get).toHaveBeenNthCalledWith(2, { limit: 20, offset: 1 });
      vi.useFakeTimers();
      await act(() => result.current.oauth.open());
      if (terminal === "success") {
        await act(async () => window.dispatchEvent(new MessageEvent("message", {
          origin: window.location.origin, source: popup as unknown as Window,
          data: { type: "eqsite:yandex-oauth", status: "success" },
        })));
      } else {
        popup.closed = true;
        await act(() => vi.advanceTimersByTimeAsync(500));
      }
      expect(get).toHaveBeenCalledTimes(3);
      expect(get).toHaveBeenLastCalledWith({ limit: 20, offset: 0 });
      expect(result.current.accounts.accounts).toEqual([account, other]);
      expect(new Set(result.current.accounts.accounts.map(({ id }) => id)).size).toBe(2);
      expect(result.current.oauth.waiting).toBe(false);
    } finally {
      vi.useRealTimers();
      get.mockRestore();
      link.mockRestore();
      open.mockRestore();
    }
  });

  it("shows loading, data, selection, load more, and add last", async () => {
    let release!: () => void;
    const barrier = new Promise<void>((resolve) => { release = resolve; });
    server.use(http.get(url, async () => { await barrier; return HttpResponse.json({ items: [account], total: 2 }); }));
    const props = makeProps();
    renderWithCmsProviders(<YandexAccountStep {...props} />);
    expect(screen.getAllByText("Загрузка аккаунтов").length).toBeGreaterThan(0);
    release();
    await screen.findByText(account.display_name);
    expect(screen.getByText(/one@example.invalid/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /Имя аккаунта login-one/ }));
    expect(props.onSelect).toHaveBeenCalledWith(account);
    expect(screen.getByRole("button", { name: "Показать ещё" })).toBeEnabled();
    const buttons = screen.getAllByRole("button");
    expect(buttons.at(-1)).toHaveTextContent("Добавить аккаунт");
    await userEvent.click(buttons.at(-1)!);
    expect(props.onAddAccount).toHaveBeenCalledOnce();
  });

  it("shows empty and error with retry", async () => {
    server.use(http.get(url, () => HttpResponse.json({ detail: "Сервис недоступен" }, { status: 502 })));
    renderWithCmsProviders(<YandexAccountStep {...makeProps()} />);
    expect(await screen.findByText("Сервис недоступен")).toBeInTheDocument();
    server.use(http.get(url, () => HttpResponse.json({ items: [], total: 0 })));
    await userEvent.click(screen.getByRole("button", { name: "Обновить аккаунты" }));
    expect(await screen.findByText("Нет аккаунтов. Добавьте аккаунт Яндекса.")).toBeInTheDocument();
    expect(screen.getAllByText("Нет аккаунтов. Добавьте аккаунт Яндекса.")).toHaveLength(1);
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
    expect(screen.getAllByText("No data")).toHaveLength(1);
  });

  it.each([[], [KNOWN_USER_SCOPES.ADMIN], [KNOWN_USER_SCOPES.SUPERUSER], [KNOWN_USER_SCOPES.DEVELOPER]])("hides mutations and prevents sensitive GET without SEO: %j", async (...scopes) => {
    context.scopes = scopes;
    const get = vi.spyOn(service, "fetchYandexAccounts");
    renderWithCmsProviders(<YandexAccountStep {...makeProps()} />);
    expect(screen.queryByRole("button", { name: "Добавить аккаунт" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Отвязать/ })).not.toBeInTheDocument();
    expect(get).not.toHaveBeenCalled();
    get.mockRestore();
  });
});

describe("FT-UI-03..05 compact account actions", () => {
  it.each(["{Enter}", " "])("activates the main native button once with %s and keeps long values", async (key) => {
    const long = { ...account, display_name: "ОченьДлинноеИмя".repeat(12), email: "long".repeat(30) + "@example.invalid" };
    server.use(http.get(url, () => HttpResponse.json({ items: [long], total: 1 })));
    const props = makeProps();
    renderWithCmsProviders(<YandexAccountStep {...props} />);
    const row = await screen.findByRole("listitem");
    const buttons = within(row).getAllByRole("button");
    expect(buttons).toHaveLength(2);
    expect(buttons[0]).toHaveTextContent(long.display_name);
    expect(buttons[0]).toHaveTextContent(long.email);
    expect(within(buttons[0]).queryByRole("button")).not.toBeInTheDocument();
    expect(buttons[1].parentElement).toBe(buttons[0].parentElement);
    buttons[0].focus();
    await userEvent.keyboard(key);
    expect(props.onSelect).toHaveBeenCalledExactlyOnceWith(long);
  });

  it.each(["{Enter}", " "])("isolates unlink %s from selection and DELETE until confirm", async (key) => {
    const remove = vi.spyOn(service, "unlinkYandexAccount");
    const props = makeProps();
    renderWithCmsProviders(<YandexAccountStep {...props} />);
    const unlink = await screen.findByRole("button", { name: "Отвязать аккаунт login-one" });
    unlink.focus();
    await userEvent.keyboard(key);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText(/Привязка счётчика через этот аккаунт тоже будет удалена/)).toBeInTheDocument();
    expect(props.onSelect).not.toHaveBeenCalled();
    expect(remove).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole("button", { name: "Отмена" }));
    expect(remove).not.toHaveBeenCalled();
    remove.mockRestore();
  });

  it.each(["click", "{Enter}", " "])("opens target immediately on %s and restores selected row focus on Back", async (activation) => {
    const target: WizardTarget = {
      key: "host", title: "Подключение", stepTitle: "Хост",
      renderStep: ({ account: selected }) => <span>Хост для {selected.yandex_login}</span>,
    };
    renderWithCmsProviders(<ConnectionWizardModal open target={target}
      renderAccountStep={(props) => <YandexAccountStep {...props} />}
      onCancel={vi.fn()} onDone={vi.fn()} onConnectionChange={vi.fn()} />);
    let row = await screen.findByRole("button", { name: /Имя аккаунта login-one/ });
    if (activation === "click") await userEvent.click(row);
    else { row.focus(); await userEvent.keyboard(activation); }
    expect(screen.getByText("Хост для login-one")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Хост" })).toHaveFocus();
    expect(screen.queryByRole("button", { name: "Далее" })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Назад" }));
    row = await screen.findByRole("button", { name: /Имя аккаунта login-one/ });
    expect(row).toHaveAttribute("aria-pressed", "true");
    await waitFor(() => expect(row).toHaveFocus());
    expect(screen.queryByText("Хост для login-one")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Отвязать аккаунт login-one" }));
    expect(screen.getAllByRole("dialog")).toHaveLength(2);
    expect(screen.queryByText("Хост для login-one")).not.toBeInTheDocument();
  });

  it("disables row/add/refresh/confirmation while unlink is pending", async () => {
    let release!: () => void;
    const remove = vi.spyOn(service, "unlinkYandexAccount").mockImplementation(() => new Promise((resolve) => {
      release = () => resolve(apiError("Forbidden"));
    }));
    const props = makeProps();
    renderWithCmsProviders(<YandexAccountStep {...props} />);
    await userEvent.click(await screen.findByRole("button", { name: "Отвязать аккаунт login-one" }));
    await userEvent.click(screen.getByRole("button", { name: "Подтвердить" }));
    expect(screen.getByRole("button", { name: /Имя аккаунта login-one/ })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Обновить аккаунты" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Добавить аккаунт" })).toBeDisabled();
    expect(screen.getByRole("button", { name: /Подтвердить/ })).toBeDisabled();
    await userEvent.keyboard("{Escape}");
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(props.onSelect).not.toHaveBeenCalled();
    await act(async () => release());
    expect(await screen.findByText(/Недостаточно прав/)).toBeInTheDocument();
    expect(remove).toHaveBeenCalledOnce();
    remove.mockRestore();
  });
});

describe("FT-YX-10 account confirmation", () => {
  it("warns of cascade, cancel sends no DELETE; success refreshes list/connection and resets selected account", async () => {
    let removed = false;
    const get = vi.fn(() => HttpResponse.json({ items: removed ? [] : [account], total: removed ? 0 : 1 }));
    const remove = vi.fn(() => { removed = true; return new HttpResponse(null, { status: 204 }); });
    server.use(http.get(url, get), http.delete(`${url}/${account.id}`, remove));
    const props = makeProps();
    renderWithCmsProviders(<YandexAccountStep {...props} />);
    await userEvent.click(await screen.findByRole("button", { name: "Отвязать аккаунт login-one" }));
    expect(screen.getByText(/Привязка счётчика через этот аккаунт тоже будет удалена/)).toBeInTheDocument();
    expect(props.onSelect).not.toHaveBeenCalled();
    expect(remove).not.toHaveBeenCalled();
    await userEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Отмена" }));
    expect(remove).not.toHaveBeenCalled();
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    await userEvent.click(screen.getByRole("button", { name: "Отвязать аккаунт login-one" }));
    await userEvent.click(screen.getByRole("button", { name: "Подтвердить" }));
    await waitFor(() => expect(props.onConnectionChange).toHaveBeenCalledOnce());
    expect(props.onSelect).toHaveBeenCalledWith(null);
    expect(await screen.findByText("Нет аккаунтов. Добавьте аккаунт Яндекса.")).toBeInTheDocument();
    expect(get).toHaveBeenCalledTimes(2);
  });

  it.each([[403, "Forbidden", /Недостаточно прав/], [404, "Not found", /уже отсутствует/], [401, "Unauthorized", /Сессия истекла/]] as const)("keeps modal and displays %i, refreshes accounts", async (_status, detail, message) => {
    // The API client owns 401 reauthentication; ApiResult contains only detail.
    const remove = vi.spyOn(service, "unlinkYandexAccount").mockResolvedValue(apiError(detail));
    const get = vi.spyOn(service, "fetchYandexAccounts");
    const props = makeProps();
    renderWithCmsProviders(<YandexAccountStep {...props} />);
    await userEvent.click(await screen.findByRole("button", { name: "Отвязать аккаунт login-one" }));
    await userEvent.click(screen.getByRole("button", { name: "Подтвердить" }));
    expect(await within(screen.getByRole("dialog")).findByText(message)).toBeInTheDocument();
    await waitFor(() => expect(get).toHaveBeenCalledTimes(2));
    expect(props.onSelect).not.toHaveBeenCalled();
    expect(props.onConnectionChange).not.toHaveBeenCalled();
    remove.mockRestore();
    get.mockRestore();
  });

  it("synchronously prevents double-submit and rechecks revoked permission", async () => {
    const props = makeProps();
    const { result, rerender } = renderHook(() => useYandexAccounts(props));
    await waitFor(() => expect(result.current.accounts).toHaveLength(1));
    act(() => result.current.openConfirmation(account));
    context.scopes = [];
    rerender();
    const remove = vi.spyOn(service, "unlinkYandexAccount");
    await act(() => result.current.unlinkAccount());
    expect(remove).not.toHaveBeenCalled();
    expect(result.current.mutationError).toBe("Недостаточно прав");
    context.scopes = [KNOWN_USER_SCOPES.SEO];
    rerender();
    act(() => result.current.openConfirmation(account));
    let release!: () => void;
    remove.mockImplementation(() => new Promise((resolve) => { release = () => resolve(apiSuccess(null)); }));
    let request!: Promise<void>;
    act(() => { request = result.current.unlinkAccount(); void result.current.unlinkAccount(); });
    expect(remove).toHaveBeenCalledOnce();
    expect(result.current.pending).toBe(true);
    await act(async () => { release(); await request; });
    expect(result.current.pending).toBe(false);
    remove.mockRestore();
  });

  it("handles thrown read/delete errors and does not reset a different selected account", async () => {
    const get = vi.spyOn(service, "fetchYandexAccounts").mockRejectedValueOnce(new Error("network"));
    const props = { ...makeProps(), selectedAccount: other };
    const { result } = renderHook(() => useYandexAccounts(props));
    await waitFor(() => expect(result.current.error).toBe("Не удалось загрузить аккаунты"));
    await act(() => result.current.refresh());
    act(() => result.current.openConfirmation(account));
    const remove = vi.spyOn(service, "unlinkYandexAccount").mockRejectedValueOnce(new Error("network"));
    await act(() => result.current.unlinkAccount());
    expect(result.current.mutationError).toBe("Не удалось отвязать аккаунт");
    remove.mockResolvedValueOnce(apiSuccess(null));
    await act(() => result.current.unlinkAccount());
    expect(props.onSelect).not.toHaveBeenCalled();
    get.mockRestore();
    remove.mockRestore();
  });
});

describe("FE-Y01/02 YandexAccountStep permission lifetime", () => {
  it("allows SEO+ADMIN through the same SEO guard", async () => {
    context.scopes = [KNOWN_USER_SCOPES.SEO, KNOWN_USER_SCOPES.ADMIN];
    const get = vi.spyOn(service, "fetchYandexAccounts").mockResolvedValue(apiSuccess({ items: [account], total: 1 }));
    const props = makeProps();
    const { result } = renderHook(() => useYandexAccounts(props));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(get).toHaveBeenCalledOnce();
    get.mockRestore();
  });

  it("clears private data and ignores late reads after revoke", async () => {
    let release!: () => void;
    const get = vi.spyOn(service, "fetchYandexAccounts").mockImplementation(() => new Promise((resolve) => {
      release = () => resolve(apiSuccess({ items: [account], total: 1 }));
    }));
    const props = makeProps();
    const { result, rerender } = renderHook(() => useYandexAccounts(props));
    const staleRefresh = result.current.refresh;
    context.scopes = [KNOWN_USER_SCOPES.ADMIN];
    rerender();
    await act(() => staleRefresh());
    await act(async () => release());
    expect(result.current.accounts).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(get).toHaveBeenCalledOnce();
    get.mockRestore();
  });

  it.each(["success", "error"])("ignores late mutation %s after revoke and blocks stale handlers", async (outcome) => {
    const get = vi.spyOn(service, "fetchYandexAccounts").mockResolvedValue(apiSuccess({ items: [account], total: 1 }));
    let release!: () => void;
    const mutate = vi.spyOn(service, "unlinkYandexAccount").mockImplementation(() => new Promise((resolve) => {
      release = () => resolve(outcome === "success" ? apiSuccess(null) : apiError("Forbidden"));
    }));
    const props = makeProps();
    const { result, rerender } = renderHook(() => useYandexAccounts(props));
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => { result.current.openConfirmation(account); });
    const submit = result.current.unlinkAccount;
    const staleSubmit = () => submit();
    let request!: Promise<void>;
    act(() => { request = staleSubmit(); });
    context.scopes = [KNOWN_USER_SCOPES.ADMIN];
    rerender();
    await act(async () => { release(); await request; });
    expect(result.current.accounts).toEqual([]);
    expect(notification.success).not.toHaveBeenCalled();
    expect(props.onConnectionChange).not.toHaveBeenCalled();
    expect(get).toHaveBeenCalledOnce();
    expect(result.current.mutationError).toBeNull();
    await act(() => staleSubmit());
    expect(mutate).toHaveBeenCalledOnce();
    get.mockRestore();
    mutate.mockRestore();
  });
});

describe("FE-Y01 YandexAccountStep read denial", () => {
  it.each([["Unauthorized", "Сессия истекла. Войдите в CMS повторно."], ["Forbidden", "Недостаточно прав. Требуется роль SEO."]])("surfaces %s without private data or success", async (detail, expected) => {
    const get = vi.spyOn(service, "fetchYandexAccounts").mockResolvedValue(apiError(detail));
    const { result } = renderHook(() => useYandexAccounts(makeProps()));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe(expected);
    expect(result.current.accounts).toEqual([]);
    expect(notification.success).not.toHaveBeenCalled();
    get.mockRestore();
  });
});


it("FE-Y02 clears account confirmation and private rows on revoke without reviving on regrant", async () => {
  const remove = vi.spyOn(service, "unlinkYandexAccount");
  const props = makeProps();
  const { rerender } = renderWithCmsProviders(<YandexAccountStep {...props} />);
  await userEvent.click(await screen.findByRole("button", { name: "Отвязать аккаунт login-one" }));
  expect(screen.getByRole("dialog")).toBeInTheDocument();
  context.scopes = [KNOWN_USER_SCOPES.ADMIN];
  rerender(<YandexAccountStep {...props} />);
  await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  expect(screen.queryByText(account.email)).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Добавить аккаунт" })).not.toBeInTheDocument();
  context.scopes = [KNOWN_USER_SCOPES.SEO];
  rerender(<YandexAccountStep {...props} />);
  await screen.findByRole("button", { name: "Отвязать аккаунт login-one" });
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(remove).not.toHaveBeenCalled();
  remove.mockRestore();
});
