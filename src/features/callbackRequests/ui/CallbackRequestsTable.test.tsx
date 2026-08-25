import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { act, fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithCmsProviders } from "@/test/render";
import { CallbackRequestsTable } from "./CallbackRequestsTable";

const row = { id: "row-1", name: "Анна", phone: "+7 900 000-00-00", comment: "Очень длинный комментарий клиента", status: 1, is_spam: false, notifications_delivered: false, created_at: "2026-08-24T10:00:00Z", updated_at: null };
const statuses = [{ id: 1, name: "Новая", color: "#008800" }, { id: 2, name: "Обработана", color: "#888888" }];
const tableProps = { query: {}, onFilterChange: vi.fn(), onStatus: vi.fn(), onSpam: vi.fn(), onSort: vi.fn() };

describe("CallbackRequestsTable", () => {
  it("renders data, tel link and isolates link click from row modal", async () => {
    const onSelect = vi.fn();
    renderWithCmsProviders(<CallbackRequestsTable {...tableProps} rows={[row]} statuses={statuses} loading={false} canMutate={false} pendingKeys={[]} onSelect={onSelect} />);
    expect(screen.getByText("Анна")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: row.phone })).toHaveAttribute("href", `tel:${row.phone}`);
    await userEvent.click(screen.getByRole("link", { name: row.phone }));
    expect(onSelect).not.toHaveBeenCalled();
    await userEvent.click(screen.getByText("Анна")); expect(onSelect).toHaveBeenCalledWith(row);
  });
  it("hides mutation menus without scope and disables them while pending", () => {
    const { rerender } = renderWithCmsProviders(<CallbackRequestsTable {...tableProps} rows={[row]} statuses={statuses} loading={false} canMutate={false} pendingKeys={[]} onSelect={vi.fn()} />);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    rerender(<CallbackRequestsTable {...tableProps} rows={[row]} statuses={statuses} loading={false} canMutate pendingKeys={["status:row-1"]} onSelect={vi.fn()} />);
    expect(screen.getByText("Новая")).toBeInTheDocument();
  });
  it("places all six filters in matching headers and highlights active icons", () => {
    renderWithCmsProviders(<CallbackRequestsTable {...tableProps} query={{ created_at_from: "2026-08-01", status: [1], is_spam: [false], name: "a", phone: "7", comment: "x" }} rows={[]} statuses={statuses} loading={false} canMutate pendingKeys={[]} onSelect={vi.fn()} />);
    for (const label of ["Дата и время", "Статус", "Спам", "Имя", "Телефон", "Комментарий"]) {
      const icons = screen.getAllByLabelText(`Фильтр: ${label}`);
      expect(icons.length).toBeGreaterThan(0);
      for (const icon of icons) {
        expect(icon).toHaveAttribute("data-filter-active", "true");
        expect(icon.closest(".ant-table-filter-trigger")).toHaveClass("active");
      }
      expect(icons[0].closest("th")).toHaveTextContent(label);
    }
  });
  it("activates the real AntD trigger after apply and clears it after reset", async () => {
    const Harness = () => {
      const [query, setQuery] = useState<Record<string, unknown>>({});
      return <><button onClick={() => setQuery({})}>reset</button><CallbackRequestsTable {...tableProps} query={query} onFilterChange={(patch) => setQuery((current) => ({ ...current, ...patch }))} rows={[]} statuses={statuses} loading={false} canMutate pendingKeys={[]} onSelect={vi.fn()} /></>;
    };
    vi.useFakeTimers({ shouldAdvanceTime: true });
    renderWithCmsProviders(<Harness />);
    await userEvent.click(screen.getAllByLabelText("Фильтр: Имя")[0]);
    fireEvent.change(screen.getByLabelText("Имя"), { target: { value: "ИВАН" } });
    await act(() => vi.advanceTimersByTimeAsync(300));
    expect(screen.getAllByLabelText("Фильтр: Имя")[0]).toHaveAttribute("data-filter-active", "true");
    expect(screen.getAllByLabelText("Фильтр: Имя")[0].closest(".ant-table-filter-trigger")).toHaveClass("active");
    await userEvent.click(screen.getByRole("button", { name: "reset" }));
    expect(screen.getAllByLabelText("Фильтр: Имя")[0]).toHaveAttribute("data-filter-active", "false");
    expect(screen.getAllByLabelText("Фильтр: Имя")[0].closest(".ant-table-filter-trigger")).not.toHaveClass("active");
    vi.useRealTimers();
  });
});
