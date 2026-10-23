"use client";

import Link from "next/link";
import { Result, Spin } from "antd";
import { useYandexOAuthCallback } from "../hooks/useYandexOAuthCallback";

const PROCESSING = "processing";
const CANCELLED = "cancelled";

export function YandexOAuthCallback() {
  const { status, detail, hasOpener } = useYandexOAuthCallback();
  if (status === PROCESSING) return <Spin tip="Обработка авторизации"><span>Обработка авторизации</span></Spin>;
  const titles = {
    success: "Аккаунт добавлен",
    error: "Ошибка авторизации",
    cancelled: "Авторизация отменена",
  };
  const resultStatus = status === CANCELLED ? "warning" : status;
  const extra = !hasOpener ? <Link href="/seo">Перейти в раздел SEO</Link> : undefined;
  return <Result status={resultStatus} title={titles[status]} subTitle={detail} extra={extra} />;
}
