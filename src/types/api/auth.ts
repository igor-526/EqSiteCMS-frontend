export type AuthStatus = "ok" | "denied" | "error";

export type AuthResponsePayload = {
    status: "ok" | "denied";
};