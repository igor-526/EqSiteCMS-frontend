import { afterEach, describe, expect, it, vi } from "vitest";

const { captureRouterTransitionStart, init } = vi.hoisted(() => ({
  captureRouterTransitionStart: vi.fn(),
  init: vi.fn(),
}));

vi.mock("@sentry/nextjs", () => ({ captureRouterTransitionStart, init }));

const originalEnv = { ...process.env };

describe("Sentry runtime initialization", () => {
  afterEach(() => {
    process.env = { ...originalEnv };
    vi.resetModules();
    vi.clearAllMocks();
  });

  it.each([
    ["client", "./instrumentation-client"],
    ["server", "./sentry.server.config"],
    ["edge", "./sentry.edge.config"],
  ])("does not initialize the %s SDK when disabled", async (_runtime, modulePath) => {
    process.env.SENTRY_ENABLED = "false";
    await import(modulePath);
    expect(init).not.toHaveBeenCalled();
  });

  it.each([
    ["client", "./instrumentation-client"],
    ["server", "./sentry.server.config"],
    ["edge", "./sentry.edge.config"],
  ])("initializes the %s SDK once when enabled", async (_runtime, modulePath) => {
    process.env.SENTRY_ENABLED = "true";
    process.env.SENTRY_DSN = "https://public@example.invalid/1";
    process.env.SENTRY_TRACES_SAMPLE_RATE = "0";
    await import(modulePath);
    expect(init).toHaveBeenCalledTimes(1);
    expect(init).toHaveBeenCalledWith(expect.objectContaining({ enabled: true, tracesSampleRate: 0 }));
  });
});
