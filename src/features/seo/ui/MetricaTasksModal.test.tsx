import { act, fireEvent, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { http, HttpResponse } from "msw";
import { Empty, message } from "antd";
import { renderWithCmsProviders } from "@/test/render";
import { server } from "@/test/msw/server";
import { KNOWN_USER_SCOPES } from "@/types/api/user";
import { MetricaTasksLauncher } from "./MetricaTasksLauncher";

const context = vi.hoisted(() => ({ scopes: [] as KNOWN_USER_SCOPES[] }));
vi.mock("@/contexts/UserContext", () => ({ useUserContext: () => context }));
vi.mock("antd", async importOriginal => {
  const actual = await importOriginal<typeof import("antd")>();
  return { ...actual, message: { ...actual.message, success: vi.fn() } };
});
const base = "http://127.0.0.1/api";
const tasksUrl = `${base}/seo/metrica/tasks`;
const postUrl = `${base}/seo/parse-jobs`;
const items = [
  { id: "delete:z", type: "delete", status: "running", is_active: true, created_at: "2026-01-01T03:04:00Z" },
  { id: "parsing:a", type: "parsing", status: "queued", is_active: true, created_at: "2026-01-03T03:04:00Z" },
  { id: "merge:a", type: "merge", status: "failed", is_active: false, created_at: "2026-01-02T03:04:00Z" },
];
const list = vi.fn();
const post = vi.fn();
const tasksDialog = () => screen.getByText("Задачи Яндекс.Метрики").closest<HTMLElement>('[role="dialog"]')!;
// rc-util deliberately returns the same "test-id" for every modal in NODE_ENV=test.
// Resolve title containment only in jsdom; browser checks use accessible names.
const confirmDialog = () => screen.getByText("Обновить данные?").closest<HTMLElement>('[role="dialog"]')!;
const escape = (element: HTMLElement) => fireEvent.keyDown(element, { key: "Escape", code: "Escape", keyCode: 27 });

beforeEach(() => {
  context.scopes = [KNOWN_USER_SCOPES.SEO];
  vi.mocked(message.success).mockClear();
  list.mockReset();
  list.mockImplementation(({ request }: { request: Request }) => {
    listQuery.push(new URL(request.url).search);
    return HttpResponse.json({ items, total: 65 });
  });
  post.mockReset();
  post.mockImplementation(() => HttpResponse.json({ provider: "ya_metrica", status: "queued" }, { status: 202 }));
  listQuery.length = 0;
  server.use(http.get(tasksUrl, list), http.post(postUrl, post));
});
const listQuery: string[] = [];
async function open() {
  renderWithCmsProviders(<MetricaTasksLauncher bindingKey="binding:123:account" />);
  await userEvent.click(screen.getByRole("button", { name: "Задачи" }));
  await screen.findByText("Удаление данных");
}
async function openConfirmation() {
  await open();
  await userEvent.click(screen.getByRole("button", { name: "Обновить данные" }));
}

describe("FE-07 tasks table and pagination", () => {
  it("renders tenant history, Russian labels/dates in server order, without sort/filter", async () => {
    await open();
    expect(tasksDialog()).toHaveTextContent("История задач конюшни, включая предыдущие привязки");
    const rows = within(tasksDialog()).getAllByRole("row");
    expect(rows.slice(1).map(row => row.textContent)).toEqual([
      expect.stringContaining("Удаление данныхВыполняется"),
      expect.stringContaining("Парсинг метрикВ очереди"),
      expect.stringContaining("Слияние метрик страницОшибка"),
    ]);
    expect(tasksDialog().querySelector('time[datetime="2026-01-01T03:04:00Z"]')).toHaveTextContent("01.01.2026");
    expect(tasksDialog().querySelector(".ant-table-column-sorters")).toBeNull();
    expect(listQuery).toEqual(["?limit=20&offset=0"]);
    expect(post).not.toHaveBeenCalled();
  });

  it("FE-11 makes the actual scroll body a named keyboard tab stop after each reload", async () => {
    await open();
    const expectScrollableBody = async () => {
      const body = tasksDialog().querySelector<HTMLElement>(".ant-table-body")!;
      await waitFor(() => expect(body).toHaveAttribute("tabindex", "0"));
      expect(body).toHaveAttribute("role", "region");
      expect(body).toHaveAccessibleName("Прокрутка истории задач");
      const paginator = within(tasksDialog()).getByRole("combobox");
      act(() => paginator.focus());
      await userEvent.tab();
      expect(body).toHaveFocus();
      await userEvent.tab();
      expect(within(tasksDialog()).getByRole("button", { name: "Закрыть" })).toHaveFocus();
      await userEvent.tab({ shift: true });
      expect(body).toHaveFocus();
    };
    await expectScrollableBody();
    await userEvent.click(screen.getByRole("button", { name: "Обновить список" }));
    await waitFor(() => expect(list).toHaveBeenCalledTimes(2));
    await screen.findByText("Удаление данных");
    await expectScrollableBody();
    expect(post).not.toHaveBeenCalled();
  });

  it("MANUAL-A11Y-01 gives only the tasks empty description sufficient text contrast", async () => {
    server.use(http.get(tasksUrl, () => HttpResponse.json({ items: [], total: 0 })));
    renderWithCmsProviders(<><Empty description="Вне окна" /><MetricaTasksLauncher bindingKey="binding" /></>);
    await userEvent.click(screen.getByRole("button", { name: "Задачи" }));
    const description = await screen.findByText("Задач пока нет");
    expect(description).toHaveStyle({ color: "#595959" });
    expect(screen.getByText("Вне окна")).toHaveStyle({ color: "var(--ant-color-text-description)" });
    expect(post).not.toHaveBeenCalled();
  });

  it("MANUAL-A11Y-01 keeps hovered tasks actions readable while table receives keyboard focus", async () => {
    await open();
    for (const name of ["Обновить список", "Обновить данные"]) {
      const button = within(tasksDialog()).getByRole("button", { name });
      const rules = Array.from(document.styleSheets).flatMap(sheet => Array.from(sheet.cssRules))
        .filter((rule): rule is CSSStyleRule => rule instanceof CSSStyleRule)
        .filter(rule => rule.selectorText.includes(".ant-btn-color-default.ant-btn-variant-outlined:not(:disabled)"))
        .filter(rule => button.matches(rule.selectorText.split(":not(:disabled)")[0]));
      for (const state of [":hover", ":focus-visible", ":active"]) {
        const rule = rules.find(candidate => candidate.selectorText.includes(state));
        expect(rule?.style.getPropertyValue("color")).toBe("rgb(9, 88, 217)");
        expect(rule?.style.getPropertyValue("background-color")).toBe("rgb(255, 255, 255)");
        expect(rule?.style.getPropertyValue("outline")).toBe("");
      }
    }
  });

  it("distinguishes loading from empty, then closes and restores trigger focus", async () => {
    let release!: () => void;
    const barrier = new Promise<void>(resolve => { release = resolve; });
    server.use(http.get(tasksUrl, async () => { await barrier; return HttpResponse.json({ items: [], total: 0 }); }));
    renderWithCmsProviders(<MetricaTasksLauncher bindingKey="binding" />);
    const trigger = screen.getByRole("button", { name: "Задачи" });
    await userEvent.click(trigger);
    expect(screen.getByRole("status")).toHaveTextContent("Загрузка задач");
    expect(screen.queryByText("Задач пока нет")).not.toBeInTheDocument();
    expect(screen.getByRole("region", { name: "История задач" })).toHaveAttribute("aria-busy", "true");
    await act(async () => release());
    await screen.findByText("Задач пока нет");
    escape(tasksDialog());
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
  });

  it.each([400, 401, 403, 502, "network"])("GET %s shows safe error and explicit retry, never false empty", async status => {
    const fail = vi.fn(() => status === "network" ? HttpResponse.error() : HttpResponse.json({ detail: "private body" }, { status: status as number }));
    const auth = vi.fn(() => new HttpResponse(null, { status: 401 }));
    server.use(http.get(tasksUrl, fail), http.post(`${base}/auth/refresh`, auth));
    renderWithCmsProviders(<MetricaTasksLauncher bindingKey="binding" />);
    await userEvent.click(screen.getByRole("button", { name: "Задачи" }));
    expect(await within(tasksDialog()).findByRole("alert")).not.toHaveTextContent("private body");
    expect(screen.queryByText("Задач пока нет")).not.toBeInTheDocument();
    expect(fail).toHaveBeenCalledOnce();
    expect(auth).toHaveBeenCalledTimes(status === 401 ? 1 : 0);
    server.use(http.get(tasksUrl, () => HttpResponse.json({ items: [], total: 0 })));
    await userEvent.click(screen.getByRole("button", { name: "Повторить" }));
    await screen.findByText("Задач пока нет");
    expect(post).not.toHaveBeenCalled();
  });

  it("page/size/reopen adapt to limit-offset and manual GET retains current page", async () => {
    await open();
    await userEvent.click(within(tasksDialog()).getByTitle("2"));
    await waitFor(() => expect(listQuery.at(-1)).toBe("?limit=20&offset=20"));
    await screen.findByText("Удаление данных");
    await userEvent.click(screen.getByRole("button", { name: "Обновить список" }));
    await waitFor(() => expect(list).toHaveBeenCalledTimes(3));
    expect(listQuery.at(-1)).toBe("?limit=20&offset=20");
    await screen.findByText("Удаление данных");
    await userEvent.click(within(tasksDialog()).getByRole("combobox"));
    const options = await screen.findAllByRole("option");
    expect(options.map(option => option.textContent)).toEqual(["20 / page", "50 / page", "100 / page"]);
    await userEvent.click(options[1]);
    await waitFor(() => expect(listQuery.at(-1)).toBe("?limit=50&offset=0"));
    await userEvent.click(screen.getByRole("button", { name: "Закрыть" }));
    await userEvent.click(screen.getByRole("button", { name: "Задачи" }));
    await waitFor(() => expect(listQuery.at(-1)).toBe("?limit=20&offset=0"));
    expect(post).not.toHaveBeenCalled();
  });

  it.each([[], [KNOWN_USER_SCOPES.ADMIN]])("no SEO means no trigger, GET or POST: %j", async (...scopes) => {
    context.scopes = scopes;
    renderWithCmsProviders(<MetricaTasksLauncher bindingKey="binding" />);
    expect(screen.queryByRole("button", { name: "Задачи" })).not.toBeInTheDocument();
    expect(list).not.toHaveBeenCalled();
    expect(post).not.toHaveBeenCalled();
  });
});

describe("FE-08 nested confirmation", () => {
  it("Space/Escape, Cancel and Close affect only confirmation and restore inner focus without POST", async () => {
    await open();
    const trigger = screen.getByRole("button", { name: "Обновить данные" });
    for (const cancel of ["Escape", "Отмена", "Close"]) {
      act(() => trigger.focus());
      await userEvent.keyboard(" ");
      const dialog = confirmDialog();
      expect(dialog).toHaveTextContent(/за последние дни.*в фоне/);
      if (cancel === "Escape") escape(dialog);
      else await userEvent.click(within(dialog).getByRole("button", { name: cancel }));
      await waitFor(() => expect(screen.queryByText("Обновить данные?")).not.toBeInTheDocument());
      expect(tasksDialog()).toBeInTheDocument();
      expect(trigger).toHaveFocus();
    }
    expect(post).not.toHaveBeenCalled();
  });

  it("preserves scoped refresh confirmation contrast and non-danger without unlink delay", async () => {
    await openConfirmation();
    const confirm = within(confirmDialog()).getByRole("button", { name: /Подтвердить/ });
    expect(confirm).toBeEnabled();
    expect(confirm).not.toHaveClass("ant-btn-dangerous");
    expect(confirm).toHaveStyle({ color: "#ffffff", backgroundColor: "#0958d9" });
    const rules = Array.from(document.styleSheets).flatMap(sheet => Array.from(sheet.cssRules))
      .filter((rule): rule is CSSStyleRule => rule instanceof CSSStyleRule)
      .filter(rule => [...confirm.classList].some(name => rule.selectorText.includes(`.${name}:not(:disabled)`)));
    for (const state of [":hover", ":focus-visible", ":active"]) {
      const rule = rules.find(candidate => candidate.selectorText.includes(state));
      expect(rule?.style.getPropertyValue("color")).toBe("rgb(255, 255, 255)");
      expect(rule?.style.getPropertyValue("background-color")).toBe("rgb(0, 62, 179)");
      expect(rule?.style.getPropertyValue("outline")).toBe("");
    }
  });

  it("double submit sends one POST; pending blocks both closes; 202 does exactly one reload at zero without optimistic row", async () => {
    let release!: () => void;
    const barrier = new Promise<void>(resolve => { release = resolve; });
    post.mockImplementation(async ({ request }: { request: Request }) => {
      expect(await request.json()).toEqual({ provider: "ya_metrica" });
      await barrier;
      return HttpResponse.json({ provider: "ya_metrica", status: "queued" }, { status: 202 });
    });
    await open();
    await userEvent.click(within(tasksDialog()).getByTitle("2"));
    await screen.findByText("Удаление данных");
    await userEvent.click(screen.getByRole("button", { name: "Обновить данные" }));
    const dialog = confirmDialog();
    await userEvent.dblClick(within(dialog).getByRole("button", { name: /Подтвердить/ }));
    await waitFor(() => expect(post).toHaveBeenCalledOnce());
    expect(within(dialog).getByRole("button", { name: /Подтвердить/ })).toBeDisabled();
    expect(within(dialog).getByRole("button", { name: "Отмена" })).toBeDisabled();
    expect(within(tasksDialog()).getByRole("button", { name: "Закрыть" })).toBeDisabled();
    expect(within(tasksDialog()).queryByRole("button", { name: "Close" })).not.toBeInTheDocument();
    escape(dialog);
    escape(tasksDialog());
    expect(screen.getAllByRole("dialog")).toHaveLength(2);
    expect(list).toHaveBeenCalledTimes(2);
    await act(async () => release());
    await waitFor(() => expect(screen.queryByText("Обновить данные?")).not.toBeInTheDocument());
    await screen.findByText("Удаление данных");
    expect(tasksDialog()).toBeInTheDocument();
    expect(list).toHaveBeenCalledTimes(3);
    expect(listQuery.at(-1)).toBe("?limit=20&offset=0");
    expect(within(tasksDialog()).getAllByRole("row")).toHaveLength(4);
    expect(screen.getByText("Задача появится после получения команды сервисом Метрики. Обновите список")).toBeInTheDocument();
    expect(message.success).toHaveBeenCalledExactlyOnceWith("Обновление поставлено в очередь");
    expect(screen.getByRole("button", { name: "Обновить данные" })).toHaveFocus();
  });

  it.each([
    [400, "Счётчик не привязан"], [401, "Требуется авторизация"], [403, "Недостаточно прав"],
    [502, "Не удалось поставить задачу, повторите позже"], [503, "Не удалось поставить задачу, повторите позже"],
    ["network", "Не удалось поставить задачу, повторите позже"],
  ])("POST %s keeps safe error, page and explicit retry", async (status, expected) => {
    const auth = vi.fn(() => new HttpResponse(null, { status: 401 }));
    server.use(http.post(`${base}/auth/refresh`, auth));
    post.mockImplementation(() => status === "network" ? HttpResponse.error() : HttpResponse.json({ detail: status === 400 ? expected : "private body" }, { status: status as number }));
    await openConfirmation();
    await userEvent.click(within(confirmDialog()).getByRole("button", { name: /Подтвердить/ }));
    expect(await within(confirmDialog()).findByRole("alert")).toHaveTextContent(expected);
    expect(within(confirmDialog()).getByRole("button", { name: /Подтвердить/ })).toBeEnabled();
    await waitFor(() => expect(within(confirmDialog()).getByRole("button", { name: /Подтвердить/ })).not.toHaveClass("ant-btn-loading"));
    expect(list).toHaveBeenCalledOnce();
    expect(post).toHaveBeenCalledOnce();
    expect(auth).toHaveBeenCalledTimes(status === 401 ? 1 : 0);
    expect(message.success).not.toHaveBeenCalled();
    await userEvent.click(within(confirmDialog()).getByRole("button", { name: /Подтвердить/ }));
    await waitFor(() => expect(post).toHaveBeenCalledTimes(2));
  });

  it.each(["binding", "revoke"])("%s closes both layers, discards late GET/POST and never resurrects session", async change => {
    let release!: () => void;
    const barrier = new Promise<void>(resolve => { release = resolve; });
    post.mockImplementation(async () => { await barrier; return HttpResponse.json({ provider: "ya_metrica", status: "queued" }, { status: 202 }); });
    const { rerender } = renderWithCmsProviders(<MetricaTasksLauncher bindingKey="first" />);
    await userEvent.click(screen.getByRole("button", { name: "Задачи" }));
    await screen.findByText("Удаление данных");
    await userEvent.click(screen.getByRole("button", { name: "Обновить данные" }));
    await userEvent.click(within(confirmDialog()).getByRole("button", { name: /Подтвердить/ }));
    await waitFor(() => expect(post).toHaveBeenCalledOnce());
    if (change === "revoke") context.scopes = [KNOWN_USER_SCOPES.ADMIN];
    rerender(<MetricaTasksLauncher bindingKey="second" />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await act(async () => release());
    expect(message.success).not.toHaveBeenCalled();
    expect(list).toHaveBeenCalledOnce();
    context.scopes = [KNOWN_USER_SCOPES.SEO];
    rerender(<MetricaTasksLauncher bindingKey="second" />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});

describe("FE-07/08 session bounds", () => {
  it.each(["binding", "revoke"])("late GET after %s cannot reveal previous history", async change => {
    let release!: () => void;
    const barrier = new Promise<void>(resolve => { release = resolve; });
    const read = vi.fn(async () => { await barrier; return HttpResponse.json({ items, total: 3 }); });
    server.use(http.get(tasksUrl, read));
    const { rerender } = renderWithCmsProviders(<MetricaTasksLauncher bindingKey="first" />);
    await userEvent.click(screen.getByRole("button", { name: "Задачи" }));
    await waitFor(() => expect(read).toHaveBeenCalledOnce());
    if (change === "revoke") context.scopes = [KNOWN_USER_SCOPES.ADMIN];
    rerender(<MetricaTasksLauncher bindingKey="second" />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await act(async () => release());
    expect(screen.queryByText("Удаление данных")).not.toBeInTheDocument();
    context.scopes = [KNOWN_USER_SCOPES.SEO];
    rerender(<MetricaTasksLauncher bindingKey="second" />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(read).toHaveBeenCalledOnce();
  });

  it("100 rows and long identities stay inside bounded scroll regions with terminal labels", async () => {
    const many = Array.from({ length: 100 }, (_, index) => ({
      ...items[index % items.length], id: `parsing:${"long".repeat(100)}:${index}`,
      status: index % 2 ? "succeeded" : "cancelled", is_active: false,
    }));
    server.use(http.get(tasksUrl, () => HttpResponse.json({ items: many, total: 100 })));
    renderWithCmsProviders(<MetricaTasksLauncher bindingKey="long-binding" />);
    await userEvent.click(screen.getByRole("button", { name: "Задачи" }));
    await screen.findAllByText("Завершено");
    const region = screen.getByRole("region", { name: "История задач" });
    expect(within(region).getAllByRole("row")).toHaveLength(101);
    expect(within(region).getAllByText("Отменено")).toHaveLength(50);
    expect(region).toHaveStyle({ overflow: "auto", minHeight: "160px" });
    expect(tasksDialog().querySelector(".ant-modal-body")).toHaveStyle({ overflowY: "auto", overflowWrap: "anywhere" });
    expect(region).not.toHaveTextContent("longlong");
  });
});
