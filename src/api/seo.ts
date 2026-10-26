import apiFetch, { addQueryParamsToUrl } from "./client";
import type {
  SeoBlacklistItemInDto,
  SeoBlacklistItemOutDto,
  SeoBlacklistOutDto,
  SeoPagesOutDto,
  SeoPagesQueryInDto,
  SeoSearchQueriesOutDto,
  SeoSearchQueriesQueryInDto,
} from "@/types/api/seo";

const hashesPath = "/seo/page-normalization/blacklisted-hashes";
const paramsPath = "/seo/page-normalization/blacklisted-query-params";

export const getSeoPages = (query: SeoPagesQueryInDto = {}) =>
  apiFetch<SeoPagesOutDto>(addQueryParamsToUrl("/seo/pages", {
    limit: query.limit,
    offset: query.offset,
    search: query.search,
    ordering: query.ordering,
  }));

export const getSeoSearchQueries = (query: SeoSearchQueriesQueryInDto = {}) =>
  apiFetch<SeoSearchQueriesOutDto>(addQueryParamsToUrl("/seo/search-queries", {
    limit: query.limit,
    offset: query.offset,
    search: query.search,
    ordering: query.ordering,
  }));

export const getSeoBlacklistedHashes = () => apiFetch<SeoBlacklistOutDto>(hashesPath);
export const getSeoBlacklistedQueryParams = () => apiFetch<SeoBlacklistOutDto>(paramsPath);
export const createSeoBlacklistedHash = (data: SeoBlacklistItemInDto) =>
  apiFetch<SeoBlacklistItemOutDto>(hashesPath, {
    method: "POST",
    body: JSON.stringify({ value: data.value }),
  });
export const createSeoBlacklistedQueryParam = (data: SeoBlacklistItemInDto) =>
  apiFetch<SeoBlacklistItemOutDto>(paramsPath, {
    method: "POST",
    body: JSON.stringify({ value: data.value }),
  });
export const deleteSeoBlacklistedHash = (id: string) =>
  apiFetch<null>(`${hashesPath}/${encodeURIComponent(id)}`, { method: "DELETE" });
export const deleteSeoBlacklistedQueryParam = (id: string) =>
  apiFetch<null>(`${paramsPath}/${encodeURIComponent(id)}`, { method: "DELETE" });
