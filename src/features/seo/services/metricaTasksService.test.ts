import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiError, apiSuccess } from "@/lib/apiStatus";
import { getMetricaTasks } from "@/api/seo";
import { fetchMetricaTasks, METRICA_TASKS_ERROR } from "./metricaTasksService";

vi.mock("@/api/seo", () => ({ getMetricaTasks: vi.fn() }));
beforeEach(() => vi.resetAllMocks());

describe("FE-01 safe Metrica service", () => {
  it.each([{ items: [] }, { items: [{ id: "delete:old", type: "delete" as const, status: "succeeded" as const,
    is_active: false, created_at: "2026-11-06T00:00:00Z" }] }])("preserves success/empty", async ({ items }) => {
    const response = apiSuccess({ items, total: items.length });
    vi.mocked(getMetricaTasks).mockResolvedValue(response);
    expect(await fetchMetricaTasks({ limit: 50, offset: 100 })).toEqual(response);
    expect(getMetricaTasks).toHaveBeenCalledExactlyOnceWith({ limit: 50, offset: 100 });
  });
  it.each([[400, METRICA_TASKS_ERROR], [401, "Требуется авторизация"],
    [403, "Недостаточно прав"], [502, METRICA_TASKS_ERROR]])("sanitizes HTTP %s", async (httpStatus, message) => {
    vi.mocked(getMetricaTasks).mockResolvedValue({ ...apiError("private token body"), httpStatus: Number(httpStatus) });
    expect(await fetchMetricaTasks({})).toEqual({ ...apiError(String(message)), httpStatus });
  });
  it("sanitizes thrown failures", async () => {
    vi.mocked(getMetricaTasks).mockRejectedValue(new Error("private"));
    expect(await fetchMetricaTasks({})).toEqual(apiError(METRICA_TASKS_ERROR));
  });
});
