export type YandexAccountOutDto = {
  id: string;
  yandex_id: string;
  yandex_login: string;
  display_name: string;
  email: string | null;
  yandex_phone: string | null;
};

export type YandexAccountsQueryInDto = {
  limit?: number;
  offset?: number;
  search?: string;
};

export type YandexAccountsOutDto = {
  items: YandexAccountOutDto[];
  total: number;
};

export type YandexMetricaCounterOutDto = {
  counter_id: number;
  site: string;
};

export type YandexMetricaCountersQueryInDto = YandexAccountsQueryInDto & {
  account_id: string;
};

export type YandexMetricaCountersOutDto = {
  items: YandexMetricaCounterOutDto[];
  total: number;
};

export type YandexMetricaConnectionOutDto = {
  id: string;
  counter_id: string;
  yandex_account: YandexAccountOutDto;
};

export type YandexMetricaConnectionResponseOutDto = {
  counter: YandexMetricaConnectionOutDto | null;
};

export type YandexMetricaSetConnectionInDto = {
  yandex_account_id: string;
  counter_id: string;
};

export type YandexAuthCodeInDto = {
  code: string;
  state: string;
};

export type YandexAuthLinkOutDto = {
  auth_link: string;
};
