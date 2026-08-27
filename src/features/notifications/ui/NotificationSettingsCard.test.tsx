import React from "react";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithCmsProviders } from "@/test/render";
import { server } from "@/test/msw/server";
import { NotificationsPage } from "./NotificationsPage";

const notification = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));
vi.mock("@/hooks/useNotification", () => ({
  useNotification: () => notification,
}));
vi.mock("@/contexts/UserContext", () => ({
  useUserContext: () => ({ user: { id: "u1" }, scopes: ["ADMIN"] }),
}));

const api = (path: string) => `http://127.0.0.1/api${path}`;

const botInfo = {
  group_id: 224466,
  group_screen_name: "eqsitecms_bot",
  link_command: "/link",
  group_url: "https://vk.com/eqsitecms_bot",
  dialog_url: "https://vk.me/eqsitecms_bot",
};

const emailSetting = {
  user_id: "u1",
  event_code: "callback",
  event_name: "Обратный звонок",
  event_description: "Новый запрос",
  channel_code: "email",
  channel_name: "Email",
  enabled: false,
};
const vkSetting = { ...emailSetting, channel_code: "vk", channel_name: "VK" };

function binding(state: string, overrides: Record<string, unknown> = {}) {
  return {
    id: "b1",
    user_id: "u1",
    vk_peer_id: state === "PENDING" ? null : 424242,
    state,
    vk_screen_name: state === "PENDING" ? null : "durov",
    vk_display_name: state === "PENDING" ? null : "Павел Дуров",
    ...overrides,
  };
}

type Reply = () => Response;

type Options = {
  vk?: Reply;
  bot?: Reply;
  settings?: Reply;
};

const missingBinding: Reply = () =>
  HttpResponse.json({ detail: "Привязка VK не найдена" }, { status: 404 });

// Каждый обработчик обязан создавать новый Response: тело читается однократно.
function handlers(options: Options = {}) {
  server.use(
    http.get(api("/emails/me"), () =>
      HttpResponse.json({ detail: "Email not found" }, { status: 404 }),
    ),
    http.get(api("/notification-settings"), () =>
      (options.settings ?? (() => HttpResponse.json([emailSetting])))(),
    ),
    http.get(api("/vks/me"), () => (options.vk ?? missingBinding)()),
    http.get(api("/vks/bot-info"), () =>
      (options.bot ?? (() => HttpResponse.json(botInfo)))(),
    ),
  );
}

async function openSettings() {
  await userEvent.click(screen.getByRole("tab", { name: "Настройки" }));
}

async function renderSettings(options: Options = {}) {
  handlers(options);
  renderWithCmsProviders(<NotificationsPage />);
  await openSettings();
}

describe("NotificationSettingsCard", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders one switch per channel with distinct accessible labels", async () => {
    await renderSettings({
      settings: () =>
        HttpResponse.json([emailSetting, { ...vkSetting, enabled: true }]),
      vk: () => HttpResponse.json(binding("ACTIVE")),
    });

    const emailSwitch = await screen.findByRole("switch", {
      name: "Обратный звонок: Email",
    });
    const vkSwitch = screen.getByRole("switch", {
      name: "Обратный звонок: VK",
    });

    expect(emailSwitch).not.toBeChecked();
    expect(vkSwitch).toBeChecked();
    expect(screen.getAllByRole("switch")).toHaveLength(2);
  });

  it("renders the events block as a table with channel columns", async () => {
    await renderSettings({
      settings: () => HttpResponse.json([emailSetting, vkSetting]),
    });

    await screen.findByRole("switch", { name: "Обратный звонок: Email" });
    const headers = screen
      .getAllByRole("columnheader")
      .map((header) => header.textContent);

    expect(headers).toEqual(["Событие", "Электронная почта", "VK"]);
  });

  it("shows no delivery warning next to the vk switch", async () => {
    await renderSettings({
      settings: () => HttpResponse.json([emailSetting, vkSetting]),
    });

    await screen.findByRole("switch", { name: "Обратный звонок: VK" });

    expect(
      screen.queryByText(/Уведомления в VK не будут доставлены/),
    ).not.toBeInTheDocument();
  });

  it("omits a channel column the backend did not return", async () => {
    await renderSettings({ settings: () => HttpResponse.json([emailSetting]) });

    await screen.findByRole("switch", { name: "Обратный звонок: Email" });
    const headers = screen
      .getAllByRole("columnheader")
      .map((header) => header.textContent);

    expect(headers).toEqual(["Событие", "Электронная почта"]);
  });

  it("keeps the email switch untouched when the vk toggle fails", async () => {
    await renderSettings({
      settings: () =>
        HttpResponse.json([{ ...emailSetting, enabled: true }, vkSetting]),
      vk: () => HttpResponse.json(binding("ACTIVE")),
    });
    server.use(
      http.patch(api("/notification-settings/callback/vk"), () =>
        HttpResponse.json({ detail: "Forbidden" }, { status: 403 }),
      ),
    );

    const vkSwitch = await screen.findByRole("switch", {
      name: "Обратный звонок: VK",
    });
    await userEvent.click(vkSwitch);

    expect(await screen.findByText("Forbidden")).toBeInTheDocument();
    expect(vkSwitch).not.toBeChecked();
    expect(
      screen.getByRole("switch", { name: "Обратный звонок: Email" }),
    ).toBeChecked();
  });

  it("updates only the toggled channel on success", async () => {
    await renderSettings({
      settings: () => HttpResponse.json([emailSetting, vkSetting]),
      vk: () => HttpResponse.json(binding("ACTIVE")),
    });
    server.use(
      http.patch(api("/notification-settings/callback/vk"), () =>
        HttpResponse.json({ ...vkSetting, enabled: true }),
      ),
    );

    const vkSwitch = await screen.findByRole("switch", {
      name: "Обратный звонок: VK",
    });
    await userEvent.click(vkSwitch);

    await waitFor(() => expect(vkSwitch).toBeChecked());
    expect(
      screen.getByRole("switch", { name: "Обратный звонок: Email" }),
    ).not.toBeChecked();
  });
});
