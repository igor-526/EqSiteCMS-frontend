import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";

// Default handlers for commonly unhandled requests in tests
const handlers = [
  // Mock auth refresh endpoint to prevent warnings
  http.post("http://127.0.0.1/api/auth/refresh", () => {
    return HttpResponse.json(
      { detail: "Refresh token invalid or expired" },
      { status: 401 }
    );
  }),

  // Mock VK service endpoints that are frequently called
  http.get("http://127.0.0.1/api/vks/me", () => {
    return HttpResponse.json(
      { detail: "Not authenticated" },
      { status: 401 }
    );
  }),

  http.get("http://127.0.0.1/api/vks/bot-info", () => {
    return HttpResponse.json(
      { detail: "Not authenticated" },
      { status: 401 }
    );
  }),
];

export const server = setupServer(...handlers);
