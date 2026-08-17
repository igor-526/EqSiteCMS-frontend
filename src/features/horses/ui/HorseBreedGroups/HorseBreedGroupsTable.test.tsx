import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { KNOWN_USER_SCOPES } from "@/types/api/user";
import { HorseBreedGroupsTable } from "./HorseBreedGroupsTable";
import type { HorseBreedGroupsTableProps } from "./HorseBreedGroupsTable";

const state = vi.hoisted(() => ({ scopes: [] as KNOWN_USER_SCOPES[] }));
vi.mock("@/contexts/UserContext", () => ({ useUserContext: () => ({ scopes: state.scopes }) }));
const group = { id: "00000000-0000-4000-8000-000000000201" as never, name: "Верховые", slug: "verhovye", created_at: "2026-01-01", updated_at: null };
const props: HorseBreedGroupsTableProps = { horseBreedGroups: [group], loading: false, error: null, filters: { limit: 25, offset: 0, sort: ["-created_at"] }, setFilters: vi.fn(), onOpenModal: vi.fn(), onOpenPageModal: vi.fn() };

describe("HorseBreedGroupsTable", () => {
  beforeEach(() => { state.scopes = []; vi.clearAllMocks(); });
  it("renders group data and page action", () => { render(<HorseBreedGroupsTable {...props} />); expect(screen.getByText("Верховые")).toBeInTheDocument(); expect(screen.getByText("verhovye")).toBeInTheDocument(); });
  it("renders loading, empty and error states", () => {
    const { rerender } = render(<HorseBreedGroupsTable {...props} horseBreedGroups={[]} loading />); expect(document.querySelector(".ant-spin")).toBeInTheDocument();
    rerender(<HorseBreedGroupsTable {...props} horseBreedGroups={[]} />); expect(screen.getByText("Группы пород не найдены")).toBeInTheDocument();
    rerender(<HorseBreedGroupsTable {...props} error="denied" />); expect(screen.getByText("denied")).toBeInTheDocument();
  });
  it("guards row update without scope and allows it with scope", () => {
    const { rerender } = render(<HorseBreedGroupsTable {...props} />); fireEvent.click(screen.getByText("Верховые")); expect(props.onOpenModal).not.toHaveBeenCalled();
    state.scopes = [KNOWN_USER_SCOPES.ADMIN]; rerender(<HorseBreedGroupsTable {...props} />); fireEvent.click(screen.getByText("Верховые")); expect(props.onOpenModal).toHaveBeenCalledWith(String(group.id));
  });
  it("guards Page Editor by scope and has no photo controls", () => { const { rerender } = render(<HorseBreedGroupsTable {...props} />); expect(screen.queryByRole("button", { name: /Редактировать страницу/ })).not.toBeInTheDocument(); state.scopes = [KNOWN_USER_SCOPES.ADMIN]; rerender(<HorseBreedGroupsTable {...props} />); fireEvent.click(screen.getByRole("button", { name: /Редактировать страницу/ })); expect(props.onOpenPageModal).toHaveBeenCalledWith(String(group.id)); expect(screen.queryByText(/фото/i)).not.toBeInTheDocument(); });
});
