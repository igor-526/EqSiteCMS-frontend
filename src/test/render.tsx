import React from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { ConfigProvider } from "antd";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { PageTitleProvider } from "@/contexts/PageTitleContext";

type CmsRenderOptions = Omit<RenderOptions, "wrapper">;

const CmsProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ConfigProvider>
      <NotificationProvider>
        <PageTitleProvider>{children}</PageTitleProvider>
      </NotificationProvider>
    </ConfigProvider>
  );
};

export function renderWithCmsProviders(
  ui: React.ReactElement,
  options?: CmsRenderOptions,
) {
  return render(ui, { wrapper: CmsProviders, ...options });
}

export * from "@testing-library/react";
