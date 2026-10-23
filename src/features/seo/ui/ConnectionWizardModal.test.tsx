import React, { useState } from "react";
import { act, fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { renderWithCmsProviders } from "@/test/render";
import { ConnectionWizardModal, type ConnectionWizardModalProps, type WizardTarget, type WizardTargetStepProps } from "./ConnectionWizardModal";
import { ConfirmActionModal } from "./ConfirmActionModal";

const account = {
  id: "a", yandex_id: "123", yandex_login: "test-login",
  display_name: "", email: null, yandex_phone: null,
};
const target: WizardTarget = {
  key: "custom", title: "Другая цель", stepTitle: "Выбор хоста",
  renderStep: ({ account: selected, onDone, onBack }) => (
    <>
      <span>Цель для {selected.yandex_login}</span>
      <button onClick={onDone}>Завершить</button>
      <button onClick={onBack}>Возврат из цели</button>
    </>
  ),
};
const renderAccountStep: ConnectionWizardModalProps["renderAccountStep"] = ({ selectedAccount, onSelect, onConnectionChange }) => (
  <>
    <span>Выбран: {selectedAccount?.yandex_login ?? "нет"}</span>
    <button aria-pressed={selectedAccount?.id === account.id} onClick={() => onSelect(account)}>Выбрать аккаунт</button>
    <button onClick={() => onSelect(null)}>Снять выбор</button>
    <button onClick={onConnectionChange}>Обновить привязку</button>
  </>
);

function Harness({ onDone, onConnectionChange }: { onDone: () => void; onConnectionChange: () => void }) {
  const [open, setOpen] = useState(true);
  const close = () => setOpen(false);
  const reopen = () => setOpen(true);
  return (
    <>
      <button onClick={reopen}>Открыть</button>
      <ConnectionWizardModal open={open} target={target} renderAccountStep={renderAccountStep} onCancel={close} onDone={onDone} onConnectionChange={onConnectionChange} />
    </>
  );
}

describe("FT-YX-08 reusable wizard", () => {
  it("requires account, renders custom target, preserves choice on both back controls and resets on close", async () => {
    const onDone = vi.fn();
    const onConnectionChange = vi.fn();
    renderWithCmsProviders(<Harness onDone={onDone} onConnectionChange={onConnectionChange} />);
    expect(screen.queryByRole("button", { name: "Далее" })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Выбрать аккаунт" }));
    expect(screen.getByText("Цель для test-login")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Выбор хоста" })).toHaveFocus();
    await userEvent.click(screen.getByRole("button", { name: "Возврат из цели" }));
    expect(screen.getByText("Выбран: test-login")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Выбрать аккаунт" })).toHaveFocus();
    await userEvent.click(screen.getByRole("button", { name: "Обновить привязку" }));
    expect(onConnectionChange).toHaveBeenCalledTimes(1);
    await userEvent.click(screen.getByRole("button", { name: "Выбрать аккаунт" }));
    await userEvent.click(screen.getByRole("button", { name: "Назад" }));
    expect(screen.getByText("Выбран: test-login")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Снять выбор" }));
    expect(screen.queryByRole("button", { name: "Далее" })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Выбрать аккаунт" }));
    await userEvent.click(screen.getByRole("button", { name: "Завершить" }));
    expect(onDone).toHaveBeenCalledTimes(1);
    await userEvent.click(screen.getByRole("button", { name: "Отмена" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    await userEvent.click(screen.getByRole("button", { name: "Открыть" }));
    expect(screen.getByText("Выбран: нет")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Далее" })).not.toBeInTheDocument();
  });

  it("guards navigation synchronously, releases busy and permits successful completion while busy", async () => {
    let controls!: WizardTargetStepProps;
    const renderStep = (props: WizardTargetStepProps) => {
      controls = props;
      return <span>Pending target: {String(props.busy)}</span>;
    };
    const onDone = vi.fn();
    const onCancel = vi.fn();
    const props = { target: { ...target, renderStep }, renderAccountStep, onCancel, onDone, onConnectionChange: vi.fn() };
    const { rerender } = renderWithCmsProviders(<ConnectionWizardModal open {...props} />);
    await userEvent.click(screen.getByRole("button", { name: "Выбрать аккаунт" }));
    const pendingChange = controls.onPendingChange;
    act(() => {
      controls.onPendingChange(true);
      controls.onBack();
    });
    expect(screen.getByText("Pending target: true")).toBeInTheDocument();
    expect(controls.onPendingChange).toBe(pendingChange);
    expect(screen.getByRole("button", { name: "Назад" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Отмена" })).toBeDisabled();
    expect(screen.queryByRole("button", { name: "Close" })).not.toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    const wrap = screen.getByRole("dialog").closest(".ant-modal-wrap")!;
    fireEvent.mouseDown(wrap);
    fireEvent.mouseUp(wrap);
    fireEvent.click(wrap);
    expect(onCancel).not.toHaveBeenCalled();
    act(() => controls.onPendingChange(false));
    expect(screen.getByRole("button", { name: "Назад" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Отмена" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
    act(() => {
      controls.onPendingChange(true);
      controls.onDone();
    });
    expect(onDone).toHaveBeenCalledOnce();
    rerender(<ConnectionWizardModal open={false} {...props} />);
    rerender(<ConnectionWizardModal open {...props} />);
    expect(screen.getByText("Выбран: нет")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Отмена" })).toBeEnabled();
    await userEvent.click(screen.getByRole("button", { name: "Выбрать аккаунт" }));
    expect(controls.busy).toBe(false);
  });

  it("resets even when closed externally then reopened", async () => {
    const props = { target, renderAccountStep, onCancel: vi.fn(), onDone: vi.fn(), onConnectionChange: vi.fn() };
    const { rerender } = renderWithCmsProviders(<ConnectionWizardModal open {...props} />);
    await userEvent.click(screen.getByRole("button", { name: "Выбрать аккаунт" }));
    rerender(<ConnectionWizardModal open={false} {...props} />);
    rerender(<ConnectionWizardModal open {...props} />);
    expect(screen.getByText("Выбран: нет")).toBeInTheDocument();
    expect(screen.queryByText("Цель для test-login")).not.toBeInTheDocument();
  });
});

describe("FT-YX-07 shared confirmation props", () => {
  it("renders text/warning/error and disables dismissal and confirmation while pending", async () => {
    const onCancel = vi.fn();
    const onConfirm = vi.fn();
    const props = { open: true, title: "Подтверждение", text: "Описание действия", warning: "Каскадное удаление", error: "Ошибка сервера", onCancel, onConfirm };
    const { rerender } = renderWithCmsProviders(<ConfirmActionModal {...props} pending />);
    expect(screen.getByText("Описание действия")).toBeInTheDocument();
    expect(screen.getByText("Каскадное удаление")).toBeInTheDocument();
    expect(screen.getByText("Ошибка сервера")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Подтвердить/ })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Отмена" })).toBeDisabled();
    await userEvent.keyboard("{Escape}");
    expect(onCancel).not.toHaveBeenCalled();
    rerender(<ConfirmActionModal {...props} pending={false} confirmDisabled />);
    expect(screen.getByRole("button", { name: /Подтвердить/ })).toBeDisabled();
    await userEvent.click(screen.getByRole("button", { name: "Отмена" }));
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });
});
