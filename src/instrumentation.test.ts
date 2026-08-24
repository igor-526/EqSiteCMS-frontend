import { afterEach, describe, expect, it, vi } from "vitest";

const { captureRequestError } = vi.hoisted(() => ({ captureRequestError: vi.fn() }));

vi.mock("@sentry/nextjs", () => ({ captureRequestError }));

describe("server request instrumentation", () => {
  afterEach(() => vi.clearAllMocks());

  it("exports the official request-error capture hook", async () => {
    const instrumentation = await import("./instrumentation");
    expect(instrumentation.onRequestError).toBe(captureRequestError);
  });
});
