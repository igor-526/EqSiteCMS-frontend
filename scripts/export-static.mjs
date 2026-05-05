import { mkdir, rm, cp, readdir, copyFile, writeFile, access } from "fs/promises";
import { constants } from "fs";
import path from "path";

const projectRoot = process.cwd();
const nextDir = path.join(projectRoot, ".next");
const appDir = path.join(nextDir, "server", "app");
const staticDir = path.join(nextDir, "static");
const publicDir = path.join(projectRoot, "public");
const outDir = path.join(projectRoot, "out");

async function ensureDir(target) {
  await mkdir(target, { recursive: true });
}

async function copyIfExists(source, destination) {
  try {
    await access(source, constants.F_OK);
    await cp(source, destination, { recursive: true });
  } catch {
    // ignore missing sources
  }
}

async function copyHtmlPages() {
  const entries = await readdir(appDir);

  for (const entry of entries) {
    if (!entry.endsWith(".html")) {
      continue;
    }

    const sourceFile = path.join(appDir, entry);

    if (entry === "_not-found.html") {
      await copyFile(sourceFile, path.join(outDir, "404.html"));
      continue;
    }

    const slug = entry.replace(/\.html$/, "");
    const targetDir = path.join(outDir, slug);
    await ensureDir(targetDir);
    await copyFile(sourceFile, path.join(targetDir, "index.html"));
  }
}

async function createRootRedirect() {
  const redirectHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Redirecting…</title>
    <meta http-equiv="refresh" content="0;url=/dashboard/">
    <link rel="canonical" href="/dashboard/">
    <script>
      window.location.replace("/dashboard/");
    </script>
  </head>
  <body>
    <p>Redirecting to <a href="/dashboard/">/dashboard/</a>…</p>
  </body>
</html>
`;

  await writeFile(path.join(outDir, "index.html"), redirectHtml, "utf8");
}

async function main() {
  await rm(outDir, { recursive: true, force: true });
  await ensureDir(outDir);

  await copyIfExists(publicDir, outDir);
  await ensureDir(path.join(outDir, "_next"));
  await copyIfExists(staticDir, path.join(outDir, "_next", "static"));

  await copyHtmlPages();
  await createRootRedirect();
}

main().catch((error) => {
  console.error("Failed to prepare static export:", error);
  process.exitCode = 1;
});


