import React from "react";
import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithCmsProviders } from "@/test/render";
import { NormalizationList, type NormalizationListProps } from "./NormalizationList";
const item = { id: "stable", value: "long".repeat(100), created_at: "2026-01-01" };
const props = (): NormalizationListProps => ({ items: [item], total: 11, offset: 0, loading: false, error: null, disabled: false, canDelete: true, onDelete: vi.fn(), onPage: vi.fn(), onRetry: vi.fn() });
describe("UT-SEO-12/14 compact normalization list", () => {
  it("renders full value tooltip and named delete callback", async () => {
    const model = props(); renderWithCmsProviders(<NormalizationList {...model} />);
    expect(screen.getByTitle(item.value)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: `Удалить ${item.value}` }));
    expect(model.onDelete).toHaveBeenCalledWith(item);
  });
  it("shows loading", () => {
    renderWithCmsProviders(<NormalizationList {...props()} loading />);
    expect(screen.getByLabelText("Загрузка правил")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: `Удалить ${item.value}` })).toBeDisabled();
  });
  it("shows empty", () => {
    renderWithCmsProviders(<NormalizationList {...props()} items={[]} total={0} />);
    expect(screen.getByText("Правил пока нет")).toBeInTheDocument();
  });
  it("shows read error/retry not empty", async () => {
    const model = props(); renderWithCmsProviders(<NormalizationList {...model} items={[]} total={0} error="Ошибка обновления" />);
    expect(screen.queryByText("Правил пока нет")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Повторить" }));
    expect(model.onRetry).toHaveBeenCalledOnce();
  });
  it("pages locally with fixed size and no size selector", async () => {
    const model = props(); renderWithCmsProviders(<NormalizationList {...model} />);
    await userEvent.click(screen.getByTitle("2"));
    expect(model.onPage).toHaveBeenCalledWith(2, 10);
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  });
  it("hides delete without permission", () => {
    renderWithCmsProviders(<NormalizationList {...props()} canDelete={false} />);
    expect(screen.queryByRole("button", { name: /Удалить/ })).not.toBeInTheDocument();
  });
  it("locks delete, retry and paginator", async () => {
    const model = props(); renderWithCmsProviders(<NormalizationList {...model} disabled error="Ошибка" />);
    expect(screen.getByRole("button", { name: /Удалить/ })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Повторить" })).toBeDisabled();
    await userEvent.click(screen.getByTitle("2"));
    expect(model.onPage).not.toHaveBeenCalled();
  });
});
