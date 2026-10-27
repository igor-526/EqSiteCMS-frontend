import type { Dayjs } from "dayjs";
import type { SeoPagesFilters } from "./api/seo";
import type { MetricsMode, MetricsTableOutDto, PageMetric } from "./api/metricsTable";

/** Structural controls shared by the independent pages and queries models. */
export type SeoMetricsFilterControls = {
  filters: Pick<SeoPagesFilters, "mode" | "metric" | "dateFrom" | "dateTo">;
  metricsTable: MetricsTableOutDto | null;
  changeMode: (mode: MetricsMode) => void;
  changeMetric: (metric: PageMetric) => void;
  changeDates: (range: readonly [Dayjs, Dayjs] | null) => void;
  disabledDate: (date: Dayjs) => boolean;
};
