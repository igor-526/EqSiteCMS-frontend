import type { ApiListPaginatedResponseType, ApiPaginationType } from "./api";

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
export type SeoPagesOutDto = ApiListPaginatedResponseType<SeoPageOutDto>;
export type SeoSearchQueriesOutDto = ApiListPaginatedResponseType<SeoSearchQueryOutDto>;
export type SeoBlacklistOutDto = ApiListPaginatedResponseType<SeoBlacklistItemOutDto>;
export type SeoPagesQueryInDto = ApiPaginationType & {
  search?: string;
  ordering?: "page" | "-page";
};
export type SeoSearchQueriesQueryInDto = ApiPaginationType & {
  search?: string;
  ordering?: "query" | "-query";
};

export type SeoNormalizationKind = "hashes" | "params";
export type SeoDataResource = "pages" | "queries";
export type SeoSortOrder = "ascend" | "descend" | null | undefined;
