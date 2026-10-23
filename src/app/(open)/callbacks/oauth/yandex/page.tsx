import { Suspense } from "react";
import { Spin } from "antd";
import { YandexOAuthCallback } from "@/features/seo/ui/YandexOAuthCallback";

export default function YandexOAuthCallbackPage() {
  return (
    <Suspense fallback={<Spin />}>
      <YandexOAuthCallback />
    </Suspense>
  );
}
