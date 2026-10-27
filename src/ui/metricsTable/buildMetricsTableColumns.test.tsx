import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithCmsProviders } from "@/test/render";
import { Table } from "antd";
import type { MetricsTableOutDto } from "@/types/api/metricsTable";
import { buildMetricsTableColumns } from "./buildMetricsTableColumns";

const table = {
  row_key: "uuid", columns: [
    { key: "m", title: "20 окт", hint: "20.10.2026", align: "right", sortable: true, value_type: "future", empty_text: "—", values: { p: { text: "1 мин 55 с", value: 115 } }, unknown: "ignored" },
    { key: "n", title: "21 окт", hint: null, align: "left", sortable: false, value_type: "percent", empty_text: "нет", values: {} },
  ],
} as unknown as MetricsTableOutDto;

describe("FT-PM-11 metricsTable", () => {
  it("keeps metadata, ordering and server text, ignores unknown fields and missing cells", async () => {
    const columns = buildMetricsTableColumns(table, { sort: ["-m"] });
    expect(columns[0]).toMatchObject({ key: "m", align: "right", sorter: true, sortOrder: "descend" });
    expect(columns[1].sorter).toBeUndefined();
    expect(columns[1].sortOrder).toBeNull();
    expect(columns[0]).not.toHaveProperty("unknown");
    renderWithCmsProviders(<Table columns={columns} dataSource={[{ key: "p", uuid: "p" }, { key: "q", uuid: "q" }]} pagination={false} />);
    expect(screen.getByText("1 мин 55 с")).toBeInTheDocument();
    expect(screen.getByText("—")).toBeInTheDocument();
    expect(screen.getAllByText("нет")).toHaveLength(2);
    await userEvent.hover(screen.getByText("20 окт"));
    expect((await screen.findAllByRole("tooltip"))[0]).toHaveTextContent("20.10.2026");
  });
  it("accepts absent table and clears sort", () => {
    expect(buildMetricsTableColumns(null)).toEqual([]);
    expect(buildMetricsTableColumns(table)[0].sortOrder).toBeNull();
    expect(buildMetricsTableColumns(table, { sort: ["m"] })[0].sortOrder).toBe("ascend");
  });
});
