export const AUTH_STATUS = {
  OK: "ok",
  DENIED: "denied",
  ERROR: "error",
} as const;

export type AuthStatus = (typeof AUTH_STATUS)[keyof typeof AUTH_STATUS];

export type AuthResponsePayload = {
  status: "ok" | "denied";
};
