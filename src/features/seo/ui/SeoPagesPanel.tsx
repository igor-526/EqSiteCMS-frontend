import type { useSeoPagesTable } from "../hooks/useSeoPagesTable";
import { buildMetricsTableColumns } from "@/ui/metricsTable/buildMetricsTableColumns";
import { SeoDataTable } from "./SeoDataTable";
import { SeoPagesFilters } from "./SeoPagesFilters";

type Props = { table: ReturnType<typeof useSeoPagesTable> };

export function SeoPagesPanel({ table }: Props) {
  return <SeoDataTable table={table} additionalColumns={buildMetricsTableColumns(table.metricsTable, { sort: table.sort })}
    dateOnly fixedColumns hidePagination filtersElements={<SeoPagesFilters table={table} />} />;
}
