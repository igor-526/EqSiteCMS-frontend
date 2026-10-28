import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiError, apiSuccess } from "@/lib/apiStatus";
import type { ApiResult } from "@/types/api/api";
import type { SeoBlacklistOutDto, SeoNormalizationKind } from "@/types/api/seo";
import { fetchSeoNormalization, removeSeoNormalization, submitSeoNormalization } from "../services/seoDataService";
import { usePageNormalization } from "./usePageNormalization";

const context = vi.hoisted(() => ({ scopes: ["SEO"] as string[] }));
vi.mock("@/contexts/UserContext", () => ({ useUserContext: () => context }));
vi.mock("../services/seoDataService", () => ({ fetchSeoNormalization: vi.fn(), removeSeoNormalization: vi.fn(), submitSeoNormalization: vi.fn() }));
const fetchList = vi.mocked(fetchSeoNormalization);
const create = vi.mocked(submitSeoNormalization);
const remove = vi.mocked(removeSeoNormalization);
const rows = Array.from({ length: 11 }, (_, index) => ({ id: `id-${index}`, value: `value-${index}`, created_at: "2026-01-01" }));
const deferred = <T,>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(done => { resolve = done; });
  return { promise, resolve };
};
beforeEach(() => {
  context.scopes = ["SEO"];
  fetchList.mockReset().mockResolvedValue(apiSuccess({ items: rows, total: 11 }));
  create.mockReset().mockResolvedValue(apiSuccess({ ...rows[0], id: "new", value: "canonical" }));
  remove.mockReset().mockResolvedValue(apiSuccess(null));
});
const setup = async (kind: SeoNormalizationKind = "hashes") => {
  const hook = renderHook(() => usePageNormalization());
  act(() => hook.result.current.show());
  await waitFor(() => expect(hook.result.current.loading).toBe(false));
  if (kind === "params") {
    act(() => hook.result.current.switchKind(kind));
    await waitFor(() => expect(hook.result.current.loading).toBe(false));
  }
  return hook;
};

describe("UT-SEO-12 list_all/reset/races", () => {
  it("loads full collection, slices ten locally without GET/query and resets on switch/reopen", async () => {
    const { result } = await setup();
    expect(result.current.items).toHaveLength(10);
    act(() => result.current.changePage(2));
    expect(result.current.items).toEqual([rows[10]]);
    expect(fetchList).toHaveBeenCalledExactlyOnceWith("hashes");
    act(() => { result.current.changeInput("draft"); result.current.select(rows[10]); result.current.cancelDelete(); result.current.switchKind("params"); });
    await waitFor(() => expect(fetchList).toHaveBeenLastCalledWith("params"));
    expect(result.current.offset).toBe(0);
    expect(result.current.input).toBe("");
    expect(result.current.selected).toBeNull();
    act(() => result.current.close());
    act(() => result.current.show());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.kind).toBe("hashes");
  });
  it("shows empty/read error/retry", async () => {
    fetchList.mockResolvedValueOnce(apiError("403"));
    const { result } = await setup();
    expect(result.current.readError).toBeTruthy();
    fetchList.mockResolvedValueOnce(apiSuccess({ items: [], total: 0 }));
    act(() => result.current.retry());
    await waitFor(() => expect(result.current.readError).toBeNull());
    expect(result.current.total).toBe(0);
  });
  it("ignores old closed and switched responses", async () => {
    const old = deferred<ApiResult<SeoBlacklistOutDto>>();
    fetchList.mockReturnValueOnce(old.promise);
    const { result } = renderHook(() => usePageNormalization());
    act(() => result.current.show());
    expect(result.current.loading).toBe(true);
    act(() => result.current.close());
    act(() => result.current.show());
    await waitFor(() => expect(result.current.total).toBe(11));
    await act(async () => old.resolve(apiSuccess({ items: [], total: 0 })));
    expect(result.current.total).toBe(11);
    const switched = deferred<ApiResult<SeoBlacklistOutDto>>();
    fetchList.mockReturnValueOnce(switched.promise);
    act(() => result.current.retry());
    act(() => result.current.switchKind("params"));
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => switched.resolve(apiError("late")));
    expect(result.current.readError).toBeNull();
  });
});

