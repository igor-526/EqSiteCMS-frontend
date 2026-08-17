import { chromium } from "playwright";

const baseUrl = process.env.CMS_QA_BASE_URL ?? "http://127.0.0.1:3100";
const viewports = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "tablet", width: 768, height: 900 },
  { name: "mobile", width: 360, height: 800 },
];
const user = {
  id: "00000000-0000-4000-8000-000000000010",
  equestrian_id: "00000000-0000-4000-8000-000000000011",
  username: "qa-admin",
  first_name: "QA",
  last_name: "Admin",
  middle_name: null,
  created_at: "2026-08-16T00:00:00Z",
  updated_at: null,
  scopes: [
    {
      id: "00000000-0000-4000-8000-000000000001",
      scope_name: "ADMIN",
      scope_description: null,
      created_at: "2026-08-16T00:00:00Z",
      updated_at: null,
    },
  ],
};

const browser = await chromium.launch({ headless: true });
const evidence = [];
try {
  for (const viewport of viewports) {
    const page = await browser.newPage({ viewport });
    const consoleErrors = [];
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });
    await page.route("**/api/**", async (route) => {
      const url = new URL(route.request().url());
      if (url.pathname.endsWith("/auth/me")) {
        await route.fulfill({ status: 200, json: user });
        return;
      }
      if (route.request().method() === "GET") {
        await route.fulfill({ status: 200, json: { items: [], total: 0 } });
        return;
      }
      await route.fulfill({ status: 403, json: { detail: "QA forbidden" } });
    });

    for (const route of ["/login", "/horses", "/prices"]) {
      await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle" });
      const dimensions = await page.evaluate(() => ({
        documentWidth: document.documentElement.scrollWidth,
        viewportWidth: document.documentElement.clientWidth,
      }));
      evidence.push({
        viewport: viewport.name,
        route,
        title: await page.title(),
        horizontalOverflow: dimensions.documentWidth > dimensions.viewportWidth,
        consoleErrors: [...consoleErrors],
      });
      consoleErrors.length = 0;
    }

    await page.goto(`${baseUrl}/horses`, { waitUntil: "networkidle" });
    await page.keyboard.press("Tab");
    evidence.push({
      viewport: viewport.name,
      route: "/horses",
      keyboardFocus: await page.evaluate(() => document.activeElement?.tagName ?? null),
      docsVisible: await page.getByText("Документация", { exact: true }).count(),
    });
    await page.close();
  }
} finally {
  await browser.close();
}

console.log(JSON.stringify(evidence, null, 2));
