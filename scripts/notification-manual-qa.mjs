import { chromium } from "playwright";
import { readFile, mkdir, writeFile } from "node:fs/promises";

const credentials = JSON.parse(
  await readFile(process.env.CMS_LIVE_QA_CREDENTIALS_FILE ?? "../../.claude/skills/api-smoke-test/credentials.json", "utf8"),
);
const frontend = process.env.CMS_LIVE_QA_BASE_URL ?? "http://127.0.0.1:3100";
const evidenceDir = "docs/reports/notification-service-ui-051-screenshots";
await mkdir(evidenceDir, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.CMS_QA_BROWSER_PATH ?? "/usr/bin/google-chrome-stable",
});
const results = [];
const privateServiceRequests = [];
const mockAuth = process.env.CMS_QA_MOCK_AUTH === "1";
const userForRole = (role) => ({
  id: "00000000-0000-4000-8000-000000000010",
  equestrian_id: "00000000-0000-4000-8000-000000000011",
  username: `qa-${role}`,
  first_name: "QA",
  last_name: role,
  middle_name: null,
  created_at: "2026-08-18T00:00:00Z",
  updated_at: null,
  scopes: [{ id: "00000000-0000-4000-8000-000000000001", scope_name: role === "superuser" ? "SUPERUSER" : role.toUpperCase(), scope_description: null, created_at: "2026-08-18T00:00:00Z", updated_at: null }],
});

const login = async (page, role) => {
  const account = credentials.roles[role];
  await page.goto(`${frontend}/login`);
  await page.getByPlaceholder("Логин").fill(account.login);
  await page.getByPlaceholder("Пароль").fill(account.password);
  await page.getByRole("button", { name: "Войти" }).click();
  try {
    await page.waitForURL("**/dashboard", { timeout: 15000 });
  } catch (error) {
    const visibleText = (await page.locator("body").innerText()).slice(0, 500);
    throw new Error(`Login failed for ${role}; url=${page.url()}; visible=${visibleText}`, { cause: error });
  }
};

try {
  const anonymous = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const anonymousPage = await anonymous.newPage();
  await anonymousPage.goto(`${frontend}/notifications`);
  await anonymousPage.waitForURL("**/login", { timeout: 15000 });
  results.push({ case: "anonymous redirect", result: "PASS", url: anonymousPage.url() });
  await anonymousPage.screenshot({ path: `${evidenceDir}/anonymous-login.png`, fullPage: true });
  await anonymous.close();

  for (const role of ["superuser", "admin", "developer"]) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    page.on("request", (request) => {
      if (/notification-service|email-service|:8002|:8003/.test(request.url())) privateServiceRequests.push(request.url());
    });
    if (mockAuth) {
      await page.route("**/api/**", async (route) => {
        const request = route.request();
        const path = new URL(request.url()).pathname;
        if (path.endsWith("/auth/me")) return route.fulfill({ status: 200, json: userForRole(role) });
        if (path.endsWith("/emails/me")) return route.fulfill({ status: 404, json: { detail: "Email not found" } });
        if (path.endsWith("/notification-settings") && request.method() === "GET") {
          return route.fulfill({ status: 200, json: role === "developer" ? [] : [{ user_id: userForRole(role).id, event_code: "callback", event_name: "Обратный звонок", event_description: "Новый запрос", channel_code: "email", channel_name: "Email", enabled: false }] });
        }
        return route.fulfill({ status: 403, json: { detail: "QA controlled denial" } });
      });
    } else {
      await login(page, role);
    }
    await page.goto(`${frontend}/notifications`);
    await page.waitForLoadState("networkidle");
    const sidebar = await page.getByText("Уведомления", { exact: true }).count();
    const title = await page.getByRole("heading", { name: "Уведомления" }).count();
    const historyTab = await page.getByRole("tab", { name: "История" }).count();
    const settingsTab = await page.getByRole("tab", { name: "Настройки" }).count();
    await page.getByRole("tab", { name: "Настройки" }).click();
    const switchCount = await page.getByRole("switch", { name: /Обратный звонок/ }).count();
    const emptyCount = await page.getByText("Для вашей роли нет доступных событий").count();
    const roleExpectation = role === "developer" ? emptyCount > 0 && switchCount === 0 : switchCount === 1;
    results.push({ case: `${role} route/sidebar/tabs/scope`, result: sidebar > 0 && title > 0 && historyTab > 0 && settingsTab > 0 && roleExpectation ? "PASS" : "FAIL", sidebar, title, historyTab, settingsTab, switchCount, emptyCount });
    await page.screenshot({ path: `${evidenceDir}/${role}-desktop.png`, fullPage: true });

    if (role === "admin") {
      for (const viewport of [
        { name: "desktop", width: 1440, height: 900 },
        { name: "tablet", width: 768, height: 1024 },
        { name: "mobile", width: 375, height: 812 },
      ]) {
        await page.setViewportSize(viewport);
        await page.reload({ waitUntil: "networkidle" });
        await page.getByRole("tab", { name: "Настройки" }).click();
        const layout = await page.evaluate(() => ({
          documentWidth: document.documentElement.scrollWidth,
          viewportWidth: document.documentElement.clientWidth,
        }));
        results.push({ case: `responsive ${viewport.name}`, result: layout.documentWidth <= layout.viewportWidth ? "PASS" : "FAIL", ...layout });
        await page.screenshot({ path: `${evidenceDir}/admin-${viewport.name}.png`, fullPage: true });
      }
    }
    await context.close();
  }
} finally {
  await browser.close();
}

results.push({ case: "no private service browser requests", result: privateServiceRequests.length === 0 ? "PASS" : "FAIL", count: privateServiceRequests.length });
await writeFile("/tmp/notification-service-ui-051-browser-results.json", `${JSON.stringify(results, null, 2)}\n`, "utf8");
console.log(JSON.stringify(results, null, 2));
if (results.some((item) => item.result !== "PASS")) process.exitCode = 1;