describe.each<SeoNormalizationKind>(["hashes", "params"])("UT-SEO-13..16 %s", kind => {
  it("validates before API and preserves invalid input", async () => {
    const { result } = await setup(kind);
    act(() => result.current.changeInput("bad value"));
    await act(async () => result.current.create());
    expect(create).not.toHaveBeenCalled();
    expect(result.current.error).toBeTruthy();
    expect(result.current.input).toBe("bad value");
  });
  it("uses canonical success, clears and refreshes first page; failed GET retries only GET", async () => {
    const { result } = await setup(kind);
    act(() => { result.current.changePage(2); result.current.changeInput(" new "); });
    fetchList.mockResolvedValue(apiError("502"));
    await act(async () => result.current.create());
    expect(create).toHaveBeenCalledExactlyOnceWith(kind, { value: "new" });
    expect(result.current.input).toBe("");
    expect(result.current.offset).toBe(0);
    expect(result.current.items[0].value).toBe("canonical");
    expect(result.current.error).toBeNull();
    expect(result.current.readError).toMatch(/Изменение сохранено/);
    act(() => result.current.retry());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(create).toHaveBeenCalledTimes(1);
  });
  it.each(["400", "409", "401", "403", "502"])("create error %s preserves context and unlocks", async detail => {
    const { result } = await setup(kind);
    create.mockResolvedValueOnce(apiError(detail));
    act(() => result.current.changeInput("draft"));
    await act(async () => result.current.create());
    expect(result.current.error).toBe(detail);
    expect(result.current.input).toBe("draft");
    expect(result.current.total).toBe(11);
    expect(result.current.pending).toBe(false);
  });
  it("synchronous create lock blocks double submit, close, switch, input and page", async () => {
    const waiting = deferred<Awaited<ReturnType<typeof submitSeoNormalization>>>();
    create.mockReturnValue(waiting.promise);
    const { result } = await setup(kind);
    act(() => result.current.changeInput("draft"));
    act(() => { void result.current.create(); void result.current.create(); });
    act(() => { result.current.close(); result.current.switchKind(kind === "hashes" ? "params" : "hashes"); result.current.changeInput("changed"); result.current.changePage(2); result.current.select(rows[0]); });
    expect(create).toHaveBeenCalledTimes(1);
    expect(result.current.open).toBe(true);
    expect(result.current.kind).toBe(kind);
    expect(result.current.input).toBe("draft");
    expect(result.current.offset).toBe(0);
    expect(result.current.selected).toBeNull();
    await act(async () => waiting.resolve(apiError("403")));
    expect(result.current.pending).toBe(false);
  });
  it("cancel does not delete; success deletes correct ID/kind and clamps last page", async () => {
    const { result } = await setup(kind);
    act(() => result.current.select(rows[0]));
    act(() => result.current.cancelDelete());
    expect(remove).not.toHaveBeenCalled();
    act(() => { result.current.changePage(2); result.current.select(rows[10]); });
    fetchList.mockResolvedValue(apiError("502"));
    await act(async () => result.current.confirmDelete());
    expect(remove).toHaveBeenCalledExactlyOnceWith(kind, rows[10].id);
    expect(result.current.selected).toBeNull();
    expect(result.current.open).toBe(true);
    expect(result.current.offset).toBe(0);
    expect(result.current.total).toBe(10);
    expect(result.current.readError).toMatch(/Изменение сохранено/);
    act(() => result.current.retry());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(remove).toHaveBeenCalledTimes(1);
  });
  it.each(["404", "400", "401", "403", "502"])("delete %s reconciles only GET, keeps confirmation and clamps", async detail => {
    const { result } = await setup(kind);
    act(() => { result.current.changePage(2); result.current.changeInput("draft"); result.current.select(rows[10]); });
    remove.mockResolvedValue(apiError(detail));
    fetchList.mockResolvedValue(apiSuccess({ items: rows.slice(0, 10), total: 10 }));
    await act(async () => result.current.confirmDelete());
    expect(result.current.deleteError).toMatch(/Возможно, он уже отсутствует/);
    expect(result.current.selected?.id).toBe(rows[10].id);
    expect(result.current.selectedMissing).toBe(true);
    expect(result.current.offset).toBe(0);
    expect(result.current.input).toBe("draft");
    await act(async () => result.current.confirmDelete());
    expect(remove).toHaveBeenCalledTimes(1);
  });
  it("double confirmation uses lock, error GET preserves selected context and allows cancel", async () => {
    const waiting = deferred<Awaited<ReturnType<typeof removeSeoNormalization>>>();
    const { result } = await setup(kind);
    remove.mockReturnValue(waiting.promise);
    fetchList.mockRejectedValue(new Error("network"));
    act(() => result.current.select(rows[0]));
    act(() => { void result.current.confirmDelete(); void result.current.confirmDelete(); result.current.cancelDelete(); result.current.close(); });
    expect(result.current.selected).not.toBeNull();
    expect(remove).toHaveBeenCalledTimes(1);
    await act(async () => waiting.resolve(apiError("403")));
    expect(result.current.deleteError).toBeTruthy();
    expect(result.current.readError).toBeTruthy();
    expect(result.current.pending).toBe(false);
    act(() => result.current.cancelDelete());
    expect(result.current.selected).toBeNull();
  });
});

