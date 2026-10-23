import apiFetch, { addQueryParamsToUrl } from "./client";
import type {
  YandexAccountOutDto,
  YandexAccountsOutDto,
  YandexAccountsQueryInDto,
  YandexAuthCodeInDto,
  YandexAuthLinkOutDto,
  YandexMetricaConnectionOutDto,
  YandexMetricaConnectionResponseOutDto,
  YandexMetricaCountersOutDto,
  YandexMetricaCountersQueryInDto,
  YandexMetricaSetConnectionInDto,
} from "@/types/api/yandex";

export const getYandexAuthLink = () =>
  apiFetch<YandexAuthLinkOutDto>("/yandex/auth/link");

export const exchangeYandexAuthCode = (data: YandexAuthCodeInDto) =>
  apiFetch<YandexAccountOutDto>("/yandex/auth/code", {
    method: "POST",
    body: JSON.stringify({ code: data.code, state: data.state }),
  });

export const getYandexAccounts = (query: YandexAccountsQueryInDto = {}) =>
  apiFetch<YandexAccountsOutDto>(
    addQueryParamsToUrl("/yandex/accounts", {
      limit: query.limit,
      offset: query.offset,
      search: query.search,
    }),
  );

export const deleteYandexAccount = (accountId: string) =>
  apiFetch<null>(`/yandex/accounts/${encodeURIComponent(accountId)}`, {
    method: "DELETE",
  });

export const getYandexMetricaCounters = (
  query: YandexMetricaCountersQueryInDto,
) =>
  apiFetch<YandexMetricaCountersOutDto>(
    addQueryParamsToUrl("/yandex/metrica/counters", {
      account_id: query.account_id,
      limit: query.limit,
      offset: query.offset,
      search: query.search,
    }),
  );

export const getYandexMetricaConnection = () =>
  apiFetch<YandexMetricaConnectionResponseOutDto>("/yandex/metrica/connection");

export const setYandexMetricaConnection = (
  data: YandexMetricaSetConnectionInDto,
) =>
  apiFetch<YandexMetricaConnectionOutDto>("/yandex/metrica/connection", {
    method: "POST",
    body: JSON.stringify({
      yandex_account_id: data.yandex_account_id,
      counter_id: data.counter_id,
    }),
  });

export const deleteYandexMetricaConnection = () =>
  apiFetch<null>("/yandex/metrica/connection", { method: "DELETE" });
