"use client";

import { Card, Space, Tabs, Typography } from "antd";
import { useState } from "react";
import { useNotifications } from "../hooks/useNotifications";
import { EmailCard } from "./EmailCard";
import { EmailModals } from "./EmailModals";
import { NotificationSettingsCard } from "./NotificationSettingsCard";

export function NotificationsPage() {
  const [activeTab, setActiveTab] = useState("history");
  const vm = useNotifications();

  const settings = (
    <Space direction="vertical" size="large" className="w-full">
      <EmailCard
        email={vm.email}
        loading={vm.emailLoading}
        error={vm.emailLoadError}
        pending={vm.emailPending}
        onCreate={() => vm.openEmailModal("create")}
        onChange={() => vm.openEmailModal("change")}
        onDelete={() => vm.setDeleteOpen(true)}
        onResend={vm.resendConfirmation}
      />
      <NotificationSettingsCard
        settings={vm.settings}
        loading={vm.settingsLoading}
        error={vm.settingsError}
        pendingKey={vm.settingPendingKey}
        onToggle={vm.toggleSetting}
      />
    </Space>
  );

  return (
    <>
      <Typography.Title level={2}>Уведомления</Typography.Title>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: "history",
            label: "История",
            children: <Card><Typography.Text type="secondary">История уведомлений появится позже.</Typography.Text></Card>,
          },
          { key: "settings", label: "Настройки", children: settings },
        ]}
      />
      <EmailModals
        mode={vm.emailModalMode}
        draft={vm.emailDraft}
        validationError={vm.emailValidationError}
        mutationError={vm.mutationError}
        pending={vm.emailPending}
        deleteOpen={vm.deleteOpen}
        email={vm.email}
        onDraftChange={vm.setEmailDraft}
        onClose={vm.closeEmailModal}
        onSubmit={vm.submitEmail}
        onDeleteClose={() => vm.setDeleteOpen(false)}
        onDelete={vm.deleteCurrentEmail}
      />
    </>
  );
}