describe("UT-SEO-15 permissions", () => {
  it.each([[], ["ADMIN"], ["SUPERUSER"], ["DEVELOPER"]])("blocks open/read/create/delete without SEO %j", (...scopes) => {
    context.scopes = scopes;
    const { result } = renderHook(() => usePageNormalization());
    act(() => { result.current.show(); result.current.changeInput("draft"); result.current.select(rows[0]); void result.current.create(); void result.current.confirmDelete(); result.current.retry(); });
    expect(result.current.open).toBe(false);
    expect(fetchList).not.toHaveBeenCalled();
    expect(create).not.toHaveBeenCalled();
    expect(remove).not.toHaveBeenCalled();
  });
  it("revokes captured handlers and discards in-flight mutation/read results", async () => {
    const { result, rerender } = await setup();
    act(() => { result.current.changeInput("draft"); result.current.select(rows[0]); });
    const captured = result.current;
    context.scopes = [];
    rerender();
    await act(async () => { await captured.confirmDelete(); captured.cancelDelete(); await captured.create(); captured.show(); });
    expect(remove).not.toHaveBeenCalled();
    expect(create).not.toHaveBeenCalled();
    expect(result.current.open).toBe(false);
    expect(result.current.items).toEqual([]);
  });
  it("ignores pending success after revoke and regrant", async () => {
    const waiting = deferred<Awaited<ReturnType<typeof submitSeoNormalization>>>();
    const { result, rerender } = await setup();
    create.mockReturnValue(waiting.promise);
    act(() => result.current.changeInput("draft"));
    act(() => { void result.current.create(); });
    context.scopes = []; rerender();
    context.scopes = ["SEO"]; rerender();
    await act(async () => waiting.resolve(apiSuccess(rows[0])));
    expect(result.current.open).toBe(false);
    expect(result.current.total).toBe(0);
    expect(fetchList).toHaveBeenCalledTimes(1);
  });
});


it("FE-D02 stale context callbacks cannot restore private draft or switch collection after revoke", async () => {
  context.scopes = ["SEO", "ADMIN"];
  const { result, rerender } = await setup();
  act(() => result.current.changeInput("private draft"));
  const captured = result.current;
  context.scopes = ["ADMIN"]; rerender();
  act(() => { captured.changeInput("restored private draft"); captured.changePage(2); captured.switchKind("params"); captured.retry(); captured.show(); });
  await act(async () => { await captured.create(); await captured.confirmDelete(); });
  expect(result.current.input).toBe("");
  expect(result.current.selected).toBeNull();
  expect(result.current.offset).toBe(0);
  expect(result.current.open).toBe(false);
  expect(fetchList).toHaveBeenCalledTimes(1);
  expect(create).not.toHaveBeenCalled();
  expect(remove).not.toHaveBeenCalled();
});

it.each([false, true])("FE-D02 ignores late list result after revoke/regrant (error=%s)", async error => {
  const old = deferred<ApiResult<SeoBlacklistOutDto>>();
  fetchList.mockReturnValueOnce(old.promise);
  const { result, rerender } = renderHook(() => usePageNormalization());
  act(() => result.current.show());
  context.scopes = ["ADMIN"]; rerender();
  context.scopes = ["SEO"]; rerender();
  await act(async () => old.resolve(error ? apiError("late private error") : apiSuccess({ items: rows, total: rows.length })));
  expect(result.current.open).toBe(false);
  expect(result.current.items).toEqual([]);
  expect(result.current.readError).toBeNull();
  expect(fetchList).toHaveBeenCalledTimes(1);
});
