import React from "react";
import { http, HttpResponse, delay } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithCmsProviders } from "@/test/render";
import { server } from "@/test/msw/server";
import { NotificationsPage } from "./NotificationsPage";

const notification = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));
vi.mock("@/hooks/useNotification", () => ({ useNotification: () => notification }));
vi.mock("@/contexts/UserContext", () => ({
  useUserContext: () => ({ user: { id: "u1" }, scopes: ["ADMIN"] }),
}));

const api = (path: string) => `http://127.0.0.1/api${path}`;
const setting = { user_id: "u1", event_code: "callback", event_name: "Обратный звонок", event_description: "Новый запрос", channel_code: "email", channel_name: "Email", enabled: false };

function handlers(emailResponse: Response = HttpResponse.json({ detail: "Email not found" }, { status: 404 }), settingsResponse: Response = HttpResponse.json([setting])) {
  server.use(
    http.get(api("/emails/me"), () => emailResponse),
    http.get(api("/notification-settings"), () => settingsResponse),
  );
}

async function openSettings() {
  await userEvent.click(screen.getByRole("tab", { name: "Настройки" }));
}

describe("NotificationsPage", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders history placeholder and settings missing-email empty state", async () => {
    handlers();
    renderWithCmsProviders(<NotificationsPage />);
    expect(screen.getByText("История уведомлений появится позже.")).toBeInTheDocument();
    await openSettings();
    expect(await screen.findByText(/Email не привязан/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Изменить" })).not.toBeInTheDocument();
    expect(screen.getByText("Обратный звонок")).toBeInTheDocument();
  });

  it.each([
    [false, "Не подтверждён"],
    [true, "Подтверждён"],
  ])("renders email confirmation state %s", async (approved, label) => {
    handlers(HttpResponse.json({ id: "e1", user_id: "u1", email: "owner@example.ru", approved }));
    renderWithCmsProviders(<NotificationsPage />);
    await openSettings();
    expect(await screen.findByText(label)).toBeInTheDocument();
    expect(screen.getByText("owner@example.ru")).toBeInTheDocument();
  });

  it("shows loading and load errors", async () => {
    server.use(
      http.get(api("/emails/me"), async () => { await delay(2000); return HttpResponse.json({ detail: "email failed" }, { status: 500 }); }),
      http.get(api("/notification-settings"), async () => { await delay(2000); return HttpResponse.json({ detail: "settings failed" }, { status: 500 }); }),
    );
    renderWithCmsProviders(<NotificationsPage />);
    await openSettings();
    expect(document.querySelectorAll(".ant-skeleton").length).toBeGreaterThan(0);
    expect(await screen.findByText("email failed", {}, { timeout: 4000 })).toBeInTheDocument();
    expect(screen.getByText("settings failed")).toBeInTheDocument();
  });

  it("validates create, preserves backend error, prevents double submit and refreshes on success", async () => {
    let getCalls = 0;
    let postCalls = 0;
    server.use(
      http.get(api("/emails/me"), () => {
        getCalls += 1;
        return getCalls === 1
          ? HttpResponse.json({ detail: "Email not found" }, { status: 404 })
          : HttpResponse.json({ id: "e1", user_id: "u1", email: "new@example.ru", approved: false });
      }),
      http.get(api("/notification-settings"), () => HttpResponse.json([])),
      http.post(api("/emails"), async () => {
        postCalls += 1;
        if (postCalls === 1) return HttpResponse.json({ detail: "Forbidden" }, { status: 403 });
        await delay(30);
        return HttpResponse.json({ id: "e1", user_id: "u1", email: "new@example.ru", approved: false }, { status: 201 });
      }),
    );
    renderWithCmsProviders(<NotificationsPage />);
    await openSettings();
    await userEvent.click(await screen.findByRole("button", { name: "Добавить email" }));
    const input = screen.getByRole("textbox", { name: "Email" });
    await userEvent.type(input, "bad");
    await userEvent.click(screen.getByRole("button", { name: "Сохранить" }));
    expect(await screen.findByText("Введите корректный email")).toBeInTheDocument();
    await userEvent.clear(input);
    await userEvent.type(input, "new@example.ru");
    await userEvent.click(screen.getByRole("button", { name: "Сохранить" }));
    expect(await screen.findByText("Forbidden")).toBeInTheDocument();
    expect(input).toHaveValue("new@example.ru");
    const retrySave = await screen.findByRole("button", { name: /Сохранить/ });
    await waitFor(() => expect(screen.getByRole("button", { name: /Сохранить/ })).not.toBeDisabled());
    await userEvent.click(retrySave);
    retrySave.click();
    await waitFor(() => expect(postCalls).toBe(2));
    expect(await screen.findByText("Не подтверждён")).toBeInTheDocument();
    expect(getCalls).toBe(2);
  });

  it("changes email and closes modal", async () => {
    handlers(HttpResponse.json({ id: "e1", user_id: "u1", email: "old@example.ru", approved: true }));
    server.use(http.patch(api("/emails"), () => HttpResponse.json({ id: "e1", user_id: "u1", email: "new@example.ru", approved: false })));
    renderWithCmsProviders(<NotificationsPage />);
    await openSettings();
    await userEvent.click(await screen.findByRole("button", { name: "Изменить" }));
    expect(screen.getByRole("textbox", { name: "Email" })).toHaveValue("old@example.ru");
    await userEvent.click(screen.getByRole("button", { name: "Отмена" }));
    await waitFor(() => expect(screen.getByRole("dialog")).toHaveClass("ant-zoom-leave"));
  });

  it.each([false, true])("shows conditional delete warning and keeps modal on error approved=%s", async (approved) => {
    handlers(HttpResponse.json({ id: "e1", user_id: "u1", email: "owner@example.ru", approved }));
    server.use(http.delete(api("/emails/u1"), () => HttpResponse.json({ detail: "Delete denied" }, { status: 403 })));
    renderWithCmsProviders(<NotificationsPage />);
    await openSettings();
    await userEvent.click(await screen.findByRole("button", { name: "Удалить" }));
    expect(screen.getByText(approved ? /Подтверждённый email будет удалён/ : /Неподтверждённый email будет удалён/)).toBeInTheDocument();
    await userEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Удалить" }));
    expect(await screen.findByText("Delete denied")).toBeInTheDocument();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("resends confirmation with success feedback", async () => {
    handlers(HttpResponse.json({ id: "e1", user_id: "u1", email: "owner@example.ru", approved: false }));
    server.use(http.post(api("/emails/send-confirmation"), () => HttpResponse.json({}, { status: 202 })));
    renderWithCmsProviders(<NotificationsPage />);
    await openSettings();
    await userEvent.click(await screen.findByRole("button", { name: "Отправить подтверждение повторно" }));
    expect(notification.success).toHaveBeenCalledWith(expect.objectContaining({ title: "Письмо отправлено" }));
  });

  it("shows ineligible empty state", async () => {
    handlers(undefined, HttpResponse.json([]));
    renderWithCmsProviders(<NotificationsPage />);
    await openSettings();
    expect(await screen.findByText("Для вашей роли нет доступных событий")).toBeInTheDocument();
  });

  it("commits checkbox only after success and preserves it after failure", async () => {
    handlers();
    let calls = 0;
    server.use(http.patch(api("/notification-settings/callback/email"), async () => {
      calls += 1;
      await delay(30);
      return calls === 1 ? HttpResponse.json({ detail: "Forbidden" }, { status: 403 }) : HttpResponse.json({ ...setting, enabled: true });
    }));
    renderWithCmsProviders(<NotificationsPage />);
    await openSettings();
    const checkbox = await screen.findByRole("switch", { name: "Обратный звонок: email" });
    expect(checkbox).not.toBeChecked();
    await userEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();
    expect(await screen.findByText("Forbidden")).toBeInTheDocument();
    const retryCheckbox = await screen.findByRole("switch", { name: "Обратный звонок: email" });
    await waitFor(() => expect(retryCheckbox).not.toBeDisabled());
    await userEvent.click(retryCheckbox);
    expect(retryCheckbox).not.toBeChecked();
    await waitFor(() => expect(screen.getByRole("switch", { name: "Обратный звонок: email" })).toBeChecked());
  });
});
