import { access, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import {
  createTypecheckPaths,
  runIsolatedTypecheck,
} from "../../scripts/typecheck-lib.mjs";

describe("isolated Next typecheck orchestration", () => {
  it("uses a run-specific directory instead of shared .next", () => {
    expect(createTypecheckPaths("worker-1").outputDirectory).toBe(
      ".next-typecheck/worker-1",
    );
  });

  it("works when generated cache is missing and cleans its output", async () => {
    const projectDirectory = path.join(tmpdir(), `cms-typecheck-${Date.now()}`);
    await mkdir(projectDirectory, { recursive: true });
    await writeFile(
      path.join(projectDirectory, "tsconfig.json"),
      JSON.stringify({ compilerOptions: {}, include: [".next/types/**/*.ts"] }),
    );
    const execute = vi.fn(async (_command, arguments_) => {
      if (arguments_[1] === "typegen") {
        const generated = path.join(arguments_[2], "generated/types");
        await mkdir(generated, { recursive: true });
        await writeFile(path.join(generated, "routes.d.ts"), "export {};");
      }
    });

    await runIsolatedTypecheck({ runId: "clean", execute, projectDirectory });
    await expect(
      access(path.join(projectDirectory, ".next-typecheck/clean")),
    ).rejects.toThrow();
  });

  it("keeps concurrent runs isolated", async () => {
    const first = createTypecheckPaths("concurrent-a");
    const second = createTypecheckPaths("concurrent-b");
    expect(first.outputDirectory).not.toBe(second.outputDirectory);
    expect(first.configPath).not.toBe(second.configPath);
  });
});
