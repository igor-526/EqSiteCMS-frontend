import { Tooltip, type TableColumnType } from "antd";
import type { MetricsTableOutDto } from "@/types/api/metricsTable";

type Row = Record<PropertyKey, unknown>;

export function buildMetricsTableColumns(table: MetricsTableOutDto | null, { sort = [] }: { sort?: string[] } = {}): TableColumnType<Row>[] {
  if (!table) return [];
  return table.columns.map(column => ({
    key: column.key,
    title: <Tooltip title={column.hint}>{column.title}</Tooltip>,
    align: column.align,
    width: 140,
    sorter: column.sortable || undefined,
    sortOrder: sort[0] === column.key ? "ascend" : sort[0] === `-${column.key}` ? "descend" : null,
    render: (_value: unknown, row: Row) => column.values[String(row[table.row_key])]?.text ?? column.empty_text,
  }));
}
