import {
  deleteYandexAccount,
  deleteYandexMetricaConnection,
  exchangeYandexAuthCode,
  getYandexAccounts,
  getYandexAuthLink,
  getYandexMetricaConnection,
  getYandexMetricaCounters,
  setYandexMetricaConnection,
} from "@/api/yandex";
import type {
  YandexAccountsQueryInDto,
  YandexAuthCodeInDto,
  YandexMetricaCountersQueryInDto,
  YandexMetricaSetConnectionInDto,
} from "@/types/api/yandex";

// Keep ApiResult intact: hooks own loading/error state and permission guards.
export const fetchYandexAuthLink = () => getYandexAuthLink();
export const submitYandexAuthCode = (data: YandexAuthCodeInDto) =>
  exchangeYandexAuthCode(data);
export const fetchYandexAccounts = (query: YandexAccountsQueryInDto = {}) =>
  getYandexAccounts(query);
export const unlinkYandexAccount = (accountId: string) =>
  deleteYandexAccount(accountId);
export const fetchMetricaCounters = (query: YandexMetricaCountersQueryInDto) =>
  getYandexMetricaCounters(query);
export const fetchMetricaConnection = () => getYandexMetricaConnection();
export const bindMetricaCounter = (data: YandexMetricaSetConnectionInDto) =>
  setYandexMetricaConnection(data);
export const unlinkMetricaCounter = () => deleteYandexMetricaConnection();
