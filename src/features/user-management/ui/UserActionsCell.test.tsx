import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { UUID } from "crypto";
import { UserActionsCell } from "./UserActionsCell";

const id = "00000000-0000-4000-8000-000000000010" as UUID;
const superRole = { id, scope_name: "SUPERUSER", scope_description: null };
const user = { id, equestrian_id: id, username: "root", first_name: null, last_name: null, middle_name: null, is_blocked: false, created_at: "2026-01-01", updated_at: null, scopes: [superRole] };
const actions = { onChangePassword: vi.fn(), onToggleBlock: vi.fn(), onDelete: vi.fn() };

describe("UserActionsCell guards", () => {
  it("hides protected mutations on a SUPERUSER target from USER_MANAGER", () => {
    render(<UserActionsCell user={user} currentUserId={null} isSuperUser={false} {...actions} />);
    expect(screen.getByText("—")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("guards destructive self actions", () => {
    render(<UserActionsCell user={{ ...user, scopes: [] }} currentUserId={id} isSuperUser {...actions} />);
    expect(screen.getAllByRole("button")).toHaveLength(1);
  });
});
