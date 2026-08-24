import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  env: {
    SENTRY_ENABLED: process.env.SENTRY_ENABLED ?? "false",
    SENTRY_DSN: process.env.SENTRY_DSN ?? "",
    SENTRY_ENVIRONMENT: process.env.SENTRY_ENVIRONMENT ?? "",
    SENTRY_TRACES_SAMPLE_RATE: process.env.SENTRY_TRACES_SAMPLE_RATE ?? "0",
    SENTRY_RELEASE: process.env.SENTRY_RELEASE ?? "",
  },
  // Убираем output: "export" для нормальной работы клиентского роутинга
  // trailingSlash: true, // Можно оставить, если нужно
};

export default withSentryConfig(nextConfig, {
  silent: true,
  sourcemaps: { disable: true },
});
