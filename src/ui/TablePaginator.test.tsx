import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TablePaginator } from "./TablePaginator";

vi.mock("antd", () => ({
  Pagination: vi.fn((props) => (
    <div>
      <div data-testid="current-page">{props.current}</div>
      <div data-testid="page-size">{props.pageSize}</div>
      <button type="button" onClick={() => props.onChange(3, props.pageSize)}>
        go page 3
      </button>
      <button type="button" onClick={() => props.onShowSizeChange(2, 25)}>
        size 25 page 2
      </button>
    </div>
  )),
}));

describe("TablePaginator", () => {
  it("derives current page from limit and offset", () => {
    render(
      <TablePaginator
        filters={{ limit: 10, offset: 20 }}
        setFilters={vi.fn()}
        total={100}
      />,
    );

    expect(screen.getByTestId("current-page")).toHaveTextContent("3");
    expect(screen.getByTestId("page-size")).toHaveTextContent("10");
  });

  it("maps page changes to limit and offset", () => {
    const setFilters = vi.fn();

    render(
      <TablePaginator
        filters={{ limit: 10, offset: 0 }}
        setFilters={setFilters}
        total={100}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "go page 3" }));

    expect(setFilters).toHaveBeenCalledTimes(1);
    expect(setFilters.mock.calls[0][0]({ limit: 10, offset: 0 })).toEqual({
      limit: 10,
      offset: 20,
    });
  });

  it("maps page-size changes to limit and offset", () => {
    const setFilters = vi.fn();

    render(
      <TablePaginator
        filters={{ limit: 10, offset: 0 }}
        setFilters={setFilters}
        total={100}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "size 25 page 2" }));

    expect(setFilters).toHaveBeenCalledTimes(1);
    expect(setFilters.mock.calls[0][0]({ limit: 10, offset: 0 })).toEqual({
      limit: 25,
      offset: 25,
    });
  });
});
