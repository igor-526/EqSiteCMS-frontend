import * as Sentry from "@sentry/nextjs";
import { getSentryConfig } from "./src/lib/sentryConfig";

const config = getSentryConfig();

if (config.enabled) {
  Sentry.init(config);
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
