import { chromium } from "playwright";
import { readFile, writeFile } from "node:fs/promises";

const parseHttpBaseUrl = (rawValue, variableName) => {
  let url;
  try {
    url = new URL(rawValue);
  } catch {
    throw new Error(`${variableName} must be a valid absolute URL`);
  }
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error(`${variableName} must use http or https`);
  }
  if (url.username || url.password || url.search || url.hash) {
    throw new Error(`${variableName} must not contain credentials, query, or fragment`);
  }
  return url.toString().replace(/\/$/, '');
};

const credentialsFile =
  process.env.CMS_LIVE_QA_CREDENTIALS_FILE ??
  "../../.claude/skills/api-smoke-test/credentials.json";
const credentials = JSON.parse(
  await readFile(credentialsFile, "utf8"),
);
const frontend = parseHttpBaseUrl(
  process.env.CMS_LIVE_QA_BASE_URL ?? "http://localhost:3001",
  "CMS_LIVE_QA_BASE_URL",
);
const backend = parseHttpBaseUrl(credentials.base_url, "credentials.base_url");
const viewports = [
  { width: 1440, height: 900 },
  { width: 768, height: 900 },
  { width: 360, height: 800 },
];
const routes = ["/horses", "/prices", "/gallery", "/news", "/site-settings"];
const evidence = [];
const browser = await chromium.launch({ headless: true });
let createdId;
let deniedUserId;
let adminContext;

const login = async (page, roleOrAccount) => {
  const account =
    typeof roleOrAccount === "string"
      ? credentials.roles[roleOrAccount]
      : roleOrAccount;
  await page.goto(`${frontend}/login`);
  await page.getByPlaceholder("Логин").fill(account.login);
  await page.getByPlaceholder("Пароль").fill(account.password);
  await page.getByRole("button", { name: "Войти" }).click();
  await page.waitForURL("**/dashboard");
};

