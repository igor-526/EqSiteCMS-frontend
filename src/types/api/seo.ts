import type { ApiListPaginatedResponseType, ApiPaginationType } from "./api";

import type { MetricsMode, MetricsTableOutDto, PageMetric } from "./metricsTable";

export type SeoPageOutDto = {
  id: string;
  page: string;
  created_at: string;
};

export type SeoSearchQueryOutDto = {
  id: string;
  query: string;
  created_at: string;
};

export type SeoBlacklistItemOutDto = {
  id: string;
  value: string;
  created_at: string;
};

export type SeoBlacklistItemInDto = { value: string };
export type SeoPagesOutDto = ApiListPaginatedResponseType<SeoPageOutDto> & { metrics_table: MetricsTableOutDto };
export type SeoSearchQueriesOutDto = ApiListPaginatedResponseType<SeoSearchQueryOutDto>;
export type SeoBlacklistOutDto = ApiListPaginatedResponseType<SeoBlacklistItemOutDto>;
export type SeoPagesQueryInDto = ApiPaginationType & {
  search?: string;
  ordering?: SeoPageOrdering;
  mode?: MetricsMode;
  metric?: PageMetric;
  date_from?: string;
  date_to?: string;
};
export type SeoSearchQueriesQueryInDto = ApiPaginationType & {
  search?: string;
  ordering?: "query" | "-query";
};

export type SeoNormalizationKind = "hashes" | "params";
export type SeoDataResource = "pages" | "queries";
export type SeoSortOrder = "ascend" | "descend" | null | undefined;

export type SeoPageOrdering = "page" | "-page" | "created_at" | "-created_at"
  | `metric:${string}` | `-metric:${string}`;
export type SeoPagesFilters = {
  limit: number;
  offset: number;
  search?: string;
  mode: MetricsMode;
  metric: PageMetric;
  dateFrom?: string;
  dateTo?: string;
};
