import { describe, expect, it } from "vitest";

type OffsetFilters = {
  limit: number;
  offset: number;
  name?: string;
  sort?: string[];
};

const applyTableFilter = (
  previous: OffsetFilters,
  patch: Partial<OffsetFilters>,
): OffsetFilters => ({
  ...previous,
  ...patch,
  offset: 0,
});

describe("filter changes reset offset", () => {
  it("resets offset when a string filter changes", () => {
    expect(applyTableFilter({ limit: 25, offset: 75 }, { name: "horse" })).toEqual({
      limit: 25,
      offset: 0,
      name: "horse",
    });
  });

  it("resets offset when sorting filters change", () => {
    expect(applyTableFilter({ limit: 25, offset: 50 }, { sort: ["-name"] })).toEqual({
      limit: 25,
      offset: 0,
      sort: ["-name"],
    });
  });
});
