import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "@/test/msw/server";
import { KNOWN_USER_SCOPES } from "@/types/api/user";
import { SEO_PARSE_ERROR } from "../services/seoDataService";
import { useSeoParseRefresh } from "./useSeoParseRefresh";

const context = vi.hoisted(() => ({ scopes: [] as KNOWN_USER_SCOPES[] }));
const toast = vi.hoisted(() => ({ success: vi.fn() }));
vi.mock("@/contexts/UserContext", () => ({ useUserContext: () => context }));
vi.mock("antd", () => ({ message: toast }));
const base = "http://127.0.0.1/api";
const path = `${base}/seo/parse-jobs`;
const accepted = { job_id: "job", provider: "ya_metrica", status: "accepted" };

beforeEach(() => {
  context.scopes = [KNOWN_USER_SCOPES.ADMIN];
  toast.success.mockClear();
});

describe("FT-PR-04 parse refresh hook", () => {
  it("open and cancel never send a request; direct confirm while closed is guarded", async () => {
    const post = vi.fn(() => HttpResponse.json(accepted, { status: 202 }));
    server.use(http.post(path, post));
    const { result } = renderHook(useSeoParseRefresh);
    expect(result.current.canStart).toBe(true);
    await act(() => result.current.confirm());
    act(() => result.current.show());
    expect(result.current.open).toBe(true);
    act(() => result.current.close());
    expect(result.current.open).toBe(false);
    expect(post).not.toHaveBeenCalled();
  });

  it("synchronously blocks double confirm and cancel while pending; success closes and toasts without table reload", async () => {
    let release!: () => void;
    const barrier = new Promise<void>(resolve => { release = resolve; });
    const post = vi.fn(async ({ request }: { request: Request }) => {
      expect(await request.json()).toEqual({ provider: "ya_metrica" });
      await barrier;
      return HttpResponse.json(accepted, { status: 202 });
    });
    const read = vi.fn(() => HttpResponse.json({ items: [], total: 0 }));
    server.use(http.post(path, post), http.get(`${base}/seo/pages`, read), http.get(`${base}/seo/search-queries`, read));
    const { result } = renderHook(useSeoParseRefresh);
    act(() => result.current.show());
    let request!: Promise<void>;
    act(() => { request = result.current.confirm(); void result.current.confirm(); result.current.close(); });
    await waitFor(() => expect(post).toHaveBeenCalledOnce());
    expect(result.current.pending).toBe(true);
    expect(result.current.open).toBe(true);
    await act(async () => { release(); await request; });
    expect(result.current.pending).toBe(false);
    expect(result.current.open).toBe(false);
    expect(result.current.error).toBeNull();
    expect(toast.success).toHaveBeenCalledExactlyOnceWith("Обновление поставлено в очередь");
    expect(post).toHaveBeenCalledOnce();
    expect(read).not.toHaveBeenCalled();
  });

  it.each([[], [KNOWN_USER_SCOPES.SUPERUSER], [KNOWN_USER_SCOPES.DEVELOPER]])("without ADMIN no modal or request: %j", async (...scopes) => {
    context.scopes = scopes;
    const post = vi.fn();
    server.use(http.post(path, post));
    const { result } = renderHook(useSeoParseRefresh);
    act(() => result.current.show());
    await act(() => result.current.confirm());
    expect(result.current.canStart).toBe(false);
    expect(result.current.open).toBe(false);
    expect(post).not.toHaveBeenCalled();
  });

  it("revoked permission blocks even callbacks saved before rerender", async () => {
    const post = vi.fn();
    server.use(http.post(path, post));
    const { result, rerender } = renderHook(useSeoParseRefresh);
    act(() => result.current.show());
    const oldConfirm = result.current.confirm;
    const oldShow = result.current.show;
    context.scopes = [];
    rerender();
    act(oldShow);
    await act(oldConfirm);
    expect(result.current.open).toBe(false);
    expect(post).not.toHaveBeenCalled();
  });

  it.each([
    [400, "Счётчик не привязан", "Счётчик не привязан"],
    [400, [{ msg: "private" }], SEO_PARSE_ERROR],
    [403, "private denial", "Недостаточно прав"],
    [502, "private upstream", SEO_PARSE_ERROR],
    [503, "private broker", SEO_PARSE_ERROR],
  ])("HTTP %s keeps modal open with safe error and allows explicit retry", async (status, detail, expected) => {
    const post = vi.fn(() => HttpResponse.json({ detail }, { status }));
    server.use(http.post(path, post));
    const { result } = renderHook(useSeoParseRefresh);
    act(() => result.current.show());
    await act(() => result.current.confirm());
    expect(result.current.open).toBe(true);
    expect(result.current.pending).toBe(false);
    expect(result.current.error).toBe(expected);
    expect(post).toHaveBeenCalledOnce();
    expect(toast.success).not.toHaveBeenCalled();
    server.use(http.post(path, () => HttpResponse.json(accepted, { status: 202 })));
    await act(() => result.current.confirm());
    expect(result.current.open).toBe(false);
    expect(result.current.error).toBeNull();
    expect(toast.success).toHaveBeenCalledOnce();
  });

  it("network failure remains visible until cancel; reopening clears the error", async () => {
    const post = vi.fn(() => HttpResponse.error());
    server.use(http.post(path, post));
    const { result } = renderHook(useSeoParseRefresh);
    act(() => result.current.show());
    await act(() => result.current.confirm());
    expect(result.current.error).toBe(SEO_PARSE_ERROR);
    expect(result.current.open).toBe(true);
    expect(post).toHaveBeenCalledOnce();
    act(() => result.current.close());
    act(() => result.current.show());
    expect(result.current.error).toBeNull();
    expect(toast.success).not.toHaveBeenCalled();
  });

  it("401 invokes shared auth refresh and does not falsely succeed or retry when refresh is denied", async () => {
    const post = vi.fn(() => HttpResponse.json({ detail: "private auth" }, { status: 401 }));
    const refresh = vi.fn(() => new HttpResponse(null, { status: 401 }));
    server.use(http.post(path, post), http.post(`${base}/auth/refresh`, refresh));
    const { result } = renderHook(useSeoParseRefresh);
    act(() => result.current.show());
    await act(() => result.current.confirm());
    expect(result.current.error).toBe("Требуется авторизация");
    expect(result.current.open).toBe(true);
    expect(result.current.pending).toBe(false);
    expect(refresh).toHaveBeenCalledOnce();
    expect(post).toHaveBeenCalledOnce();
    expect(toast.success).not.toHaveBeenCalled();
  });

  it.each(["revoked", "unmounted"])("ignores in-flight success after %s", async state => {
    let release!: () => void;
    const barrier = new Promise<void>(resolve => { release = resolve; });
    const post = vi.fn(async () => { await barrier; return HttpResponse.json(accepted, { status: 202 }); });
    server.use(http.post(path, post));
    const { result, rerender, unmount } = renderHook(useSeoParseRefresh);
    act(() => result.current.show());
    let request!: Promise<void>;
    act(() => { request = result.current.confirm(); });
    await waitFor(() => expect(post).toHaveBeenCalledOnce());
    if (state === "revoked") { context.scopes = []; rerender(); }
    else unmount();
    await act(async () => { release(); await request; });
    expect(toast.success).not.toHaveBeenCalled();
    if (state === "revoked") {
      expect(result.current.open).toBe(false);
      expect(result.current.pending).toBe(false);
    }
  });
});
