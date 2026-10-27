import {
  createSeoBlacklistedHash,
  createSeoBlacklistedQueryParam,
  deleteSeoBlacklistedHash,
  deleteSeoBlacklistedQueryParam,
  getSeoBlacklistedHashes,
  getSeoBlacklistedQueryParams,
  getSeoPages,
  getSeoSearchQueries,
  postSeoParseJob,
} from "@/api/seo";
import { apiError, isApiError } from "@/lib/apiStatus";
import type { ApiResult } from "@/types/api/api";
import {
  SEO_PARSE_PROVIDER,
  type SeoBlacklistItemInDto,
  type SeoBlacklistItemOutDto,
  type SeoNormalizationKind,
  type SeoPagesQueryInDto,
  type SeoParseJobOutDto,
  type SeoSearchQueriesQueryInDto,
  type SeoSortOrder,
} from "@/types/api/seo";
import { normalizationSchemas } from "../validators/normalization";

const ASCEND = "ascend";
const DESCEND = "descend";
const HASHES = "hashes";
const STRING_TYPE = "string";

// Most SEO operations do not opt into HTTP status. Never infer it from detail text.
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
  if (!field || !/^(page|created_at|metric:\d{4}-\d{2}-\d{2})$/.test(field)) return undefined;
  if (order === ASCEND) return field as SeoPagesQueryInDto["ordering"];
  return order === DESCEND ? `-${field}` as SeoPagesQueryInDto["ordering"] : undefined;
};
export const mapSeoQueryOrdering = (
  field: string | undefined,
  order: SeoSortOrder,
): SeoSearchQueriesQueryInDto["ordering"] => {
  if (!field || !/^(query|created_at|metric:\d{4}-\d{2}-\d{2})$/.test(field)) return undefined;
  if (order === ASCEND) return field as SeoSearchQueriesQueryInDto["ordering"];
  return order === DESCEND ? `-${field}` as SeoSearchQueriesQueryInDto["ordering"] : undefined;
};

// Trim only; literal search characters must reach the backend unchanged.
export const fetchSeoPages = async (query: SeoPagesQueryInDto = {}) =>
  safeSeoResult(await getSeoPages({
    limit: query.limit,
    offset: query.offset,
    search: query.search?.trim() || undefined,
    ordering: mapSeoPageOrdering(query.ordering?.replace(/^-/, ""), query.ordering?.startsWith("-") ? DESCEND : ASCEND),
    ...(query.mode !== undefined && { mode: query.mode }),
    ...(query.metric !== undefined && { metric: query.metric }),
    ...(query.date_from !== undefined && { date_from: query.date_from }),
    ...(query.date_to !== undefined && { date_to: query.date_to }),
  }));
export const fetchSeoSearchQueries = async (query: SeoSearchQueriesQueryInDto = {}) =>
  safeSeoResult(await getSeoSearchQueries({
    limit: query.limit,
    offset: query.offset,
    search: query.search?.trim() || undefined,
    ordering: mapSeoQueryOrdering(query.ordering?.replace(/^-/, ""), query.ordering?.startsWith("-") ? DESCEND : ASCEND),
    ...(query.mode !== undefined && { mode: query.mode }),
    ...(query.metric !== undefined && { metric: query.metric }),
    ...(query.date_from !== undefined && { date_from: query.date_from }),
    ...(query.date_to !== undefined && { date_to: query.date_to }),
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

const PARSE_HTTP_STATUS = { BAD_REQUEST: 400, UNAUTHORIZED: 401, FORBIDDEN: 403 } as const;
export const SEO_PARSE_ERROR = "Не удалось поставить задачу, повторите позже";

export async function startSeoParseJob(): Promise<ApiResult<SeoParseJobOutDto>> {
  try {
    const result = await postSeoParseJob({ provider: SEO_PARSE_PROVIDER });
    if (!isApiError(result)) return safeSeoResult(result);
    if (result.httpStatus === PARSE_HTTP_STATUS.FORBIDDEN) return apiError("Недостаточно прав");
    if (result.httpStatus === PARSE_HTTP_STATUS.UNAUTHORIZED) return apiError("Требуется авторизация");
    if (result.httpStatus === PARSE_HTTP_STATUS.BAD_REQUEST && typeof result.data.detail === STRING_TYPE && result.data.detail.trim()) {
      return safeSeoResult<SeoParseJobOutDto>(apiError(result.data.detail));
    }
    return safeSeoResult<SeoParseJobOutDto>(apiError(SEO_PARSE_ERROR));
  } catch {
    return apiError(SEO_PARSE_ERROR);
  }
}
