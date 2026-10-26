import {
  createSeoBlacklistedHash,
  createSeoBlacklistedQueryParam,
  deleteSeoBlacklistedHash,
  deleteSeoBlacklistedQueryParam,
  getSeoBlacklistedHashes,
  getSeoBlacklistedQueryParams,
  getSeoPages,
  getSeoSearchQueries,
} from "@/api/seo";
import { apiError, isApiError } from "@/lib/apiStatus";
import type { ApiResult } from "@/types/api/api";
import type {
  SeoBlacklistItemInDto,
  SeoBlacklistItemOutDto,
  SeoNormalizationKind,
  SeoPagesQueryInDto,
  SeoSearchQueriesQueryInDto,
  SeoSortOrder,
} from "@/types/api/seo";
import { normalizationSchemas } from "../validators/normalization";

const PAGE = "page";
const PAGE_DESC = "-page";
const QUERY = "query";
const QUERY_DESC = "-query";
const ASCEND = "ascend";
const DESCEND = "descend";
const HASHES = "hashes";
const STRING_TYPE = "string";

// The shared client does not expose HTTP status. Do not infer it from detail text.
// It can also return a non-string detail at runtime (e.g. a validation array).
export function safeSeoResult<T>(result: ApiResult<T>): ApiResult<T> {
  if (isApiError(result) && typeof result.data.detail !== STRING_TYPE) {
    return apiError("Не удалось выполнить операцию SEO");
  }
  return result;
}

export const mapSeoPageOrdering = (
  field: string | undefined,
  order: SeoSortOrder,
): SeoPagesQueryInDto["ordering"] => {
  if (field !== PAGE) return undefined;
  if (order === ASCEND) return PAGE;
  return order === DESCEND ? PAGE_DESC : undefined;
};
export const mapSeoQueryOrdering = (
  field: string | undefined,
  order: SeoSortOrder,
): SeoSearchQueriesQueryInDto["ordering"] => {
  if (field !== QUERY) return undefined;
  if (order === ASCEND) return QUERY;
  return order === DESCEND ? QUERY_DESC : undefined;
};

// Trim only; literal search characters must reach the backend unchanged.
export const fetchSeoPages = async (query: SeoPagesQueryInDto = {}) =>
  safeSeoResult(await getSeoPages({
    limit: query.limit,
    offset: query.offset,
    search: query.search?.trim() || undefined,
    ordering: query.ordering === PAGE || query.ordering === PAGE_DESC ? query.ordering : undefined,
  }));
export const fetchSeoSearchQueries = async (query: SeoSearchQueriesQueryInDto = {}) =>
  safeSeoResult(await getSeoSearchQueries({
    limit: query.limit,
    offset: query.offset,
    search: query.search?.trim() || undefined,
    ordering: query.ordering === QUERY || query.ordering === QUERY_DESC ? query.ordering : undefined,
  }));

// Permission guards and request generations belong to the feature hooks.
// Normalization collections are list_all: never pass pagination query here.
export const fetchSeoNormalization = async (kind: SeoNormalizationKind) =>
  safeSeoResult(await (kind === HASHES ? getSeoBlacklistedHashes() : getSeoBlacklistedQueryParams()));

export const submitSeoNormalization = async (
  kind: SeoNormalizationKind,
  data: SeoBlacklistItemInDto,
): Promise<ApiResult<SeoBlacklistItemOutDto>> => {
  const parsed = normalizationSchemas[kind].safeParse(data.value);
  if (!parsed.success) return apiError(parsed.error.issues[0].message);
  const body = { value: parsed.data };
  return safeSeoResult(await (kind === HASHES
    ? createSeoBlacklistedHash(body) : createSeoBlacklistedQueryParam(body)));
};
export const removeSeoNormalization = async (kind: SeoNormalizationKind, id: string) =>
  safeSeoResult(await (kind === HASHES ? deleteSeoBlacklistedHash(id) : deleteSeoBlacklistedQueryParam(id)));
