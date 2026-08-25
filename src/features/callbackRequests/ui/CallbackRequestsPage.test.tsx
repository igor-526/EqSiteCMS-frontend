import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithCmsProviders } from "@/test/render";
import { CallbackRequestsPage } from "./CallbackRequestsPage";

const access = vi.hoisted(() => ({ canRead: true, canMutate: true }));
const state = vi.hoisted(() => ({
  rows: [{ id: "row-1", name: "Анна", phone: "+7900", comment: "Полный комментарий", status: 1, is_spam: false, notifications_delivered: true, created_at: "2026-08-24T10:00:00Z", updated_at: null }],
  statuses: [{ id: 1, name: "Новая", color: "#008800" }], query: { limit: 25, offset: 0 }, total: 1, loading: false, error: null as string | null, pendingKeys: [],
  setQuery: vi.fn(), resetQuery: vi.fn(), changeStatus: vi.fn(), changeSpam: vi.fn(), reload: vi.fn(),
}));
vi.mock("../hooks/useCallbackRequestAccess", () => ({ useCallbackRequestAccess: () => access }));
vi.mock("../hooks/useCallbackRequests", () => ({ useCallbackRequests: () => state }));

describe("CallbackRequestsPage flow", () => {
  beforeEach(() => {
    access.canRead = true;
    access.canMutate = true;
    state.query = { limit: 25, offset: 0 };
    state.total = 76;
    state.error = null;
    state.setQuery.mockClear();
    state.resetQuery.mockClear();
  });

  it("guards forbidden roles", () => { access.canRead = false; renderWithCmsProviders(<CallbackRequestsPage />); expect(screen.getByText("Недостаточно прав для просмотра заявок")).toBeInTheDocument(); access.canRead = true; });
  it("switches tabs and opens full detail without losing the table", async () => {
    renderWithCmsProviders(<CallbackRequestsPage />);
    expect(screen.getByText("Анна")).toBeInTheDocument();
    await userEvent.click(screen.getByText("Анна"));
    expect(screen.getByText("Полный комментарий", { selector: ".ant-descriptions-item-content span" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("tab", { name: "Инструкция" }));
    expect(screen.getByText("Работа с заявками")).toBeInTheDocument();
  });
  it("shows explicit backend denial while preserving data", () => { state.error = "Forbidden"; renderWithCmsProviders(<CallbackRequestsPage />); expect(screen.getByText("Forbidden")).toBeInTheDocument(); expect(screen.getByText("Анна")).toBeInTheDocument(); state.error = null; });

  it("renders page one with the correct total in the upper header before the table", () => {
    renderWithCmsProviders(<CallbackRequestsPage />);

    const header = screen.getByTestId("callback-requests-header");
    const paginator = within(header).getByTestId("callback-requests-pagination");
    const table = screen.getByRole("table");
    expect(within(paginator).getByTitle("1")).toHaveClass("ant-pagination-item-active");
    expect(within(paginator).getByTitle("4")).toBeInTheDocument();
    expect(header.compareDocumentPosition(table) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getAllByTestId("callback-requests-pagination")).toHaveLength(1);
    expect(within(screen.getByTestId("callback-requests-content")).queryByTestId("callback-requests-pagination")).not.toBeInTheDocument();
  });

  it("renders the danger reset immediately after pagination and resets all filters", async () => {
    renderWithCmsProviders(<CallbackRequestsPage />);

    const header = screen.getByTestId("callback-requests-header");
    const actions = within(header).getByTestId("callback-requests-actions");
    const paginator = within(actions).getByTestId("callback-requests-pagination");
    const reset = within(actions).getByRole("button", { name: "Сбросить" });
    expect(actions).toHaveClass("overflow-x-auto", "overflow-y-hidden");
    expect(paginator.compareDocumentPosition(reset) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(reset).toHaveClass("ant-btn-color-dangerous", "ant-btn-variant-outlined");
    expect(screen.queryByRole("button", { name: "Сбросить фильтры" })).not.toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Сбросить" })).toHaveLength(1);

    await userEvent.click(reset);
    expect(state.resetQuery).toHaveBeenCalledOnce();
  });

  it("maps a page change to the existing limit and the corresponding offset", async () => {
    renderWithCmsProviders(<CallbackRequestsPage />);

    await userEvent.click(screen.getByTitle("2"));
    expect(state.setQuery).toHaveBeenCalledOnce();
    expect(state.setQuery).toHaveBeenCalledWith({ limit: 25, offset: 25 }, false);
  });

  it("resets offset exactly once when page size changes", async () => {
    state.query = { limit: 25, offset: 50 };
    renderWithCmsProviders(<CallbackRequestsPage />);

    await userEvent.click(screen.getByRole("combobox"));
    await userEvent.click(await screen.findByText(/^50\s*\/\s*(page|страница)$/i));
    expect(state.setQuery).toHaveBeenCalledOnce();
    expect(state.setQuery).toHaveBeenCalledWith({ limit: 50, offset: 0 }, false);
  });

  it("hides pagination on instructions and restores exactly one control on requests", async () => {
    renderWithCmsProviders(<CallbackRequestsPage />);

    await userEvent.click(screen.getByRole("tab", { name: "Инструкция" }));
    expect(screen.queryByTestId("callback-requests-pagination")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Сбросить" })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("tab", { name: "Заявки" }));
    expect(screen.getAllByTestId("callback-requests-pagination")).toHaveLength(1);
  });
});
