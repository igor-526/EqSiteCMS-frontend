import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { isApiError, isApiSuccess } from "@/lib/apiStatus";
import { server } from "@/test/msw/server";
import {
  fetchMyEmail,
  fetchNotificationSettings,
  removeEmail,
  resendEmailConfirmation,
  saveEmail,
  saveNotificationSetting,
} from "./notificationService";

const api = (path: string) => `http://127.0.0.1/api${path}`;

describe("notification service API boundary", () => {
  it("loads own email from main backend", async () => {
    server.use(http.get(api("/emails/me"), () => HttpResponse.json({ id: "e1", user_id: "u1", email: "a@b.ru", approved: false })));
    const result = await fetchMyEmail();
    expect(isApiSuccess(result) && result.data?.email).toBe("a@b.ru");
  });

  it.each([
    [404, "Email not found"],
    [403, "Forbidden"],
    [500, "Backend unavailable"],
  ])("surfaces email error %s", async (status, detail) => {
    server.use(http.get(api("/emails/me"), () => HttpResponse.json({ detail }, { status })));
    const result = await fetchMyEmail();
    expect(isApiError(result) && result.data.detail).toBe(detail);
  });

  it("surfaces protected 401 after failed refresh without live calls", async () => {
    server.use(
      http.get(api("/emails/me"), () => HttpResponse.json({ detail: "Unauthorized" }, { status: 401 })),
      http.post(api("/auth/refresh"), () => HttpResponse.json({ detail: "Unauthorized" }, { status: 401 })),
    );
    const result = await fetchMyEmail();
    expect(isApiError(result)).toBe(true);
  });

  it("creates, changes, deletes and resends through main backend paths", async () => {
    const methods: string[] = [];
    server.use(
      http.post(api("/emails"), async ({ request }) => { methods.push(request.method); return HttpResponse.json({ id: "e1", user_id: "u1", email: "a@b.ru", approved: false }, { status: 201 }); }),
      http.patch(api("/emails"), async ({ request }) => { methods.push(request.method); return HttpResponse.json({ id: "e1", user_id: "u1", email: "c@d.ru", approved: false }); }),
      http.delete(api("/emails/u1"), ({ request }) => { methods.push(request.method); return new HttpResponse(null, { status: 204 }); }),
      http.post(api("/emails/send-confirmation"), ({ request }) => { methods.push(request.method); return HttpResponse.json({}, { status: 202 }); }),
    );
    expect(isApiSuccess(await saveEmail({ user_id: "u1", email: "a@b.ru" }, false))).toBe(true);
    expect(isApiSuccess(await saveEmail({ user_id: "u1", email: "c@d.ru" }, true))).toBe(true);
    expect(isApiSuccess(await removeEmail("u1"))).toBe(true);
    expect(isApiSuccess(await resendEmailConfirmation("u1"))).toBe(true);
    expect(methods).toEqual(["POST", "PATCH", "DELETE", "POST"]);
  });

  it("loads empty settings and commits a setting response", async () => {
    server.use(
      http.get(api("/notification-settings"), () => HttpResponse.json([])),
      http.patch(api("/notification-settings/callback/email"), () => HttpResponse.json({ user_id: "u1", event_code: "callback", event_name: "Обратный звонок", event_description: null, channel_code: "email", channel_name: "Email", enabled: true })),
    );
    const list = await fetchNotificationSettings();
    expect(isApiSuccess(list) && list.data).toEqual([]);
    const saved = await saveNotificationSetting("callback", "email", true);
    expect(isApiSuccess(saved) && saved.data?.enabled).toBe(true);
  });

  it.each([401, 403, 500])("surfaces settings error %s", async (status) => {
    server.use(
      http.get(api("/notification-settings"), () => HttpResponse.json({ detail: `error-${status}` }, { status })),
      http.post(api("/auth/refresh"), () => HttpResponse.json({}, { status: 401 })),
    );
    expect(isApiError(await fetchNotificationSettings())).toBe(true);
  });
});
