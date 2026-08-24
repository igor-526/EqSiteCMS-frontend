import { describe, expect, it } from "vitest";
import { getSentryConfig, sanitizeSentryEvent } from "./sentryConfig";

describe("getSentryConfig", () => {
  it("is disabled safely without a DSN by default", () => {
    expect(getSentryConfig({})).toMatchObject({
      enabled: false,
      dsn: undefined,
      tracesSampleRate: 0,
      sendDefaultPii: false,
    });
  });

  it("preserves enabled metadata and sample rate boundaries", () => {
    expect(
      getSentryConfig({
        SENTRY_ENABLED: "true",
        SENTRY_DSN: "https://public@example.invalid/1",
        SENTRY_ENVIRONMENT: "qa",
        SENTRY_TRACES_SAMPLE_RATE: "1",
        SENTRY_RELEASE: "cms@1.2.3",
      }),
    ).toMatchObject({
      enabled: true,
      dsn: "https://public@example.invalid/1",
      environment: "qa",
      tracesSampleRate: 1,
      release: "cms@1.2.3",
    });
  });

  it("rejects enabled config without a DSN and invalid rates", () => {
    expect(() => getSentryConfig({ SENTRY_ENABLED: "true" })).toThrow(/SENTRY_DSN/);
    expect(() => getSentryConfig({ SENTRY_TRACES_SAMPLE_RATE: "-0.1" })).toThrow(/between 0 and 1/);
    expect(() => getSentryConfig({ SENTRY_TRACES_SAMPLE_RATE: "1.1" })).toThrow(/between 0 and 1/);
  });

  it("removes credentials and request bodies from events", () => {
    const event = sanitizeSentryEvent({
      type: undefined,
      request: {
        cookies: { session: "secret" },
        data: "request-body",
        headers: {
          Authorization: "Bearer secret",
          Cookie: "session=secret",
          "X-Service-Key": "secret",
          Accept: "application/json",
        },
      },
    });

    expect(event.request).toEqual({
      cookies: undefined,
      data: undefined,
      headers: { Accept: "application/json" },
    });
  });
});
