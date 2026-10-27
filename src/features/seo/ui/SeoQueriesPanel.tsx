import type { useSeoQueriesTable } from "../hooks/useSeoQueriesTable";
import { buildMetricsTableColumns } from "@/ui/metricsTable/buildMetricsTableColumns";
import { SeoDataTable } from "./SeoDataTable";
import { SeoPagesFilters } from "./SeoPagesFilters";

type Props = { table: ReturnType<typeof useSeoQueriesTable> };

export function SeoQueriesPanel({ table }: Props) {
  return <SeoDataTable table={table} additionalColumns={buildMetricsTableColumns(table.metricsTable, { sort: table.sort })}
    dateOnly fixedColumns hidePagination filtersElements={<SeoPagesFilters table={table} ariaLabel="Фильтры метрик запросов" />} />;
}
