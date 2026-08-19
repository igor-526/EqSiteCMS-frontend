import { chromium } from "playwright";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";

const descriptorPath = process.env.CMS_LIVE_QA_CREDENTIALS_FILE ?? "/tmp/eqsitecms-frontend-qa-credentials.json";
const credentials = JSON.parse(await readFile(descriptorPath, "utf8"));
const sourceStore = JSON.parse(await readFile(credentials.source_store, "utf8"));
const frontend = process.env.CMS_LIVE_QA_BASE_URL ?? "http://localhost:3100";
const backend = credentials.base_url;
const evidenceDir = "docs/reports/notification-service-ui-051-live-screenshots";
await mkdir(evidenceDir, { recursive: true });
const results = [];
const networkEvidence = [];
const privateRequests = [];
const browser = await chromium.launch({ headless: true, executablePath: "/usr/bin/google-chrome-stable" });

const add = (caseName, passed, evidence = {}) => results.push({ case: caseName, result: passed ? "PASS" : "FAIL", ...evidence });
const login = async (page, role) => {
  const account = credentials.roles[role];
  const sourceAccount = sourceStore.roles[account.source_role];
  const response = await page.context().request.post(`${backend}${credentials.auth_endpoint}`, {
    data: { username: account.login, password: sourceAccount.password },
  });
  if (!response.ok()) throw new Error(`Login HTTP ${response.status()} for ${role}`);
  const me = await page.context().request.get(`${backend}/api/auth/me`);
  if (!me.ok()) throw new Error(`Auth me HTTP ${me.status()} for ${role}`);
};
const apiJson = async (context, method, path, data) => {
  const response = await context.request.fetch(`${backend}${path}`, { method, data });
  const body = await response.json().catch(() => null);
  networkEvidence.push({ method, path, status: response.status(), body: body?.detail ? { detail: body.detail } : undefined });
  return { response, body };
};
const latestToken = (userId) => execFileSync("docker", ["exec", "eqsitecms-db-email", "sh", "-lc", `psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Atc "SELECT ec.code FROM email_confirmations ec JOIN user_emails ue ON ue.id=ec.user_email_id WHERE ue.user_id='${userId}' AND ec.used_at IS NULL ORDER BY ec.created_at DESC LIMIT 1"`], { encoding: "utf8" }).trim();
const expireToken = (token) => execFileSync("docker", ["exec", "eqsitecms-db-email", "sh", "-lc", `psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Atc "UPDATE email_confirmations SET expires_at=now()-interval '1 hour' WHERE code='${token}'"`], { encoding: "utf8" });

