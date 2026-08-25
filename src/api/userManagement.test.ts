import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import type { UUID } from "crypto";
import { server } from "@/test/msw/server";
import { userManagementCreate, userManagementRolesList } from "./userManagement";

const apiUrl = (path: string) => `http://127.0.0.1/api${path}`;
const roleId = "00000000-0000-4000-8000-000000000001" as UUID;
const equestrianId = "00000000-0000-4000-8000-000000000002" as UUID;

describe("user-management API contract", () => {
  it("preserves the backend raw roles array response", async () => {
    const roles = [{ id: roleId, scope_name: "USER_MANAGER", scope_description: null }];
    server.use(http.get(apiUrl("/user-management/roles"), () => HttpResponse.json(roles)));
    await expect(userManagementRolesList()).resolves.toEqual({ status: "ok", data: roles });
  });

  it("sends the authenticated equestrian UUID in create payload", async () => {
    let body: Record<string, unknown> = {};
    server.use(http.post(apiUrl("/user-management/users"), async ({ request }) => {
      body = (await request.json()) as Record<string, unknown>;
      return HttpResponse.json({ id: roleId, equestrian_id: equestrianId, username: "new-user", scopes: [] }, { status: 201 });
    }));
    await userManagementCreate({ equestrian_id: equestrianId, username: "new-user", password: "Password1", confirm_password: "Password1", first_name: null, last_name: null, middle_name: null, scope_ids: [roleId] });
    expect(body).toMatchObject({ equestrian_id: equestrianId, scope_ids: [roleId] });
  });
});
