import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { UsersHeader } from "./UsersHeader";
import { UsersTabsKey } from "./UsersTabs";

vi.mock("@/ui", () => ({
  TablePaginator: () => <div>Пагинация</div>,
}));

const props = {
  total: 12,
  filters: { limit: 25, offset: 0, sort: [] },
  setPage: vi.fn(), setLimit: vi.fn(),
  onSearchChange: vi.fn(), onAddUser: vi.fn(), onResetFilters: vi.fn(),
  activeTab: UsersTabsKey.USERS, setActiveTab: vi.fn(),
};

describe("UsersHeader", () => {
  it("renders tabs before controls and keeps pagination in the right-hand group", () => {
    render(<UsersHeader {...props} />);
    const header = screen.getByTestId("users-header");
    const tabList = header.querySelector('[role="tablist"]');
    expect(tabList).not.toBeNull();
    expect(tabList!.compareDocumentPosition(screen.getByTestId("users-controls")) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getByTestId("users-pagination")).toHaveClass("ml-auto");
    expect(screen.getByTestId("users-controls")).toHaveClass("flex-wrap");
  });

  it("switches documentation tabs without rendering mutation controls", () => {
    render(<UsersHeader {...props} activeTab={UsersTabsKey.USER_DOCS} />);
    expect(screen.queryByRole("button", { name: /добавить/i })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: "Документация" }));
    expect(props.setActiveTab).toHaveBeenCalledWith(UsersTabsKey.DEVELOPER_DOCS);
  });
});