let lifecycle;
try {
  const anonymous = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const anonymousPage = await anonymous.newPage();
  await anonymousPage.goto(`${frontend}/notifications`);
  await anonymousPage.waitForURL("**/login", { timeout: 15000 });
  add("F-27 anonymous protected redirect", !((await anonymousPage.locator("text=Email для уведомлений").count()) > 0), { url: anonymousPage.url() });
  await anonymousPage.screenshot({ path: `${evidenceDir}/anonymous-login.png`, fullPage: true });
  await anonymous.close();

  const roleContexts = {};
  for (const role of ["superuser", "admin", "developer", "user_manager"]) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    page.on("request", (request) => { if (/notification-service|email-service|:8002|:8003/.test(request.url())) privateRequests.push(request.url()); });
    await login(page, role);
    await page.goto(`${frontend}/notifications`);
    await page.waitForLoadState("networkidle");
    await page.getByRole("tab", { name: "Настройки" }).click();
    const switchCount = await page.getByRole("switch", { name: /Обратный звонок/ }).count();
    const emptyCount = await page.getByText("Для вашей роли нет доступных событий").count();
    const eligible = role === "superuser" || role === "admin";
    add(`F-26/F-33 ${role} route and scope`, (await page.getByRole("heading", { name: "Уведомления" }).count()) === 1 && (eligible ? switchCount === 1 : switchCount === 0 && emptyCount === 1), { switchCount, emptyCount });
    await page.screenshot({ path: `${evidenceDir}/${role}-desktop.png`, fullPage: true });
    roleContexts[role] = { context, page };
  }

  for (const [role, value] of Object.entries(roleContexts)) {
    const { response, body } = await apiJson(value.context, "GET", "/api/emails/me");
    if (response.status() === 404 && !lifecycle) lifecycle = { role, ...value, userId: null };
    const me = await apiJson(value.context, "GET", "/api/auth/me");
    if (lifecycle?.role === role) lifecycle.userId = me.body.id;
  }
  if (!lifecycle) throw new Error("No isolated role account without an existing email");

  const unique = crypto.randomUUID().slice(0, 10);
  const address1 = `qa-051-${unique}@example.com`;
  const address2 = `qa-051b-${unique}@example.com`;
  const address3 = `qa-051c-${unique}@example.com`;
  const page = lifecycle.page;
  await page.bringToFront();
  await page.goto(`${frontend}/notifications`);
  await page.waitForLoadState("networkidle");
  await page.getByRole("tab", { name: "Настройки" }).click();
  add("F-28 missing email state", (await page.getByRole("button", { name: "Добавить email" }).count()) === 1 && (await page.getByRole("button", { name: "Изменить" }).count()) === 0);
  await page.getByRole("button", { name: "Добавить email" }).click();
  await page.getByRole("textbox", { name: "Email" }).fill("invalid");
  await page.getByRole("button", { name: "Сохранить" }).click();
  add("F-29 client validation", (await page.getByText("Введите корректный email").count()) === 1);
  await page.getByRole("textbox", { name: "Email" }).fill(address1);
  const save = page.getByRole("button", { name: "Сохранить" });
  let createRequests = 0;
  const countCreate = (request) => { if (request.url().endsWith("/api/emails") && request.method() === "POST") createRequests += 1; };
  page.on("request", countCreate);
  await save.click();
  await save.click({ force: true }).catch(() => {});
  await page.getByText("Не подтверждён").waitFor();
  page.off("request", countCreate);
  add("F-29 create, double-submit guard and unconfirmed refresh", (await page.getByText(address1).count()) > 0 && createRequests === 1, { createRequests });
  await page.screenshot({ path: `${evidenceDir}/email-created-unconfirmed.png`, fullPage: true });

  await page.getByRole("button", { name: "Изменить" }).click();
  await page.getByRole("textbox", { name: "Email" }).fill(address2);
  await page.getByRole("button", { name: "Сохранить" }).click();
  await page.getByText(address2).waitFor();
  add("F-30 change requires confirmation", (await page.getByText("Не подтверждён").count()) > 0);

  const invalid = await apiJson(lifecycle.context, "PATCH", "/api/emails/confirm", { code: "qa-invalid-code" });
  add("F-32 invalid confirmation", invalid.response.status() >= 400 && invalid.response.status() < 500, { status: invalid.response.status() });
  const send = await apiJson(lifecycle.context, "POST", "/api/emails/send-confirmation", { user_id: lifecycle.userId });
  const token = latestToken(lifecycle.userId);
  const confirm = await apiJson(lifecycle.context, "PATCH", "/api/emails/confirm", { code: token });
  add("F-32 immediate valid confirmation", send.response.status() === 202 && confirm.response.ok(), { send: send.response.status(), confirm: confirm.response.status(), token: "<masked>" });
  const reused = await apiJson(lifecycle.context, "PATCH", "/api/emails/confirm", { code: token });
  add("F-32 reused confirmation", reused.response.status() === 409, { status: reused.response.status(), token: "<masked>" });
  const sendExpired = await apiJson(lifecycle.context, "POST", "/api/emails/send-confirmation", { user_id: lifecycle.userId });
  const expiredToken = latestToken(lifecycle.userId);
  expireToken(expiredToken);
  const expired = await apiJson(lifecycle.context, "PATCH", "/api/emails/confirm", { code: expiredToken });
  add("F-32 expired confirmation", sendExpired.response.status() === 202 && expired.response.status() === 410, { status: expired.response.status(), token: "<masked>" });
  await page.reload({ waitUntil: "networkidle" });
  await page.getByRole("tab", { name: "Настройки" }).click();

  const admin = roleContexts.admin;
  const adminSwitch = admin.page.getByRole("switch", { name: /Обратный звонок/ });
  const initialChecked = await adminSwitch.isChecked();
  const firstPatch = admin.page.waitForResponse((response) => response.url().includes("/notification-settings/callback/email") && response.request().method() === "PATCH");
  await adminSwitch.click();
  const firstPatchResponse = await firstPatch;
  await admin.page.waitForTimeout(300);
  add("F-34 server-confirmed setting success", firstPatchResponse.ok() && (await adminSwitch.isChecked()) !== initialChecked, { status: firstPatchResponse.status() });
  const restorePatch = admin.page.waitForResponse((response) => response.url().includes("/notification-settings/callback/email") && response.request().method() === "PATCH");
  await adminSwitch.click();
  const restorePatchResponse = await restorePatch;
  await admin.page.waitForTimeout(300);
  add("F-34 setting restored", restorePatchResponse.ok() && (await adminSwitch.isChecked()) === initialChecked, { status: restorePatchResponse.status() });
  const denied = await apiJson(roleContexts.developer.context, "PATCH", "/api/notification-settings/callback/email", { enabled: true });
  add("F-33 ineligible live mutation denied", denied.response.status() === 403, { status: denied.response.status() });

  for (const fault of [{ name: "400", status: 400 }, { name: "401", status: 401 }, { name: "403", status: 403 }, { name: "500", status: 500 }, { name: "timeout", status: 0 }]) {
    await admin.page.goto(`${frontend}/notifications`);
    await admin.page.waitForLoadState("networkidle");
    await admin.page.getByRole("tab", { name: "Настройки" }).click();
    const controlledSwitch = admin.page.getByRole("switch", { name: /Обратный звонок/ });
    const before = await controlledSwitch.isChecked();
    const handler = async (route) => {
      if (fault.status === 0) { await new Promise((resolve) => setTimeout(resolve, 1500)); return route.abort("timedout"); }
      return route.fulfill({ status: fault.status, json: { detail: `QA ${fault.name}` } });
    };
    await admin.page.route("**/api/notification-settings/callback/email", handler);
    await controlledSwitch.click();
    await admin.page.getByText(fault.status === 0 ? /Network error|invalid JSON/ : `QA ${fault.name}`).first().waitFor({ timeout: 10000 });
    add(`F-34 ${fault.name} non-commit`, (await controlledSwitch.isChecked()) === before);
    await admin.page.screenshot({ path: `${evidenceDir}/setting-${fault.name}-error.png`, fullPage: true });
    await admin.page.unroute("**/api/notification-settings/callback/email", handler);
  }

  for (const viewport of [{ name: "desktop", width: 1440, height: 900 }, { name: "tablet", width: 768, height: 1024 }, { name: "mobile", width: 375, height: 812 }]) {
    await admin.page.setViewportSize(viewport);
    await admin.page.goto(`${frontend}/notifications`);
    await admin.page.waitForLoadState("networkidle");
    await admin.page.getByRole("tab", { name: "Настройки" }).click();
    const dimensions = await admin.page.evaluate(() => ({ width: document.documentElement.scrollWidth, viewport: document.documentElement.clientWidth }));
    add(`F-35 ${viewport.name}`, dimensions.width <= dimensions.viewport, dimensions);
    await admin.page.screenshot({ path: `${evidenceDir}/admin-${viewport.name}.png`, fullPage: true });
  }

  await page.getByRole("button", { name: "Удалить" }).click();
  const confirmedWarning = await page.getByText(/Подтверждённый email будет удалён/).count();
  await page.getByRole("dialog").getByRole("button", { name: "Удалить" }).click();
  await page.getByRole("button", { name: "Добавить email" }).waitFor();
  add("F-31 confirmed delete and refresh", confirmedWarning === 1);

  await page.getByRole("button", { name: "Добавить email" }).click();
  await page.getByRole("textbox", { name: "Email" }).fill(address3);
  await page.getByRole("button", { name: "Сохранить" }).click();
  await page.getByText(address3).waitFor();
  await page.getByRole("button", { name: "Изменить" }).click();
  const changeFault = (route) => route.fulfill({ status: 400, json: { detail: "QA backend validation" } });
  await page.route("**/api/emails", changeFault);
  await page.getByRole("textbox", { name: "Email" }).fill(`changed-${address3}`);
  await page.getByRole("button", { name: "Сохранить" }).click();
  await page.getByText("QA backend validation").waitFor();
  add("F-30 backend validation preserves modal", (await page.getByRole("dialog").count()) === 1 && (await page.getByRole("textbox", { name: "Email" }).inputValue()) === `changed-${address3}`);
  await page.unroute("**/api/emails", changeFault);
  await page.getByRole("button", { name: "Отмена" }).click();
  await page.getByRole("button", { name: "Удалить" }).click();
  const unconfirmedWarning = await page.getByText(/Неподтверждённый email будет удалён/).count();
  await page.getByRole("dialog").getByRole("button", { name: "Отмена" }).click();
  await page.getByRole("dialog").waitFor({ state: "hidden" });
  await page.getByRole("button", { name: "Удалить", exact: true }).click();
  const deleteFault = (route) => route.fulfill({ status: 500, json: { detail: "QA delete failure" } });
  await page.route("**/api/emails/**", deleteFault);
  await page.getByRole("dialog").getByRole("button", { name: "Удалить" }).click();
  await page.getByText("QA delete failure").waitFor();
  const preservedDeleteDialog = (await page.getByRole("dialog").count()) === 1;
  await page.screenshot({ path: `${evidenceDir}/delete-error-preserved.png`, fullPage: true });
  await page.unroute("**/api/emails/**", deleteFault);
  await page.getByRole("dialog").getByRole("button", { name: "Удалить" }).click();
  await page.getByRole("button", { name: "Добавить email" }).waitFor();
  add("F-31 unconfirmed cancel/error preservation/success", unconfirmedWarning === 1 && preservedDeleteDialog);
  add("F-36 no private service requests", privateRequests.length === 0, { count: privateRequests.length });

  for (const { context } of Object.values(roleContexts)) await context.close();
} finally {
  await browser.close();
}

await writeFile("/tmp/notification-service-ui-051-live-results.json", `${JSON.stringify({ results, networkEvidence }, null, 2)}\n`, "utf8");
console.log(JSON.stringify(results, null, 2));
if (results.some((item) => item.result !== "PASS")) process.exitCode = 1;
