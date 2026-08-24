import type { ErrorEvent } from "@sentry/nextjs";

const SENSITIVE_HEADERS = new Set([
  "authorization",
  "cookie",
  "set-cookie",
  "x-api-key",
  "x-service-key",
  "x-tenant-secret",
]);

export type SentryEnvironment = Record<string, string | undefined>;

export interface SentryConfig {
  beforeSend: (event: ErrorEvent) => ErrorEvent;
  dsn: string | undefined;
  enabled: boolean;
  environment: string | undefined;
  release: string | undefined;
  sendDefaultPii: false;
  tracesSampleRate: number;
}

function parseEnabled(value: string | undefined): boolean {
  return value?.trim().toLowerCase() === "true";
}

function parseSampleRate(value: string | undefined): number {
  const normalized = value?.trim() ?? "";
  const rate = normalized === "" ? 0 : Number(normalized);

  if (!Number.isFinite(rate) || rate < 0 || rate > 1) {
    throw new Error("SENTRY_TRACES_SAMPLE_RATE must be a number between 0 and 1");
  }

  return rate;
}

function sanitizeHeaders(headers: Record<string, string> | undefined): Record<string, string> | undefined {
  if (!headers) return headers;

  return Object.fromEntries(
    Object.entries(headers).filter(([name]) => !SENSITIVE_HEADERS.has(name.toLowerCase())),
  );
}

export function sanitizeSentryEvent(event: ErrorEvent): ErrorEvent {
  if (!event.request) return event;

  return {
    ...event,
    request: {
      ...event.request,
      cookies: undefined,
      data: undefined,
      headers: sanitizeHeaders(event.request.headers),
    },
  };
}

export function getSentryConfig(env: SentryEnvironment = process.env): SentryConfig {
  const enabled = parseEnabled(env.SENTRY_ENABLED);
  const dsn = env.SENTRY_DSN?.trim() ?? "";

  if (enabled && dsn === "") {
    throw new Error("SENTRY_DSN is required when SENTRY_ENABLED=true");
  }

  return {
    enabled,
    dsn: dsn || undefined,
    environment: env.SENTRY_ENVIRONMENT?.trim() || undefined,
    release: env.SENTRY_RELEASE?.trim() || undefined,
    tracesSampleRate: parseSampleRate(env.SENTRY_TRACES_SAMPLE_RATE),
    sendDefaultPii: false,
    beforeSend: sanitizeSentryEvent,
  };
}
