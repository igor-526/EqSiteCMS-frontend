import apiFetch, { addQueryParamsToUrl } from "./client";
import type {
  SeoBlacklistItemInDto,
  SeoBlacklistItemOutDto,
  SeoBlacklistOutDto,
  SeoPagesOutDto,
  SeoParseJobInDto,
  SeoParseJobOutDto,
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
    mode: query.mode,
    metric: query.metric,
    date_from: query.date_from,
    date_to: query.date_to,
  }));

export const getSeoSearchQueries = (query: SeoSearchQueriesQueryInDto = {}) =>
  apiFetch<SeoSearchQueriesOutDto>(addQueryParamsToUrl("/seo/search-queries", {
    limit: query.limit,
    offset: query.offset,
    search: query.search,
    ordering: query.ordering,
    mode: query.mode,
    metric: query.metric,
    date_from: query.date_from,
    date_to: query.date_to,
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

export const postSeoParseJob = (data: SeoParseJobInDto) =>
  apiFetch<SeoParseJobOutDto>("/seo/parse-jobs", {
    method: "POST",
    body: JSON.stringify({ provider: data.provider }),
  }, true); // Preserve HTTP status for the feature-specific safe error mapping.
