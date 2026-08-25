import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import UsersPage from "./page";

const state = vi.hoisted(() => ({ access: true, loading: false, superuser: false }));
const replace = vi.hoisted(() => vi.fn());
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }));
vi.mock("@/contexts/UserContext", () => ({ useUserContext: () => ({ loading: state.loading, user: { equestrian_id: "00000000-0000-4000-8000-000000000099" } }) }));
vi.mock("@/features/user-management/hooks/useUserManagementScopes", () => ({
  useCanAccessUserManagement: () => state.access,
  useIsSuperUser: () => state.superuser,
  useCurrentUserId: () => null,
}));
vi.mock("@/features/user-management/hooks/useUserManagement", () => ({
  useUserManagement: () => ({
    users: [], total: 0, loading: false, filters: { limit: 25, offset: 0, sort: [] },
    setFilters: vi.fn(), setPage: vi.fn(), setLimit: vi.fn(), resetFilters: vi.fn(),
    validationErrors: {}, resetValidation: vi.fn(), roles: [], rolesLoading: false,
    rolesError: null, createUser: vi.fn(), updateUser: vi.fn(), deleteUser: vi.fn(),
    blockUser: vi.fn(), unblockUser: vi.fn(), changePassword: vi.fn(),
  }),
}));
vi.mock("@/ui", () => ({
  TablePaginator: () => <div>page paginator</div>,
  DeveloperDocumentationOverview: ({ title, children }: { title: string; children: React.ReactNode }) => <section><h1>{title}</h1>{children}</section>,
}));
vi.mock("@/features/user-management/ui/UserManagementTable", () => ({ UserManagementTable: () => <div data-testid="users-table">users table</div> }));
vi.mock("@/features/user-management/ui/UserFormModal", () => ({ UserFormModal: () => null }));
vi.mock("@/features/user-management/ui/ChangePasswordModal", () => ({ ChangePasswordModal: () => null }));
vi.mock("@/features/user-management/ui/ConfirmBlockModal", () => ({ ConfirmBlockModal: () => null }));
vi.mock("@/features/user-management/ui/ConfirmDeleteModal", () => ({ ConfirmDeleteModal: () => null }));

describe("protected /users page", () => {
  beforeEach(() => { state.access = true; state.loading = false; replace.mockClear(); });

  it("renders tabs, controls, gap and table in semantic order", () => {
    render(<UsersPage />);
    const tabs = screen.getByRole("tablist");
    const controls = screen.getByTestId("users-controls");
    const region = screen.getByTestId("users-table-region");
    expect(tabs.compareDocumentPosition(controls) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(controls.compareDocumentPosition(region) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(region).toHaveClass("mt-4");
    expect(screen.getByTestId("users-table")).toBeInTheDocument();
  });

  it("switches both documentation views and removes list mutation UI", () => {
    render(<UsersPage />);
    fireEvent.click(screen.getByRole("tab", { name: "Инструкция" }));
    expect(screen.getByTestId("users-user-docs")).toBeInTheDocument();
    expect(screen.queryByTestId("users-table")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /добавить/i })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: "Документация" }));
    expect(screen.getByTestId("users-developer-docs")).toBeInTheDocument();
  });

  it("redirects anonymous or scope-missing access and blocks protected content", async () => {
    state.access = false;
    render(<UsersPage />);
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/dashboard"));
    expect(screen.queryByTestId("users-table")).not.toBeInTheDocument();
  });

  it.each(["USER_MANAGER", "SUPERUSER"])("renders authenticated %s access", (role) => {
    state.access = true; state.superuser = role === "SUPERUSER";
    render(<UsersPage />);
    expect(screen.getByTestId("users-table")).toBeInTheDocument();
  });
});
