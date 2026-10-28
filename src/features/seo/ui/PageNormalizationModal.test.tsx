import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithCmsProviders } from "@/test/render";
import { apiError, apiSuccess } from "@/lib/apiStatus";
import { fetchSeoNormalization, removeSeoNormalization, submitSeoNormalization } from "../services/seoDataService";
import { usePageNormalization } from "../hooks/usePageNormalization";
import { PageNormalizationModal } from "./PageNormalizationModal";
const context = vi.hoisted(() => ({ scopes: ["SEO"] as string[] }));
vi.mock("@/contexts/UserContext", () => ({ useUserContext: () => context }));
vi.mock("../services/seoDataService", () => ({ fetchSeoNormalization: vi.fn(), removeSeoNormalization: vi.fn(), submitSeoNormalization: vi.fn() }));
const row = { id: "id", value: "top", created_at: "2026-01-01" };
const fetchList = vi.mocked(fetchSeoNormalization);
const create = vi.mocked(submitSeoNormalization);
const remove = vi.mocked(removeSeoNormalization);
function Harness() {
  const model = usePageNormalization();
  return <><button onClick={model.show}>Открыть</button><PageNormalizationModal model={model} /></>;
}
const setup = async () => {
  const view = renderWithCmsProviders(<Harness />);
  await userEvent.click(screen.getByRole("button", { name: "Открыть" }));
  await screen.findByText("top");
  return view;
};
beforeEach(() => {
  context.scopes = ["SEO"];
  fetchList.mockReset().mockResolvedValue(apiSuccess({ items: [row], total: 1 }));
  create.mockReset().mockResolvedValue(apiSuccess(row));
  remove.mockReset().mockResolvedValue(apiSuccess(null));
});
describe("UT-SEO-13..16 modal", () => {
  it("opens hash by default, explains exact future rules, closes and returns focus", async () => {
    await setup();
    expect(screen.getByRole("tab", { name: "Хеш" })).toHaveAttribute("aria-selected", "true");
    const explanation = screen.getByText(/старые страницы не меняются/);
    expect(explanation).toBeInTheDocument();
    // F04: use the primary Typography color, not the low-contrast secondary token.
    expect(explanation).not.toHaveClass("ant-typography-secondary");
    await userEvent.click(screen.getByRole("button", { name: "Close" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(screen.getByRole("button", { name: "Открыть" })).toHaveFocus();
  });
  it("validates, plus and Enter use same create flow; resets on collection switch", async () => {
    await setup();
    await userEvent.click(screen.getByRole("button", { name: "Добавить хеш" }));
    expect(await screen.findByText("Введите значение")).toBeInTheDocument();
    expect(create).not.toHaveBeenCalled();
    await userEvent.type(screen.getByRole("textbox"), " #top {Enter}");
    await waitFor(() => expect(create).toHaveBeenCalledWith("hashes", { value: "top" }));
    await waitFor(() => expect(screen.getByRole("textbox")).toHaveValue(""));
    await userEvent.click(screen.getByRole("tab", { name: "Параметры" }));
    await userEvent.type(screen.getByRole("textbox"), "utm_source");
    await userEvent.click(screen.getByRole("button", { name: "Добавить параметр" }));
    await waitFor(() => expect(create).toHaveBeenLastCalledWith("params", { value: "utm_source" }));
  });
  it.each(["400", "409", "401", "403", "502"])("shows create denial %s preserving draft", async detail => {
    create.mockResolvedValue(apiError(detail));
    await setup();
    await userEvent.type(screen.getByRole("textbox"), "draft{Enter}");
    expect(await screen.findByText(detail)).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toHaveValue("draft");
  });
  it("separate confirmation cancels without DELETE and returns focus inside main modal", async () => {
    await setup();
    await userEvent.click(screen.getByRole("button", { name: "Удалить top" }));
    expect(screen.getAllByRole("dialog")).toHaveLength(2);
    expect(remove).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole("button", { name: "Отмена" }));
    await waitFor(() => expect(screen.getAllByRole("dialog")).toHaveLength(1));
    expect(screen.getByRole("textbox")).toHaveFocus();
  });
  it("successful delete closes only confirmation and refreshes", async () => {
    await setup();
    fetchList.mockResolvedValue(apiSuccess({ items: [], total: 0 }));
    await userEvent.click(screen.getByRole("button", { name: "Удалить top" }));
    await userEvent.click(screen.getByRole("button", { name: "Подтвердить" }));
    await waitFor(() => expect(screen.getAllByRole("dialog")).toHaveLength(1));
    expect(screen.getByRole("dialog", { name: "Нормализация страниц" })).toBeInTheDocument();
    expect(await screen.findByText("Правил пока нет")).toBeInTheDocument();
    expect(remove).toHaveBeenCalledExactlyOnceWith("hashes", "id");
  });
  it.each(["401", "403", "404", "502"])("delete error %s preserves confirmation, missing ID disables retry", async detail => {
    await setup();
    remove.mockResolvedValue(apiError(detail));
    fetchList.mockResolvedValue(apiSuccess({ items: [], total: 0 }));
    await userEvent.click(screen.getByRole("button", { name: "Удалить top" }));
    await userEvent.click(screen.getByRole("button", { name: "Подтвердить" }));
    expect(await screen.findByText(/Возможно, он уже отсутствует/)).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole("button", { name: /Подтвердить/ })).toBeDisabled());
    expect(screen.getAllByRole("dialog")).toHaveLength(2);
    expect(remove).toHaveBeenCalledTimes(1);
  });
  it("locks all create UI while pending and unlocks after rejection", async () => {
    let resolve!: (value: Awaited<ReturnType<typeof submitSeoNormalization>>) => void;
    create.mockReturnValue(new Promise(done => { resolve = done; }));
    await setup();
    await userEvent.type(screen.getByRole("textbox"), "draft{Enter}{Enter}");
    expect(create).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("textbox")).toBeDisabled();
    expect(screen.getByRole("button", { name: "Добавить хеш" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Удалить top" })).toBeDisabled();
    expect(screen.getByRole("tab", { name: "Параметры" })).toHaveAttribute("aria-disabled", "true");
    expect(screen.queryByRole("button", { name: "Close" })).not.toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await act(async () => resolve(apiError("403")));
    expect(screen.getByRole("textbox")).not.toBeDisabled();
  });
  it("locks confirmation cancel/close during delete", async () => {
    let resolve!: (value: Awaited<ReturnType<typeof removeSeoNormalization>>) => void;
    remove.mockReturnValue(new Promise(done => { resolve = done; }));
    await setup();
    await userEvent.click(screen.getByRole("button", { name: "Удалить top" }));
    await userEvent.dblClick(screen.getByRole("button", { name: "Подтвердить" }));
    const dialog = screen.getAllByRole("dialog")[1];
    expect(within(dialog).getByRole("button", { name: "Отмена" })).toBeDisabled();
    expect(within(dialog).queryByRole("button", { name: "Close" })).not.toBeInTheDocument();
    expect(remove).toHaveBeenCalledTimes(1);
    await act(async () => resolve(apiError("403")));
  });
  it.each([[], ["ADMIN"], ["SUPERUSER"], ["DEVELOPER"]])("cannot open without SEO %j", async (...scopes) => {
    context.scopes = scopes;
    renderWithCmsProviders(<Harness />);
    await userEvent.click(screen.getByRole("button", { name: "Открыть" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(fetchList).not.toHaveBeenCalled();
  });
  it("revoked scope hides modal and prevents writes", async () => {
    const { rerender } = await setup();
    context.scopes = [];
    rerender(<Harness />);
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(create).not.toHaveBeenCalled(); expect(remove).not.toHaveBeenCalled();
  });
});
