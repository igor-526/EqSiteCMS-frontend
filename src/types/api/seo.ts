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
export type SeoSearchQueriesOutDto = ApiListPaginatedResponseType<SeoSearchQueryOutDto> & { metrics_table: MetricsTableOutDto };
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
  ordering?: SeoQueryOrdering;
  mode?: MetricsMode;
  metric?: PageMetric;
  date_from?: string;
  date_to?: string;
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

export type SeoQueryOrdering = "query" | "-query" | "created_at" | "-created_at"
  | `metric:${string}` | `-metric:${string}`;
export type SeoQueriesFilters = SeoPagesFilters;

export const SEO_PARSE_PROVIDER = "ya_metrica" as const;
export type SeoParseJobInDto = { provider: typeof SEO_PARSE_PROVIDER };
export type SeoParseJobOutDto = {
  job_id: string;
  provider: typeof SEO_PARSE_PROVIDER;
  status: "accepted";
};
