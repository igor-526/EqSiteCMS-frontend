import { mkdir, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";

export const TYPECHECK_ROOT = ".next-typecheck";

export function createTypecheckPaths(runId) {
  const safeRunId = runId.replaceAll(/[^a-zA-Z0-9_-]/g, "-");
  const outputDirectory = path.join(TYPECHECK_ROOT, safeRunId);
  return {
    outputDirectory,
    configPath: `.tsconfig.typecheck-${safeRunId}.json`,
  };
}

export async function runCommand(command, arguments_, options = {}) {
  await new Promise((resolve, reject) => {
    const child = spawn(command, arguments_, { stdio: "inherit", ...options });
    child.once("error", reject);
    child.once("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} exited with code ${code}`));
    });
  });
}

export async function runIsolatedTypecheck({
  runId,
  execute = runCommand,
  projectDirectory = process.cwd(),
}) {
  const { outputDirectory, configPath } = createTypecheckPaths(runId);
  const absoluteOutput = path.join(projectDirectory, outputDirectory);
  const workspace = path.join(absoluteOutput, "workspace");
  await rm(absoluteOutput, { recursive: true, force: true });
  await mkdir(workspace, { recursive: true });

  try {
    await Promise.all([
      symlink(path.join(projectDirectory, "src"), path.join(workspace, "src"), "dir"),
      symlink(path.join(projectDirectory, "next-env.d.ts"), path.join(workspace, "next-env.d.ts"), "file"),
      symlink(path.join(projectDirectory, "next.config.ts"), path.join(workspace, "next.config.ts"), "file"),
    ]);
    const originalConfig = await readFile(
      path.join(projectDirectory, "tsconfig.json"),
      "utf8",
    );
    await writeFile(path.join(workspace, "tsconfig.json"), originalConfig);
    await execute("npx", ["next", "typegen", workspace], {
      cwd: projectDirectory,
      env: { ...process.env, NEXT_DIST_DIR: "generated" },
    });
    const baseConfig = JSON.parse(originalConfig);
    const include = baseConfig.include.filter(
      (entry) => !entry.startsWith(".next/"),
    );
    include.push(`${outputDirectory}/workspace/generated/types/**/*.ts`);
    await writeFile(
      path.join(projectDirectory, configPath),
      JSON.stringify({ ...baseConfig, include, compilerOptions: { ...baseConfig.compilerOptions, incremental: false } }),
    );
    await execute("npx", ["tsc", "--noEmit", "--project", configPath], {
      cwd: projectDirectory,
      env: process.env,
    });
  } finally {
    await rm(absoluteOutput, { recursive: true, force: true });
    await rm(path.join(projectDirectory, configPath), { force: true });
  }
}
