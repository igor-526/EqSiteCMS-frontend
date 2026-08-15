import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MainTable } from "./MainTable";

vi.mock("antd-style", () => ({
  createStyles: () => () => ({ styles: { customTable: "custom-table" } }),
}));

vi.mock("antd", () => ({
  Table: vi.fn((props) => (
    <div data-testid="main-table" data-loading={String(props.loading)}>
      <div data-testid="row-count">{props.dataSource.length}</div>
      {props.loading ? <div>Loading</div> : null}
      {!props.loading && props.dataSource.length === 0 ? (
        <div>Empty</div>
      ) : null}
      {props.columns.map(
        (column: {
          key: string;
          title: string;
          sortOrder?: string;
          dataIndex?: string;
          sorter?: boolean;
        }) => (
          <div key={column.key}>
            <span>{column.title}</span>
            <span data-testid={`sort-order-${column.key}`}>
              {column.sortOrder ?? "none"}
            </span>
            {column.sorter ? (
              <>
                <button
                  type="button"
                  onClick={() =>
                    props.onChange(
                      {},
                      {},
                      {
                        field: column.dataIndex,
                        columnKey: column.key,
                        order: "ascend",
                      },
                    )
                  }
                >
                  sort {column.key} asc
                </button>
                <button
                  type="button"
                  onClick={() =>
                    props.onChange(
                      {},
                      {},
                      {
                        field: column.dataIndex,
                        columnKey: column.key,
                        order: "descend",
                      },
                    )
                  }
                >
                  sort {column.key} desc
                </button>
              </>
            ) : null}
          </div>
        ),
      )}
      {props.dataSource.map((row: { key: string; name: string }) => (
        <div key={row.key}>{row.name}</div>
      ))}
    </div>
  )),
}));

describe("MainTable", () => {
  const columns = [
    { key: "name", dataIndex: "name", title: "Name", sorter: true },
    { key: "status", title: "Status", sorter: true },
  ];

  it("renders data rows and filter elements", () => {
    render(
      <MainTable
        сolumns={columns}
        data={[{ key: "1", name: "Horse A" }]}
        loading={false}
        filtersElements={<div>Filters</div>}
      />,
    );

    expect(screen.getByText("Filters")).toBeInTheDocument();
    expect(screen.getByText("Horse A")).toBeInTheDocument();
    expect(screen.getByTestId("row-count")).toHaveTextContent("1");
  });

  it("renders loading state", () => {
    render(<MainTable сolumns={columns} data={[]} loading />);

    expect(screen.getByTestId("main-table")).toHaveAttribute(
      "data-loading",
      "true",
    );
    expect(screen.getByText("Loading")).toBeInTheDocument();
  });

  it("renders empty state when not loading", () => {
    render(<MainTable сolumns={columns} data={[]} loading={false} />);

    expect(screen.getByText("Empty")).toBeInTheDocument();
  });

  it("maps ascending and descending sorts to backend sort array values", () => {
    const onSortChange = vi.fn();

    render(
      <MainTable
        сolumns={columns}
        data={[]}
        loading={false}
        onSortChange={onSortChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "sort name asc" }));
    fireEvent.click(screen.getByRole("button", { name: "sort name desc" }));
    fireEvent.click(screen.getByRole("button", { name: "sort status desc" }));

    expect(onSortChange).toHaveBeenNthCalledWith(1, ["name"]);
    expect(onSortChange).toHaveBeenNthCalledWith(2, ["-name"]);
    expect(onSortChange).toHaveBeenNthCalledWith(3, ["-status"]);
  });

  it("restores current sort state on sortable columns", () => {
    render(
      <MainTable
        сolumns={columns}
        data={[]}
        loading={false}
        currentSort={["name", "-status"]}
      />,
    );

    expect(screen.getByTestId("sort-order-name")).toHaveTextContent("ascend");
    expect(screen.getByTestId("sort-order-status")).toHaveTextContent(
      "descend",
    );
  });
});
