import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { UUID } from "crypto";
import { apiError, apiSuccess } from "@/lib/apiStatus";
import { useUserManagement } from "./useUserManagement";

const service = vi.hoisted(() => ({
  list: vi.fn(), roles: vi.fn(), create: vi.fn(), update: vi.fn(),
}));
const toast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));
vi.mock("../services/userManagementService", () => ({
  fetchUserManagementList: service.list,
  fetchRolesList: service.roles,
  fetchUserManagementCreate: service.create,
  fetchUserManagementUpdate: service.update,
  fetchUserManagementDelete: vi.fn(), fetchUserManagementBlock: vi.fn(),
  fetchUserManagementUnblock: vi.fn(), fetchUserManagementChangePassword: vi.fn(),
}));
vi.mock("@/hooks/useNotification", () => ({ useNotification: () => toast }));

describe("useUserManagement", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    service.list.mockResolvedValue(apiSuccess({ total: 0, items: [] }));
    service.roles.mockResolvedValue(apiSuccess([]));
  });

  it("uses limit/offset and resets offset for search, reset and page size", async () => {
    const { result } = renderHook(() => useUserManagement());
    await waitFor(() => expect(service.list).toHaveBeenCalledWith(expect.objectContaining({ limit: 25, offset: 0 })));
    act(() => result.current.setPage(50));
    await waitFor(() => expect(service.list).toHaveBeenLastCalledWith(expect.objectContaining({ limit: 25, offset: 50 })));
    act(() => result.current.setFilters({ search: "Иван" }));
    await waitFor(() => expect(result.current.filters.offset).toBe(0));
    act(() => result.current.setPage(25)); act(() => result.current.setLimit(50));
    expect(result.current.filters).toEqual(expect.objectContaining({ limit: 50, offset: 0 }));
    act(() => result.current.setPage(50)); act(() => result.current.resetFilters());
    expect(result.current.filters).toEqual(expect.objectContaining({ limit: 25, offset: 0 }));
  });

  it.each([
    ["Authentication failed", "Сессия истекла"],
    ["403 Forbidden", "Недостаточно прав"],
    ["backend unavailable", "backend unavailable"],
  ])("surfaces role-list error %s", async (detail, expected) => {
    service.roles.mockResolvedValue(apiError(detail));
    const { result } = renderHook(() => useUserManagement());
    await waitFor(() => expect(result.current.rolesError).toContain(expected));
  });

  it("loads roles from the backend raw array contract", async () => {
    const id = "00000000-0000-4000-8000-000000000030" as UUID;
    service.roles.mockResolvedValue(apiSuccess([{ id, scope_name: "USER_MANAGER", scope_description: null }]));
    const { result } = renderHook(() => useUserManagement());
    await waitFor(() => expect(result.current.roles).toEqual([
      { id, scope_name: "USER_MANAGER", scope_description: null },
    ]));
    expect(result.current.rolesError).toBeNull();
  });

  it("sends UUID scope_ids, does not refresh after failure and refreshes after success", async () => {
    service.create.mockResolvedValueOnce(apiError("validation failed")).mockResolvedValueOnce(apiSuccess(null));
    const { result } = renderHook(() => useUserManagement());
    const id = "00000000-0000-4000-8000-000000000001" as UUID;
    const payload = { equestrian_id: id, username: "new", password: "Password1", confirm_password: "Password1", first_name: null, last_name: null, middle_name: null, scope_ids: [id] };
    let failed = true;
    await act(async () => { failed = await result.current.createUser(payload); });
    expect(failed).toBe(false);
    expect(service.create).toHaveBeenCalledWith(expect.objectContaining({ scope_ids: [id] }));
    const callsBefore = service.list.mock.calls.length;
    expect(service.list.mock.calls.length).toBe(callsBefore);
    await act(async () => { await result.current.createUser(payload); });
    await waitFor(() => expect(service.list.mock.calls.length).toBeGreaterThan(callsBefore));
  });

  it("sends PATCH update UUID scope_ids and refreshes only after success", async () => {
    service.update.mockResolvedValueOnce(apiError("403 Forbidden")).mockResolvedValueOnce(apiSuccess(null));
    const { result } = renderHook(() => useUserManagement());
    const userId = "00000000-0000-4000-8000-000000000010" as UUID;
    const roleId = "00000000-0000-4000-8000-000000000011" as UUID;
    let ok = true;
    await act(async () => { ok = await result.current.updateUser(userId, { scope_ids: [roleId] }); });
    expect(ok).toBe(false);
    expect(service.update).toHaveBeenCalledWith(userId, { scope_ids: [roleId] });
    const callsBefore = service.list.mock.calls.length;
    await act(async () => { ok = await result.current.updateUser(userId, { scope_ids: [roleId] }); });
    expect(ok).toBe(true);
    await waitFor(() => expect(service.list.mock.calls.length).toBeGreaterThan(callsBefore));
  });

  it.each([
    ["create", "validation", { detail: { username: ["Уже существует"] } }, "username"],
    ["create", "generic", { detail: "backend unavailable" }, null],
    ["create", "401", { detail: "401 Authentication failed" }, null],
    ["create", "403", { detail: "403 Forbidden" }, null],
    ["update", "validation", { detail: { scope_ids: ["Недопустимая роль"] } }, "scope_ids"],
    ["update", "generic", { detail: "backend unavailable" }, null],
    ["update", "401", { detail: "401 Authentication failed" }, null],
    ["update", "403", { detail: "403 Forbidden" }, null],
  ])("surfaces %s %s failure without refresh", async (operation, _kind, data, validationKey) => {
    const response = { status: "error", data } as never;
    (operation === "create" ? service.create : service.update).mockResolvedValue(response);
    const { result } = renderHook(() => useUserManagement());
    await waitFor(() => expect(service.list).toHaveBeenCalled());
    const callsBefore = service.list.mock.calls.length;
    const id = "00000000-0000-4000-8000-000000000020" as UUID;
    if (operation === "create") {
      await act(async () => { await result.current.createUser({ equestrian_id: id, username: "new", password: "Password1", confirm_password: "Password1", first_name: null, last_name: null, middle_name: null, scope_ids: [id] }); });
    } else {
      await act(async () => { await result.current.updateUser(id, { scope_ids: [id] }); });
    }
    expect(service.list.mock.calls.length).toBe(callsBefore);
    if (validationKey) expect(result.current.validationErrors[validationKey]).toBeDefined();
    else expect(toast.error).toHaveBeenCalled();
  });
});
