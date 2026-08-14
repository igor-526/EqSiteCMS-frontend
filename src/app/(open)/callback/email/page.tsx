"use client"

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button, Result, Spin } from "antd";
import Link from "next/link";
import { confirmEmail } from "@/api/email";

type Status = "loading" | "success" | "expired" | "used" | "not_found" | "no_code" | "error";

const EmailCallbackContent = () => {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<Status>("loading");
  const [detail, setDetail] = useState<string>("");

  useEffect(() => {
    const code = searchParams.get("code");

    if (!code) {
      setStatus("no_code");
      return;
    }

    const doConfirm = async () => {
      const result = await confirmEmail(code);

      if (result.ok) {
        setStatus("success");
        return;
      }

      switch (result.status) {
        case 410:
          setStatus("expired");
          setDetail("Срок действия ссылки истёк. Запросите новое подтверждение.");
          break;
        case 409:
          setStatus("used");
          setDetail("Ссылка уже была использована.");
          break;
        case 404:
          setStatus("not_found");
          setDetail("Неверная ссылка подтверждения.");
          break;
        default:
          setStatus("error");
          setDetail(result.detail || "Произошла ошибка. Попробуйте позже.");
      }
    };

    doConfirm();
  }, [searchParams]);

  if (status === "loading") {
    return (
      <div className="w-screen h-screen flex justify-center items-center">
        <Spin size="large" tip="Подтверждение email..." />
      </div>
    );
  }

  const resultMap: Record<Status, { status: "success" | "error" | "warning" | "info"; title: string; subTitle: string }> = {
    success: {
      status: "success",
      title: "Email подтверждён",
      subTitle: "Ваш email успешно подтверждён. Теперь вы будете получать уведомления.",
    },
    expired: {
      status: "warning",
      title: "Ссылка истекла",
      subTitle: detail,
    },
    used: {
      status: "warning",
      title: "Ссылка уже использована",
      subTitle: detail,
    },
    not_found: {
      status: "error",
      title: "Неверная ссылка",
      subTitle: detail,
    },
    no_code: {
      status: "error",
      title: "Отсутствует код подтверждения",
      subTitle: "Ссылка должна содержать параметр code.",
    },
    error: {
      status: "error",
      title: "Ошибка",
      subTitle: detail,
    },
    loading: {
      status: "info",
      title: "",
      subTitle: "",
    },
  };

  const result = resultMap[status];

  return (
    <div className="w-screen h-screen flex justify-center items-center">
      <Result
        status={result.status}
        title={result.title}
        subTitle={result.subTitle}
        extra={
          <Link href="/dashboard">
            <Button type="primary">Перейти в панель управления</Button>
          </Link>
        }
      />
    </div>
  );
};

const EmailCallbackPage = () => {
  return (
    <Suspense fallback={
      <div className="w-screen h-screen flex justify-center items-center">
        <Spin size="large" tip="Загрузка..." />
      </div>
    }>
      <EmailCallbackContent />
    </Suspense>
  );
};

export default EmailCallbackPage;