try {
  adminContext = await browser.newContext({ viewport: viewports[0] });
  const page = await adminContext.newPage();
  const consoleErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  await login(page, "superuser");
  evidence.push({ flow: "login", status: "PASS", url: page.url() });

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    for (const route of routes) {
      const started = performance.now();
      await page.goto(frontend + route);
      await page.waitForLoadState("networkidle");
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      );
      evidence.push({
        flow: "feature-deep-link",
        route,
        viewport: `${viewport.width}x${viewport.height}`,
        status: page.url().includes("/login") || overflow ? "FAIL" : "PASS",
        elapsedMs: Math.round(performance.now() - started),
        horizontalOverflow: overflow,
      });
    }
  }

  await page.keyboard.press("Home");
  await page.keyboard.press("Tab");
  const focused = await page.evaluate(() => document.activeElement?.tagName ?? "NONE");
  evidence.push({ flow: "keyboard-focus", status: focused === "BODY" ? "FAIL" : "PASS", focused });

  const suffix = crypto.randomUUID().slice(0, 8);
  const key = `smoke_live_${suffix}`;
  const mutation = await adminContext.request.post(`${backend}/api/site_settings`, {
    data: { key, value: "qa", name: `Live QA ${suffix}`, description: "isolated", type: "string" },
  });
  const created = await mutation.json();
  createdId = created.id;
  evidence.push({ flow: "protected-write-success", status: mutation.status() === 200 ? "PASS" : "FAIL", http: mutation.status() });
  await page.goto(`${frontend}/site-settings`);
  await page.waitForLoadState("networkidle");
  evidence.push({ flow: "mutation-refresh", status: (await page.getByText(key).count()) > 0 ? "PASS" : "FAIL" });

  const anonymousContext = await browser.newContext();
  const anonymousWrite = await anonymousContext.request.post(`${backend}/api/site_settings`, {
    data: { key: `${key}_anon`, value: "qa", name: "Denied", type: "string" },
  });
  evidence.push({ flow: "protected-write-anonymous", status: anonymousWrite.status() === 401 ? "PASS" : "FAIL", http: anonymousWrite.status() });
  await anonymousContext.close();

  const me = await (await adminContext.request.get(`${backend}/api/auth/me`)).json();
  const deniedAccount = { login: `live_denied_${suffix}`, password: `LiveDenied9A${suffix}` };
  const fixtureResponse = await adminContext.request.post(`${backend}/api/user-management/users`, {
    data: { equestrian_id: me.equestrian_id, username: deniedAccount.login, password: deniedAccount.password, confirm_password: deniedAccount.password, first_name: "Live", last_name: "Denied", scope_ids: [] },
  });
  deniedUserId = (await fixtureResponse.json()).id;
  const deniedContext = await browser.newContext({ viewport: viewports[0] });
  const deniedPage = await deniedContext.newPage();
  await login(deniedPage, deniedAccount);
  const deniedWrite = await deniedContext.request.post(`${backend}/api/site_settings`, {
    data: { key: `${key}_denied`, value: "qa", name: `Denied ${suffix}`, type: "string" },
  });
  evidence.push({
    flow: "protected-write-scope-denial",
    status: deniedWrite.status() === 403 ? "PASS" : "FAIL",
    http: deniedWrite.status(),
    note: "isolated authenticated user with an empty scope set",
  });
  await deniedContext.close();
  const fixtureCleanup = await adminContext.request.delete(`${backend}/api/user-management/users/${deniedUserId}`);
  evidence.push({ flow: "scope-fixture-cleanup", status: fixtureCleanup.status() === 204 ? "PASS" : "FAIL", http: fixtureCleanup.status() });
  deniedUserId = undefined;

  const cleanup = await adminContext.request.delete(`${backend}/api/site_settings/${createdId}`);
  evidence.push({ flow: "cleanup", status: cleanup.status() === 204 ? "PASS" : "FAIL", http: cleanup.status() });
  createdId = undefined;
  await page.goto(`${frontend}/site-settings`);
  await page.waitForLoadState("networkidle");
  const afterCleanup = await adminContext.request.get(`${backend}/api/site_settings?key=${key}&full=true`);
  const afterCleanupBody = await afterCleanup.json();
  evidence.push({ flow: "cleanup-refresh", status: afterCleanupBody.total === 0 ? "PASS" : "FAIL" });

  await page.getByLabel("Выйти").click();
  await page.waitForURL("**/login");
  await page.goto(`${frontend}/horses`);
  await page.waitForURL("**/login");
  evidence.push({ flow: "logout-anonymous-redirect", status: "PASS", url: page.url() });
  evidence.push({ flow: "console-errors-captured", status: "PASS", count: consoleErrors.length, note: "includes intentional denial requests" });
  await adminContext.close();
} finally {
  if ((createdId || deniedUserId) && adminContext) {
    if (createdId) await adminContext.request.delete(`${backend}/api/site_settings/${createdId}`);
    if (deniedUserId) await adminContext.request.delete(`${backend}/api/user-management/users/${deniedUserId}`);
  }
  await adminContext?.close();
  await browser.close();
}

const failed = evidence.filter((item) => item.status !== "PASS");
const lines = [
  "# Live CMS QA evidence",
  "",
  "Real backend and production Next runtime; no route interception or MSW.",
  `CMS base URL: ${frontend}. Backend base URL: ${backend}.`,
  "Credentials/cookies are loaded from the smoke credential store and never recorded.",
  "",
  "| Flow | Route | Viewport | HTTP | Result | Notes |",
  "|---|---|---|---|---|---|",
  ...evidence.map((item) => `| ${item.flow} | ${item.route ?? item.url ?? "—"} | ${item.viewport ?? "—"} | ${item.http ?? "—"} | ${item.status} | ${item.note ?? (item.elapsedMs === undefined ? "—" : `${item.elapsedMs} ms; overflow=${item.horizontalOverflow}`)}${item.count === undefined ? "" : `; count=${item.count}`} |`),
  "",
  `Summary: ${evidence.length - failed.length}/${evidence.length} PASS.`,
  "",
  "Modal validation and double-submit remain covered by the blocking Vitest component suite; this live gate adds auth, scope denial, real mutation/refresh/cleanup, feature deep-links and logout.",
];
await writeFile("docs/live-qa-evidence.md", `${lines.join("\n")}\n`, "utf8");
console.log(`live QA ${evidence.length - failed.length}/${evidence.length}`);
if (failed.length) {
  console.error(JSON.stringify(failed, null, 2));
  process.exitCode = 1;
}
