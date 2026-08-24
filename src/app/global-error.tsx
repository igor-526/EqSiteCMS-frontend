"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

const capturedErrors = new WeakSet<Error>();

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (!capturedErrors.has(error)) {
      capturedErrors.add(error);
      Sentry.captureException(error);
    }
  }, [error]);

  return (
    <html lang="ru">
      <body>
        <main
          style={{
            alignItems: "center",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            justifyContent: "center",
            minHeight: "100vh",
            padding: "24px",
            textAlign: "center",
          }}
        >
          <h1>Что-то пошло не так</h1>
          <p>Попробуйте повторить действие. Если ошибка сохранится, обратитесь к администратору.</p>
          <button type="button" onClick={reset}>
            Повторить
          </button>
        </main>
      </body>
    </html>
  );
}
