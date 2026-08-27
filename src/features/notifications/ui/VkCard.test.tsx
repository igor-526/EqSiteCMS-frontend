import React from "react";
import { http, HttpResponse, delay } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
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

describe("VkCard", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders the unlinked state with only a link action", async () => {
    await renderSettings();

    expect(await screen.findByText("VK для уведомлений")).toBeInTheDocument();
    expect(await screen.findByText(/VK не привязан/)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Привязать" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Отвязать" }),
    ).not.toBeInTheDocument();
  });

  it("hides the instruction and the dialog link until the code is requested", async () => {
    await renderSettings();

    await screen.findByRole("button", { name: "Привязать" });

    expect(
      screen.queryByText(/Отправьте боту сообщение вида/),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Открыть диалог с ботом" }),
    ).not.toBeInTheDocument();
  });

  it("never offers a link to the community page", async () => {
    await renderSettings({ vk: () => HttpResponse.json(binding("ACTIVE")) });

    await screen.findByText("Привязан");

    expect(
      screen.queryByRole("link", { name: "Перейти в группу VK" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /vk\.com/ }),
    ).not.toBeInTheDocument();
  });

  it("opens the dialog link in a new tab with a safe rel", async () => {
    await renderSettings({ vk: () => HttpResponse.json(binding("ACTIVE")) });

    const dialog = await screen.findByRole("link", {
      name: "Открыть диалог с ботом",
    });

    expect(dialog).toHaveAttribute("target", "_blank");
    expect(dialog).toHaveAttribute("rel", "noopener noreferrer");
    expect(dialog).toHaveAttribute("href", botInfo.dialog_url);
  });

  it("renders the active state with the display name and no code block", async () => {
    await renderSettings({ vk: () => HttpResponse.json(binding("ACTIVE")) });

    expect(await screen.findByText("Павел Дуров")).toBeInTheDocument();
    expect(screen.getByText("Привязан")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Отвязать" }),
    ).toBeInTheDocument();
    expect(screen.queryByTestId("vk-link-command")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Получить код" }),
    ).not.toBeInTheDocument();
  });

  it("renders the blocked state with a warning and no code request", async () => {
    await renderSettings({ vk: () => HttpResponse.json(binding("BLOCKED")) });

    expect(await screen.findByText("Бот заблокирован")).toBeInTheDocument();
    expect(
      screen.getByText(/Сообщения от группы запрещены/),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Отвязать" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Привязать" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Обновить код" }),
    ).not.toBeInTheDocument();
  });

  it("renders the pending state and refresh action", async () => {
    await renderSettings({ vk: () => HttpResponse.json(binding("PENDING")) });

    expect(
      await screen.findByText("Ожидает подтверждения"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Обновить код" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Отвязать" }),
    ).toBeInTheDocument();
  });

  it("shows a skeleton while loading and an alert on a load failure", async () => {
    server.use(
      http.get(api("/emails/me"), () =>
        HttpResponse.json({ detail: "Email not found" }, { status: 404 }),
      ),
      http.get(api("/notification-settings"), () =>
        HttpResponse.json([emailSetting]),
      ),
      http.get(api("/vks/bot-info"), () => HttpResponse.json(botInfo)),
      http.get(api("/vks/me"), async () => {
        await delay(2000);
        return HttpResponse.json({ detail: "vk failed" }, { status: 502 });
      }),
    );
    renderWithCmsProviders(<NotificationsPage />);
    await openSettings();

    expect(document.querySelectorAll(".ant-skeleton").length).toBeGreaterThan(
      0,
    );
    expect(
      await screen.findByText("vk failed", {}, { timeout: 4000 }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/VK не привязан/)).not.toBeInTheDocument();
  });

  it("warns and hides links when bot-info is unavailable", async () => {
    await renderSettings({
      bot: () =>
        HttpResponse.json(
          { detail: "Конфигурация группы VK не завершена" },
          { status: 503 },
        ),
    });

    expect(
      await screen.findByText(/Интеграция с VK ещё не настроена/),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Открыть диалог с ботом" }),
    ).not.toBeInTheDocument();
    expect(
      await screen.findByText("Email для уведомлений"),
    ).toBeInTheDocument();
  });

  it("issues a code, shows the full command and copies it", async () => {
    const writeText = vi.fn(async () => {});
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });
    let vkCalls = 0;
    handlers();
    server.use(
      http.get(api("/vks/me"), () => {
        vkCalls += 1;
        return vkCalls === 1
          ? HttpResponse.json(
              { detail: "Привязка VK не найдена" },
              { status: 404 },
            )
          : HttpResponse.json(binding("PENDING"));
      }),
      http.post(api("/vks/issue-confirmation"), () =>
        HttpResponse.json(
          {
            code: "ABC23XYZ",
            expires_at: new Date(Date.now() + 30 * 60_000).toISOString(),
            state: "PENDING",
            link_command: "/link",
            dialog_url: botInfo.dialog_url,
          },
          { status: 201 },
        ),
      ),
    );
    renderWithCmsProviders(<NotificationsPage />);
    await openSettings();

    await userEvent.click(
      await screen.findByRole("button", { name: "Привязать" }),
    );

    const command = await screen.findByTestId("vk-link-command");
    expect(command).toHaveTextContent("/link ABC23XYZ");
    expect(
      screen.getByText(/Отправьте боту сообщение вида/),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Открыть диалог с ботом" }),
    ).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Копировать" }));
    expect(writeText).toHaveBeenCalledWith("/link ABC23XYZ");
    expect(await screen.findByText("Команда скопирована")).toBeInTheDocument();
  });

  it("reports a clipboard failure without breaking the card", async () => {
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: vi.fn().mockRejectedValue(new Error("denied")),
      },
      configurable: true,
    });
    handlers({ vk: () => HttpResponse.json(binding("PENDING")) });
    server.use(
      http.post(api("/vks/issue-confirmation"), () =>
        HttpResponse.json(
          {
            code: "ABC23XYZ",
            expires_at: new Date(Date.now() + 30 * 60_000).toISOString(),
            state: "PENDING",
            link_command: "/link",
            dialog_url: botInfo.dialog_url,
          },
          { status: 201 },
        ),
      ),
    );
    renderWithCmsProviders(<NotificationsPage />);
    await openSettings();
    await userEvent.click(
      await screen.findByRole("button", { name: "Обновить код" }),
    );
    await userEvent.click(
      await screen.findByRole("button", { name: "Копировать" }),
    );

    expect(
      await screen.findByText(/Не удалось скопировать автоматически/),
    ).toBeInTheDocument();
    expect(screen.getByTestId("vk-link-command")).toHaveTextContent(
      "/link ABC23XYZ",
    );
  });

  it("marks an expired code as invalid", async () => {
    handlers({ vk: () => HttpResponse.json(binding("PENDING")) });
    server.use(
      http.post(api("/vks/issue-confirmation"), () =>
        HttpResponse.json(
          {
            code: "OLDCODE1",
            expires_at: new Date(Date.now() - 60_000).toISOString(),
            state: "PENDING",
            link_command: "/link",
            dialog_url: botInfo.dialog_url,
          },
          { status: 201 },
        ),
      ),
    );
    renderWithCmsProviders(<NotificationsPage />);
    await openSettings();
    await userEvent.click(
      await screen.findByRole("button", { name: "Обновить код" }),
    );

    expect(
      await screen.findByText(/Срок действия кода истёк/),
    ).toBeInTheDocument();
  });

  it("shows a domain conflict and keeps the card usable", async () => {
    handlers({ vk: () => HttpResponse.json(binding("ACTIVE")) });
    server.use(
      http.post(api("/vks/issue-confirmation"), () =>
        HttpResponse.json(
          { detail: "Аккаунт VK уже привязан" },
          { status: 409 },
        ),
      ),
    );
    renderWithCmsProviders(<NotificationsPage />);
    await openSettings();

    expect(await screen.findByText("Привязан")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Привязать" }),
    ).not.toBeInTheDocument();
  });

  it("sends exactly one request when the code button is double clicked", async () => {
    let posts = 0;
    let vkCalls = 0;
    handlers();
    server.use(
      http.get(api("/vks/me"), () => {
        vkCalls += 1;
        return vkCalls === 1
          ? HttpResponse.json(
              { detail: "Привязка VK не найдена" },
              { status: 404 },
            )
          : HttpResponse.json(binding("PENDING"));
      }),
      http.post(api("/vks/issue-confirmation"), async () => {
        posts += 1;
        await delay(50);
        return HttpResponse.json(
          {
            code: "ABC23XYZ",
            expires_at: new Date(Date.now() + 30 * 60_000).toISOString(),
            state: "PENDING",
            link_command: "/link",
            dialog_url: botInfo.dialog_url,
          },
          { status: 201 },
        );
      }),
    );
    renderWithCmsProviders(<NotificationsPage />);
    await openSettings();
    const button = await screen.findByRole("button", { name: "Привязать" });

    await userEvent.click(button);
    await userEvent.click(button);

    await waitFor(() =>
      expect(screen.getByTestId("vk-link-command")).toBeInTheDocument(),
    );
    expect(posts).toBe(1);
  });

  it("confirms unlink in a modal, succeeds and returns to the unlinked state", async () => {
    let vkCalls = 0;
    handlers();
    server.use(
      http.get(api("/vks/me"), () => {
        vkCalls += 1;
        return vkCalls === 1
          ? HttpResponse.json(binding("ACTIVE"))
          : HttpResponse.json(
              { detail: "Привязка VK не найдена" },
              { status: 404 },
            );
      }),
      http.delete(
        api("/vks/u1"),
        () => new HttpResponse(null, { status: 204 }),
      ),
    );
    renderWithCmsProviders(<NotificationsPage />);
    await openSettings();

    await userEvent.click(
      await screen.findByRole("button", { name: "Отвязать" }),
    );
    const dialog = await screen.findByRole("dialog");
    expect(
      within(dialog).getByText(/понадобится новый код/),
    ).toBeInTheDocument();
    await userEvent.click(
      within(dialog).getByRole("button", { name: "Отвязать" }),
    );

    expect(await screen.findByText(/VK не привязан/)).toBeInTheDocument();
    expect(notification.success).toHaveBeenCalledWith({ title: "VK отвязан" });
  });

  it("keeps the unlink modal open and shows the error on failure", async () => {
    handlers({ vk: () => HttpResponse.json(binding("ACTIVE")) });
    server.use(
      http.delete(api("/vks/u1"), () =>
        HttpResponse.json(
          { detail: "VK service unavailable" },
          { status: 502 },
        ),
      ),
    );
    renderWithCmsProviders(<NotificationsPage />);
    await openSettings();
    await userEvent.click(
      await screen.findByRole("button", { name: "Отвязать" }),
    );
    const dialog = await screen.findByRole("dialog");
    await userEvent.click(
      within(dialog).getByRole("button", { name: "Отвязать" }),
    );

    expect(
      await screen.findByText("VK service unavailable"),
    ).toBeInTheDocument();
    expect(screen.getByText(/понадобится новый код/)).toBeInTheDocument();
    expect(screen.getByText("Привязан")).toBeInTheDocument();
  });

  it("places the vk card between the email card and the events card", async () => {
    await renderSettings();

    await screen.findByText("VK для уведомлений");
    const titles = Array.from(
      document.querySelectorAll(".ant-card-head-title"),
    ).map((node) => node.textContent);

    expect(titles).toEqual([
      "Email для уведомлений",
      "VK для уведомлений",
      "События",
    ]);
  });
});
