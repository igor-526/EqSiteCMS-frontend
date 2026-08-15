import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ListFilter } from "./ListFilter";
import { StringFilter } from "./StringFilter";

vi.mock("@mui/icons-material/Clear", () => ({
  default: () => <span data-testid="clear-icon" />,
}));

vi.mock("antd", () => ({
  Button: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick: () => void;
  }) => (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  ),
  Input: (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input {...props} />
  ),
  Space: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Select: (props: {
    value?: string[];
    placeholder: string;
    onChange: (value: string[]) => void;
    options: { label: string; value: string }[];
  }) => (
    <div>
      <div data-testid="select-value">{props.value?.join(",") ?? "empty"}</div>
      <button
        type="button"
        onClick={() => props.onChange([String(props.options[0].value)])}
      >
        select first
      </button>
      <button
        type="button"
        onClick={() =>
          props.onChange(props.options.map((option) => String(option.value)))
        }
      >
        select all
      </button>
      <button type="button" onClick={() => props.onChange([])}>
        clear select
      </button>
      <span>{props.placeholder}</span>
    </div>
  ),
}));

describe("StringFilter", () => {
  it("applies a trimmed value while preserving current behavior", async () => {
    const onChange = vi.fn();

    render(<StringFilter value="" onChange={onChange} placeHolder="Search" />);

    fireEvent.change(screen.getByPlaceholderText("Search"), {
      target: { value: " abc " },
    });

    expect(onChange).toHaveBeenCalledWith("abc");
  });

  it("clears to undefined", () => {
    const onChange = vi.fn();

    render(<StringFilter value="abc" onChange={onChange} />);

    fireEvent.click(screen.getByRole("button", { name: /Очистить/ }));

    expect(onChange).toHaveBeenCalledWith(undefined);
  });

  it("normalizes whitespace-only input to an empty string", async () => {
    const onChange = vi.fn();

    render(<StringFilter value="" onChange={onChange} />);

    fireEvent.change(screen.getByPlaceholderText("Поиск"), {
      target: { value: " " },
    });

    expect(onChange).toHaveBeenCalledWith("");
  });
});

describe("ListFilter", () => {
  const filterData = [
    { key: "admin", label: "Admin", value: "ADMIN" },
    { key: "developer", label: "Developer", value: "DEVELOPER" },
  ];

  it("normalizes a scalar filter value to a selected array", () => {
    render(
      <ListFilter
        filters={{ scopes: "ADMIN" }}
        setFilters={vi.fn()}
        filterKey="scopes"
        filterData={filterData}
        placeHolder="Scopes"
      />,
    );

    expect(screen.getByTestId("select-value")).toHaveTextContent("ADMIN");
  });

  it("applies selected values to the filter key", () => {
    const setFilters = vi.fn();

    render(
      <ListFilter
        filters={{ scopes: undefined }}
        setFilters={setFilters}
        filterKey="scopes"
        filterData={filterData}
        placeHolder="Scopes"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "select first" }));

    expect(setFilters).toHaveBeenCalledTimes(1);
    expect(setFilters.mock.calls[0][0]({ limit: 10, offset: 20 })).toEqual({
      limit: 10,
      offset: 20,
      scopes: ["ADMIN"],
    });
  });

  it("keeps multi-value selections and represents clear as an empty array", () => {
    const setFilters = vi.fn();

    render(
      <ListFilter
        filters={{ scopes: ["ADMIN"] }}
        setFilters={setFilters}
        filterKey="scopes"
        filterData={filterData}
        placeHolder="Scopes"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "select all" }));
    fireEvent.click(screen.getByRole("button", { name: "clear select" }));

    expect(setFilters.mock.calls[0][0]({ scopes: ["ADMIN"] })).toEqual({
      scopes: ["ADMIN", "DEVELOPER"],
    });
    expect(setFilters.mock.calls[1][0]({ scopes: ["ADMIN"] })).toEqual({
      scopes: [],
    });
  });
});
